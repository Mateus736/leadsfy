export type SearchRegion = "internacional" | "ambos";

export const SEARCH_REGIONS: {
  value: SearchRegion;
  label: string;
  description: string;
  subreddits: string[];
}[] = [
  {
    value: "internacional",
    label: "🌍 Internacional (inglês)",
    description: "r/forhire, r/hireadev, r/forhiredesign",
    subreddits: ["forhire", "hireadev", "forhiredesign"],
  },
  {
    value: "ambos",
    label: "🌐 Todos os subreddits",
    description: "Máximo alcance",
    subreddits: [
      "forhire",
      "hireadev",
      "forhiredesign",
      "entrepreneur",
      "startups",
      "smallbusiness",
    ],
  },
];

export function getSubredditsForRegion(region: string): string[] {
  const found = SEARCH_REGIONS.find((r) => r.value === region);
  return found ? found.subreddits : ["forhire", "hireadev", "forhiredesign"];
}

export function parseSearchRegion(value: unknown): SearchRegion {
  if (value === "internacional" || value === "ambos") return value;
  return "internacional";
}
