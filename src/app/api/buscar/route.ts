
import { NextResponse } from "next/server";
import { getSubredditsForRegion, parseSearchRegion } from "@/lib/regions";
import { extractKeywords } from "@/lib/keywords";
const HIRING_KEYWORDS = [
  "hiring", "for hire", "[for hire]", "[hiring]", "need",
  "looking for", "want to hire", "seeking", "wanted",
  "commission", "paid", "budget", "freelancer", "job opportunity",
];

function scorePost(title: string, body: string): number {
  const text = (title + " " + body).toLowerCase();
  let score = 0;
  HIRING_KEYWORDS.forEach(k => { if (text.includes(k)) score += 2; });
  return Math.min(score, 10);
}

function generateMessage(title: string, subreddit: string): string {
  return `Hi! I saw your post in r/${subreddit} — "${title.slice(0, 60)}..." I specialize in exactly this. Would you be open to a quick chat?`;
}

async function searchSubreddit(sub: string, query: string) {
  try {
    const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=new&t=month&limit=25&restrict_sr=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Leadsfy/1.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.children ?? [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const servico = String(body.servico ?? "").trim();
    const regiao = parseSearchRegion(body.regiao ?? body.region ?? "internacional");

    if (!servico) {
      return NextResponse.json({ error: "Descreva seu serviço" }, { status: 400 });
    }

    const subreddits = getSubredditsForRegion(regiao);
    const queries = extractKeywords(servico);

    const allPosts: Record<string, unknown>[] = [];

    for (const sub of subreddits) {
      for (const query of queries.slice(0, 2)) {
        const posts = await searchSubreddit(sub, query);
        allPosts.push(...posts);
      }
    }

    const seen = new Set<string>();
    const leads = allPosts
      .map((p: Record<string, unknown>) => {
        const post = p.data as Record<string, unknown>;
        const title = String(post.title ?? "");
        const postBody = String(post.selftext ?? "");
        const subreddit = String(post.subreddit ?? "");
        const url = `https://www.reddit.com${post.permalink}`;
        const created = Number(post.created_utc ?? 0);
        const daysOld = (Date.now() / 1000 - created) / 86400;

        if (daysOld > 60) return null;
        if (title.length < 10) return null;
        if (seen.has(url)) return null;
        seen.add(url);

        const score = scorePost(title, postBody);
        if (score < 2) return null;

        return {
          title,
          body: postBody.slice(0, 300),
          subreddit: `r/${subreddit}`,
          url,
          upvotes: Number(post.ups ?? 0),
          score,
          urgency: score >= 6 ? "quente" : "morno",
          suggestedMessage: generateMessage(title, subreddit),
        };
      })
      .filter(Boolean)
      .sort((a: unknown, b: unknown) => (b as {score: number}).score - (a as {score: number}).score)
      .slice(0, 20);

    return NextResponse.json({
      status: "completed",
      leads,
      total: leads.length,
      subreddits: subreddits.join(", "),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}