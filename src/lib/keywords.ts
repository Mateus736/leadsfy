import {
  getSubredditsForRegion,
  type SearchRegion,
} from "@/lib/regions";

const STOP_WORDS_PT = new Set([
  "a",
  "o",
  "e",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "um",
  "uma",
  "uns",
  "umas",
  "para",
  "com",
  "por",
  "que",
  "se",
  "ao",
  "aos",
  "como",
  "mais",
  "muito",
  "sobre",
  "seu",
  "sua",
  "seus",
  "suas",
  "meu",
  "minha",
  "trabalho",
  "trabalhos",
  "ofereço",
  "ofereco",
  "servico",
  "servicos",
  "desenvolvo",
  "crio",
  "facoo",
  "faco",
]);

const STOP_WORDS_EN = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "with",
  "to",
  "in",
  "on",
  "at",
  "of",
  "is",
  "are",
  "was",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "i",
  "we",
  "you",
  "they",
  "he",
  "she",
  "it",
  "my",
  "your",
  "our",
  "their",
  "this",
  "that",
  "these",
  "those",
  "from",
  "as",
  "by",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "offer",
  "offering",
  "provide",
  "providing",
  "work",
  "working",
  "services",
  "service",
]);

function getStopWords(region: SearchRegion): Set<string> {
  if (region === "brasil") return STOP_WORDS_PT;
  if (region === "internacional") return STOP_WORDS_EN;
  return new Set([...STOP_WORDS_PT, ...STOP_WORDS_EN]);
}

export function extractSearchQuery(
  service: string,
  region: SearchRegion,
): string {
  const stopWords = getStopWords(region);

  const words = service
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\W+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  const unique = [...new Set(words)].slice(0, 6);
  return unique.join(" ") || service.trim().slice(0, 80);
}

export function buildSubredditSearchUrls(
  query: string,
  region: SearchRegion,
): { url: string }[] {
  const encoded = encodeURIComponent(query);
  const subreddits = getSubredditsForRegion(region);

  return subreddits.map((subreddit) => ({
    url: `https://www.reddit.com/r/${subreddit}/search/?q=${encoded}&restrict_sr=1&sort=new&t=month`,
  }));
}

/** Palavras/frases que indicam intenção de contratação (título do post). */
const HIRING_TITLE_KEYWORDS = [
  "quero contratar",
  "for hire",
  "looking for",
  "contratar",
  "procuro",
  "preciso",
  "hiring",
  "need",
  "busco",
  "vaga",
  "freelancer",
] as const;

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Retorna true se o título contém alguma palavra de contratação. */
export function hasHiringKeywordsInTitle(title: string): boolean {
  const normalized = normalizeForMatch(title);
  return HIRING_TITLE_KEYWORDS.some((keyword) =>
    normalized.includes(normalizeForMatch(keyword)),
  );
}
