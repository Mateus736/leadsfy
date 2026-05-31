import type { LeadResult } from "@/lib/reddit-leads";

const REDDIT_BASE = "https://www.reddit.com";

export type ApifyJobStatus =
  | { status: "running" }
  | { status: "completed"; leads: LeadResult[]; total: number; subreddits: string }
  | { status: "failed"; error: string };

async function searchSubreddit(
  subreddit: string,
  query: string
): Promise<LeadResult[]> {
  try {
    const url = `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&t=month&limit=25&restrict_sr=1`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Leadsfy/1.0 (lead finder tool)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const posts = data?.data?.children ?? [];

    return posts
      .map((p: Record<string, unknown>) => {
        const post = p.data as Record<string, unknown>;
        const title = String(post.title ?? "");
        const body = String(post.selftext ?? "");
        const subredditName = String(post.subreddit ?? subreddit);
        const url = `https://www.reddit.com${post.permalink}`;
        const upvotes = Number(post.ups ?? 0);
        const created = Number(post.created_utc ?? 0);
        
        // Filtra posts muito antigos (mais de 60 dias)
        const daysOld = (Date.now() / 1000 - created) / 86400;
        if (daysOld > 60) return null;
        
        // Filtra posts sem conteúdo relevante
        if (title.length < 10) return null;

        const score = calculateScore(title, body);
        if (score < 4) return null;

        return {
          title,
          body: body.slice(0, 300),
          subreddit: `r/${subredditName}`,
          url,
          upvotes,
          score,
          urgency: score >= 7 ? "quente" : "morno",
          suggestedMessage: generateMessage(title, subredditName),
        } as LeadResult;
      })
      .filter(Boolean) as LeadResult[];
  } catch {
    return [];
  }
}

function calculateScore(title: string, body: string): number {
  const text = (title + " " + body).toLowerCase();
  let score = 0;

  const highValue = [
    "hiring", "for hire", "need", "looking for", "want to hire",
    "seeking", "wanted", "commission", "paid", "budget",
    "contractor", "freelancer", "job", "opportunity",
  ];

  const medValue = [
    "help", "recommend", "suggestion", "anyone", "who can",
    "does anyone", "can someone", "looking for someone",
  ];

  highValue.forEach(w => { if (text.includes(w)) score += 2; });
  medValue.forEach(w => { if (text.includes(w)) score += 1; });

  return Math.min(score, 10);
}

function generateMessage(title: string, subreddit: string): string {
  return `Hi! I saw your post in r/${subreddit} about "${title.slice(0, 60)}..." — I can help with that. I specialize in exactly this type of work. Would you be open to a quick chat?`;
}

// Job store simples em memória
const jobStore = new Map<string, ApifyJobStatus>();

export async function startRedditSearchJob(
  servico: string,
  regiao: string
): Promise<string> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  jobStore.set(jobId, { status: "running" });

  // Executa em background
  runSearch(jobId, servico, regiao);

  return jobId;
}

async function runSearch(jobId: string, servico: string, regiao: string) {
  try {
    const { getSubredditsForRegion } = await import("@/lib/regions");
    const subreddits = getSubredditsForRegion(regiao);
    
    // Gera queries baseadas no serviço
    const queries = generateQueries(servico);
    
    const allLeads: LeadResult[] = [];

    for (const sub of subreddits) {
      for (const query of queries.slice(0, 2)) {
        const leads = await searchSubreddit(sub, query);
        allLeads.push(...leads);
      }
    }

    // Remove duplicatas por URL
    const seen = new Set<string>();
    const unique = allLeads.filter(l => {
      if (seen.has(l.url)) return false;
      seen.add(l.url);
      return true;
    });

    // Ordena por score
    unique.sort((a, b) => b.score - a.score);

    jobStore.set(jobId, {
      status: "completed",
      leads: unique.slice(0, 20),
      total: unique.length,
      subreddits: subreddits.join(", "),
    });
  } catch (err) {
    jobStore.set(jobId, {
      status: "failed",
      error: String(err),
    });
  }
}

function generateQueries(servico: string): string[] {
  const base = servico.toLowerCase();
  const queries = [
    `[hiring] ${base}`,
    `looking for ${base}`,
    `need ${base}`,
    base,
  ];
  return queries;
}

export async function getRedditSearchJobStatus(
  jobId: string,
  _servico: string,
  _regiao: string
): Promise<ApifyJobStatus> {
  const status = jobStore.get(jobId);
  if (!status) return { status: "failed", error: "Job não encontrado" };
  return status;
}