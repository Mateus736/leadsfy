const ACTOR_ID = "trudax/reddit-scraper-lite";

export type ApifyJobStatus =
  | { status: "running" }
  | { status: "completed"; leads: LeadResult[]; total: number; subreddits: string }
  | { status: "failed"; error: string };

export type ApifyRun = {
  id?: string;
  status?: string;
  defaultDatasetId?: string;
};

export type ApifyRunResponse = {
  data?: ApifyRun;
};

import type { LeadResult } from "@/lib/reddit-leads";
import { mapPostToLead } from "@/lib/reddit-leads";
import { getSubredditsForRegion } from "@/lib/regions";
import { extractKeywords } from "@/lib/keywords";

export async function startRedditSearchJob(
  servico: string,
  regiao: string
): Promise<string> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) throw new Error("APIFY_API_KEY não configurada.");

  const subreddits = getSubredditsForRegion(regiao);
  const keywords = extractKeywords(servico, regiao);
  const urls = subreddits.flatMap((sub) =>
    keywords.map(
      (kw) =>
        `https://www.reddit.com/r/${sub}/search/?q=${encodeURIComponent(kw)}&sort=new&t=month`
    )
  );

  const body = {
    startUrls: urls.slice(0, 10).map((url) => ({ url })),
    maxItems: 50,
    skipComments: true,
    skipUserPosts: false,
    skipCommunity: true,
  };

  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify start failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const json: ApifyRunResponse = await res.json();
  const runId = json.data?.id;
  if (!runId) throw new Error("Apify não retornou run ID.");
  return runId;
}

export async function getRedditSearchJobStatus(
  runId: string,
  servico: string,
  regiao: string
): Promise<ApifyJobStatus> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) throw new Error("APIFY_API_KEY não configurada.");

  const runRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
  );
  if (!runRes.ok) throw new Error(`Apify run status failed (${runRes.status})`);
  const runJson: ApifyRunResponse = await runRes.json();
  const status = runJson.data?.status;

  if (status === "RUNNING" || status === "READY" || status === "STARTING") {
    return { status: "running" };
  }

  if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
    return { status: "failed", error: `Run ${status}` };
  }

  const datasetId = runJson.data?.defaultDatasetId;
  if (!datasetId) return { status: "failed", error: "Sem dataset ID" };

  const dataRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}&limit=100`
  );
  if (!dataRes.ok) throw new Error(`Apify dataset failed (${dataRes.status})`);
  const posts = await dataRes.json();

  const subreddits = getSubredditsForRegion(regiao);
  const leads: LeadResult[] = posts
    .map((p: Record<string, unknown>) => mapPostToLead(p, regiao))
    .filter((l: LeadResult | null): l is LeadResult => l !== null)
    .filter((l: LeadResult) => {
      const sub = l.subreddit?.replace("r/", "").toLowerCase();
      return subreddits.includes(sub);
    });

  return {
    status: "completed",
    leads,
    total: leads.length,
    subreddits: subreddits.join(", "),
  };
}