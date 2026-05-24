import { buildSubredditSearchUrls, extractSearchQuery } from "@/lib/keywords";
import type { SearchRegion } from "@/lib/regions";
import {
  dedupeLeads,
  mapPostToLead,
  type ApifyRedditPost,
} from "@/lib/reddit-leads";
import type { LeadResult } from "@/lib/mock-leads";

const ACTOR_ID = "trudax~reddit-scraper-lite";

export type ApifyJobStatus =
  | { status: "running" }
  | {
      status: "completed";
      leads: LeadResult[];
      total: number;
      subreddits: string;
    }
  | { status: "failed"; error: string };

type ApifyRun = {
  id?: string;
  status?: string;
  defaultDatasetId?: string;
};

type ApifyRunResponse = {
  data?: ApifyRun;
};

function normalizeApiKey(apiKey: string): string {
  return apiKey.trim().replace(/^['"]|['"]$/g, "");
}

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

function buildActorInput(serviceDescription: string, region: SearchRegion) {
  const query = extractSearchQuery(serviceDescription, region);
  const startUrls = buildSubredditSearchUrls(query, region);

  return {
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
}

/** Inicia run no Apify sem aguardar conclusão. Retorna o run ID (job_id). */
export async function startRedditSearchJob(
  serviceDescription: string,
  apiKey: string,
  region: SearchRegion,
): Promise<string> {
  const input = buildActorInput(serviceDescription, region);
  const runUrl = apifyUrl(`/acts/${ACTOR_ID}/runs`, apiKey);

  const response = await fetch(runUrl, {
    method: "POST",
    headers: apifyHeaders(apiKey),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw apifyHttpError(response.status, errorText);
  }

  const json = (await response.json()) as ApifyRunResponse;
  const runId = json.data?.id;

  if (!runId) {
    throw new Error("Apify não retornou o ID do run.");
  }

  return runId;
}

/** Consulta status do run e retorna leads quando concluído. */
export async function getRedditSearchJobStatus(
  jobId: string,
  apiKey: string,
  serviceDescription: string,
  region: SearchRegion,
  subredditsLabel: string,
): Promise<ApifyJobStatus> {
  const runUrl = apifyUrl(`/actor-runs/${jobId}`, apiKey);

  const response = await fetch(runUrl, {
    headers: { Authorization: `Bearer ${normalizeApiKey(apiKey)}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw apifyHttpError(response.status, errorText);
  }

  const json = (await response.json()) as ApifyRunResponse;
  const run = json.data;
  const runStatus = run?.status ?? "UNKNOWN";

  if (runStatus === "RUNNING" || runStatus === "READY") {
    return { status: "running" };
  }

  if (
    runStatus === "FAILED" ||
    runStatus === "ABORTED" ||
    runStatus === "TIMED-OUT"
  ) {
    return {
      status: "failed",
      error: `Busca no Reddit falhou (status: ${runStatus}).`,
    };
  }

  if (runStatus !== "SUCCEEDED") {
    return {
      status: "failed",
      error: `Status inesperado do Apify: ${runStatus}`,
    };
  }

  if (!run?.defaultDatasetId) {
    return {
      status: "failed",
      error: "Run concluído sem dataset de resultados.",
    };
  }

  const items = await fetchDatasetItems(run.defaultDatasetId, apiKey);
  const leads = items
    .map((item) => mapPostToLead(item, serviceDescription))
    .filter((lead): lead is LeadResult => lead !== null);

  const deduped = dedupeLeads(leads).slice(0, 20);

  return {
    status: "completed",
    leads: deduped,
    total: deduped.length,
    subreddits: subredditsLabel,
  };
}

async function fetchDatasetItems(
  datasetId: string,
  apiKey: string,
): Promise<ApifyRedditPost[]> {
  const url = apifyUrl(`/datasets/${datasetId}/items?limit=50`, apiKey);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${normalizeApiKey(apiKey)}` },
    cache: "no-store",
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

function apifyHttpError(status: number, body: string): Error {
  if (status === 401) {
    return new Error(
      "Apify retornou 401 (não autorizado). Verifique se APIFY_API_KEY em .env.local é o token pessoal correto (apify_api_...) e reinicie o servidor.",
    );
  }
  return new Error(`Apify HTTP ${status}: ${body.slice(0, 300)}`);
}
