export const STOP_WORDS = new Set([
  "a", "o", "e", "de", "da", "do", "das", "dos", "em", "no", "na", "nos",
  "nas", "um", "uma", "uns", "umas", "para", "com", "por", "que", "se",
  "ao", "aos", "sobre", "seu", "sua", "seus", "suas", "mais", "muito",
  "como", "mas", "também", "já", "só", "bem", "ainda",
]);

const SYNONYMS: Record<string, string[]> = {
  editor: ["editor", "edição", "editar", "montagem", "corte", "video editor", "video editing"],
  vídeo: ["video", "vídeo", "reels", "shorts", "youtube", "tiktok"],
  designer: ["designer", "design", "gráfico", "identidade visual", "logo", "branding"],
  dev: ["desenvolvedor", "developer", "programador", "programar", "código", "software"],
  site: ["site", "website", "landing page", "web", "frontend"],
  social: ["social media", "instagram", "redes sociais", "conteúdo", "marketing"],
  copy: ["copywriter", "copy", "texto", "redator", "conteúdo", "escrita"],
  foto: ["fotógrafo", "fotografia", "fotos", "photo"],
  tradutor: ["tradutor", "tradução", "translate", "translation"],
};

export function extractKeywords(servico: string, regiao: string): string[] {
  const normalized = servico
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

  const words = normalized
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const keywords = new Set<string>();

  for (const word of words) {
    keywords.add(word);
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (word.includes(key) || key.includes(word)) {
        syns.forEach((s) => keywords.add(s));
      }
    }
  }

  if (regiao === "brasil") {
    keywords.add("contratar");
    keywords.add("preciso");
    keywords.add("busco");
    keywords.add("procuro");
    keywords.add("freelancer");
  } else {
    keywords.add("hiring");
    keywords.add("for hire");
    keywords.add("need");
    keywords.add("looking for");
  }

  return Array.from(keywords).slice(0, 8);
}

export function hasHiringKeywordsInTitle(title: string, regiao = "internacional"): boolean {
  const t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (regiao === "brasil") {
    const ptKeywords = [
      "contratar", "contratando", "preciso", "procuro", "busco",
      "quero contratar", "vaga", "freelancer", "oportunidade",
      "precisamos", "buscamos", "procuramos",
    ];
    return ptKeywords.some((k) => t.includes(k));
  }

  const enKeywords = [
    "hiring", "for hire", "need", "looking for", "want", "seeking",
    "wanted", "required", "job", "opportunity", "commission",
  ];
  return enKeywords.some((k) => t.includes(k));
}

export function hasPortugueseMarkersInTitle(title: string): boolean {
  const t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const ptMarkers = [
    "de", "para", "com", "que", "nao", "um", "uma", "preciso",
    "busco", "quero", "como", "meu", "minha", "nosso", "nossa",
  ];
  return ptMarkers.some((m) => t.split(/\s+/).includes(m));
}