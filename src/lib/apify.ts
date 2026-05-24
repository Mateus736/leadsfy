import { buildSubredditSearchUrls, extractSearchQuery } from "@/lib/keywords";
import type { SearchRegion } from "@/lib/regions";
import {
  dedupeLeads,
  mapPostToLead,
  type ApifyRedditPost,
} from "@/lib/reddit-leads";
import type { LeadResult } from "@/lib/mock-leads";

const ACTOR_ID = "trudax~reddit-scraper-lite";
const SYNC_TIMEOUT_SECS = 180;

function normalizeApiKey(apiKey: string): string {
  return apiKey.trim().replace(/^['"]|['"]$/g, "");
}

/** Apify aceita ?token= na URL (forma mais compatível) e Bearer no header. */
function apifyUrl(path: string, apiKey: string): string {
  const base = `https://api.apify.com/v2${path}`;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}token=${encodeURIComponent(normalizeApiKey(apiKey))}`;
}

function apifyHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${normalizeApiKey(apiKey)}`,
    "Content-Type": "application/json",
  };
}

type ApifyRunResponse = {
  data?: {
    status?: string;
    defaultDatasetId?: string;
  };
};

export async function searchRedditLeads(
  serviceDescription: string,
  apiKey: string,
  region: SearchRegion,
): Promise<LeadResult[]> {
  const query = extractSearchQuery(serviceDescription, region);
  const startUrls = buildSubredditSearchUrls(query, region);

  const actorInput = {
    startUrls,
    maxItems: 45,
    maxPostCount: 15,
    maxComments: 0,
    maxCommunitiesCount: 0,
    maxUserCount: 0,
    scrollTimeout: 40,
    proxy: {
      useApifyProxy: true,
    },
  };

  const items = await runActorAndGetItems(actorInput, apiKey);

  const allLeads = items
    .map((item) => mapPostToLead(item, serviceDescription))
    .filter((lead): lead is LeadResult => lead !== null);

  return dedupeLeads(allLeads).slice(0, 20);
}

async function runActorAndGetItems(
  input: Record<string, unknown>,
  apiKey: string,
): Promise<ApifyRedditPost[]> {
  const syncUrl = apifyUrl(
    `/acts/${ACTOR_ID}/run-sync-get-dataset-items?timeout=${SYNC_TIMEOUT_SECS}`,
    apiKey,
  );

  const syncResponse = await fetch(syncUrl, {
    method: "POST",
    headers: apifyHeaders(apiKey),
    body: JSON.stringify(input),
  });

  if (syncResponse.ok) {
    return parseDatasetItems(await syncResponse.json());
  }

  if (syncResponse.status !== 408 && syncResponse.status !== 504) {
    const errorText = await syncResponse.text();
    throw apifyHttpError(syncResponse.status, errorText);
  }

  return runActorAsync(input, apiKey);
}

async function runActorAsync(
  input: Record<string, unknown>,
  apiKey: string,
): Promise<ApifyRedditPost[]> {
  const runUrl = apifyUrl(`/acts/${ACTOR_ID}/runs?waitForFinish=60`, apiKey);

  const runResponse = await fetch(runUrl, {
    method: "POST",
    headers: apifyHeaders(apiKey),
    body: JSON.stringify(input),
  });

  if (!runResponse.ok) {
    const errorText = await runResponse.text();
    throw apifyHttpError(runResponse.status, errorText);
  }

  const runJson = (await runResponse.json()) as ApifyRunResponse;
  const run = runJson.data;

  if (!run?.defaultDatasetId) {
    throw new Error("Apify não retornou dataset do run.");
  }

  if (run.status === "RUNNING" || run.status === "READY") {
    return pollDataset(run.defaultDatasetId, apiKey, 24);
  }

  if (run.status !== "SUCCEEDED") {
    throw new Error(`Apify run terminou com status: ${run.status ?? "desconhecido"}`);
  }

  return fetchDatasetItems(run.defaultDatasetId, apiKey);
}

async function pollDataset(
  datasetId: string,
  apiKey: string,
  attempts: number,
): Promise<ApifyRedditPost[]> {
  for (let i = 0; i < attempts; i++) {
    await sleep(5000);
    const items = await fetchDatasetItems(datasetId, apiKey);
    if (items.length > 0) return items;
  }

  return fetchDatasetItems(datasetId, apiKey);
}

async function fetchDatasetItems(
  datasetId: string,
  apiKey: string,
): Promise<ApifyRedditPost[]> {
  const url = apifyUrl(`/datasets/${datasetId}/items?limit=50`, apiKey);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${normalizeApiKey(apiKey)}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw apifyHttpError(response.status, errorText);
  }

  return parseDatasetItems(await response.json());
}

function parseDatasetItems(payload: unknown): ApifyRedditPost[] {
  if (Array.isArray(payload)) return payload as ApifyRedditPost[];

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items: unknown }).items)
  ) {
    return (payload as { items: ApifyRedditPost[] }).items;
  }

  return [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function apifyHttpError(status: number, body: string): Error {
  if (status === 401) {
    return new Error(
      "Apify retornou 401 (não autorizado). Verifique se APIFY_API_KEY em .env.local é o token pessoal correto (apify_api_...) e reinicie o servidor.",
    );
  }
  return new Error(`Apify HTTP ${status}: ${body.slice(0, 300)}`);
}
