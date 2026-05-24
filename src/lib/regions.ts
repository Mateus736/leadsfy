export type SearchRegion = "brasil" | "internacional" | "ambos";

export const SEARCH_REGIONS: {
  value: SearchRegion;
  label: string;
  description: string;
  subreddits: string[];
}[] = [
  {
    value: "brasil",
    label: "🌎 Brasil (português)",
    description: "r/brdev, r/empreendedorismo, r/designers, r/freelancers",
    subreddits: ["brdev", "empreendedorismo", "designers", "freelancers"],
  },
  {
    value: "internacional",
    label: "🌍 Internacional (inglês)",
    description: "r/forhire, r/hireadev, r/forhiredesign",
    subreddits: ["forhire", "hireadev", "forhiredesign"],
  },
  {
    value: "ambos",
    label: "🌐 Ambos",
    description: "Todos os subreddits acima",
    subreddits: [
      "brdev",
      "empreendedorismo",
      "designers",
      "freelancers",
      "forhire",
      "hireadev",
      "forhiredesign",
    ],
  },
];

export function parseSearchRegion(value: unknown): SearchRegion {
  if (value === "brasil" || value === "internacional" || value === "ambos") {
    return value;
  }
  return "brasil";
}

export const BRAZIL_SUBREDDITS = [
  "brdev",
  "empreendedorismo",
  "designers",
  "freelancers",
] as const;

export const INTERNATIONAL_SUBREDDITS = [
  "forhire",
  "hireadev",
  "forhiredesign",
] as const;

export function getSubredditsForRegion(region: SearchRegion): string[] {
  if (region === "brasil") return [...BRAZIL_SUBREDDITS];
  if (region === "internacional") return [...INTERNATIONAL_SUBREDDITS];
  return [...BRAZIL_SUBREDDITS, ...INTERNATIONAL_SUBREDDITS];
}

export function normalizeSubredditName(
  communityName: string | undefined,
): string | null {
  if (!communityName) return null;
  const name = communityName.trim().toLowerCase().replace(/^r\//, "");
  return name.length > 0 ? name : null;
}

/** Garante que o post veio de um subreddit da região selecionada. */
export function isPostFromRegionSubreddit(
  communityName: string | undefined,
  region: SearchRegion,
  parsedCommunityName?: string,
): boolean {
  const subreddit =
    normalizeSubredditName(communityName) ??
    normalizeSubredditName(parsedCommunityName);
  if (!subreddit) return false;

  const allowed = new Set(
    getSubredditsForRegion(region).map((s) => s.toLowerCase()),
  );
  return allowed.has(subreddit);
}

export function getRegionLabel(region: SearchRegion): string {
  return SEARCH_REGIONS.find((r) => r.value === region)?.label ?? region;
}

export function formatSubredditList(region: SearchRegion): string {
  return getSubredditsForRegion(region)
    .map((s) => `r/${s}`)
    .join(", ");
}
