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

export function getSubredditsForRegion(region: SearchRegion): string[] {
  const config = SEARCH_REGIONS.find((r) => r.value === region);
  return config?.subreddits ?? SEARCH_REGIONS[0].subreddits;
}

export function getRegionLabel(region: SearchRegion): string {
  return SEARCH_REGIONS.find((r) => r.value === region)?.label ?? region;
}

export function formatSubredditList(region: SearchRegion): string {
  return getSubredditsForRegion(region)
    .map((s) => `r/${s}`)
    .join(", ");
}
