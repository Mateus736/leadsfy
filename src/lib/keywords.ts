const SERVICE_EXPANSIONS: Record<string, string[]> = {
  editor: ["video editor", "video editing", "content editor", "editor for hire", "video production"],
  video: ["video editor", "video editing", "videographer", "video production", "content creator"],
  designer: ["graphic designer", "graphic design", "logo designer", "brand designer", "visual designer"],
  logo: ["logo designer", "logo design", "brand identity", "branding designer"],
  dev: ["web developer", "software developer", "developer for hire", "programmer", "coder"],
  developer: ["web developer", "software developer", "developer for hire", "full stack developer"],
  web: ["web developer", "web designer", "website developer", "frontend developer"],
  code: ["software developer", "programmer", "coder for hire", "developer"],
  copy: ["copywriter", "content writer", "copywriting", "writer for hire"],
  writer: ["copywriter", "content writer", "ghostwriter", "freelance writer"],
  social: ["social media manager", "social media marketing", "content creator", "instagram manager"],
  marketing: ["marketing specialist", "digital marketing", "marketing consultant", "social media manager"],
  photo: ["photographer", "photography", "photo editor", "product photographer"],
  seo: ["seo specialist", "seo expert", "search engine optimization", "seo consultant"],
  translate: ["translator", "translation services", "freelance translator"],
  animator: ["animator", "animation", "motion graphics", "2d animator", "3d animator"],
  music: ["music producer", "audio engineer", "music composer", "sound designer"],
};

export function extractKeywords(servico: string): string[] {
  const normalized = servico
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  const keywords = new Set<string>();

  // Adiciona o termo original
  keywords.add(normalized);

  // Expande termos conhecidos
  for (const [key, expansions] of Object.entries(SERVICE_EXPANSIONS)) {
    if (normalized.includes(key)) {
      expansions.forEach(e => keywords.add(e));
    }
  }

  // Se não achou expansão, tenta variações simples
  if (keywords.size === 1) {
    keywords.add(`${normalized} for hire`);
    keywords.add(`hiring ${normalized}`);
    keywords.add(`need ${normalized}`);
    keywords.add(`looking for ${normalized}`);
  }

  return Array.from(keywords).slice(0, 6);
}

export function hasHiringKeywordsInTitle(title: string): boolean {
  const t = title.toLowerCase();
  const keywords = [
    "hiring", "for hire", "[for hire]", "[hiring]", "need",
    "looking for", "want to hire", "seeking", "wanted",
    "commission", "budget", "freelancer", "opportunity",
  ];
  return keywords.some(k => t.includes(k));
}