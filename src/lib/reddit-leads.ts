import type { LeadResult, Urgency } from "@/lib/mock-leads";
import { hasHiringKeywordsInTitle } from "@/lib/keywords";

export type ApifyRedditPost = {
  id?: string;
  parsedId?: string;
  url?: string;
  title?: string;
  communityName?: string;
  body?: string;
  upVotes?: number;
  numberOfComments?: number;
  createdAt?: string;
  dataType?: string;
};

export function mapPostToLead(
  post: ApifyRedditPost,
  serviceDescription: string,
): LeadResult | null {
  if (post.dataType && post.dataType !== "post") return null;
  if (!post.title || !post.url) return null;

  const title = post.title.trim();

  if (!hasHiringKeywordsInTitle(title)) return null;

  const id = post.parsedId ?? post.id ?? post.url;
  const subreddit = post.communityName ?? "r/unknown";

  return {
    id,
    title,
    subreddit,
    urgency: calculateUrgency(post),
    redditUrl: post.url,
    suggestedMessage: buildSuggestedMessage(serviceDescription, title),
  };
}

function calculateUrgency(post: ApifyRedditPost): Urgency {
  const createdAt = post.createdAt ? new Date(post.createdAt).getTime() : 0;
  const hoursAgo = createdAt
    ? (Date.now() - createdAt) / (1000 * 60 * 60)
    : Infinity;

  const upVotes = post.upVotes ?? 0;
  const comments = post.numberOfComments ?? 0;
  const title = post.title ?? "";

  if (
    hoursAgo <= 48 ||
    upVotes >= 3 ||
    comments >= 2 ||
    /urgent|asap|hoje|urgente|\[hiring\]/i.test(title)
  ) {
    return "quente";
  }

  return "morno";
}

function buildSuggestedMessage(service: string, postTitle: string): string {
  const snippet = service.trim().slice(0, 120);
  return `Olá! Vi seu post "${postTitle.slice(0, 60)}${postTitle.length > 60 ? "..." : ""}" e posso ajudar. ${snippet ? `Trabalho com: ${snippet}.` : ""} Posso compartilhar portfólio e prazo por DM, se fizer sentido.`;
}

export function dedupeLeads(leads: LeadResult[]): LeadResult[] {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    if (seen.has(lead.id)) return false;
    seen.add(lead.id);
    return true;
  });
}
