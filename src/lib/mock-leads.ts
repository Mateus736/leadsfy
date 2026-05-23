export type Urgency = "quente" | "morno";

export type LeadResult = {
  id: string;
  title: string;
  subreddit: string;
  urgency: Urgency;
  redditUrl: string;
  suggestedMessage: string;
};

export const MOCK_LEADS: LeadResult[] = [
  {
    id: "1",
    title: "Preciso de um dev React para landing page — orçamento flexível",
    subreddit: "r/forhire",
    urgency: "quente",
    redditUrl: "https://www.reddit.com/r/forhire/comments/example1/",
    suggestedMessage:
      "Olá! Vi seu post e trabalho com React/Next.js. Posso te mandar portfólio e um prazo estimado hoje mesmo, se quiser.",
  },
  {
    id: "2",
    title: "Alguém indica designer para identidade visual de startup?",
    subreddit: "r/startups",
    urgency: "morno",
    redditUrl: "https://www.reddit.com/r/startups/comments/example2/",
    suggestedMessage:
      "Oi! Sou designer focado em marcas para startups. Tenho cases parecidos com o que você descreveu — posso compartilhar por DM.",
  },
  {
    id: "3",
    title: "[Hiring] Freelancer para manutenção de site WordPress",
    subreddit: "r/Wordpress",
    urgency: "quente",
    redditUrl: "https://www.reddit.com/r/Wordpress/comments/example3/",
    suggestedMessage:
      "Boa tarde! Faço manutenção e melhorias em WordPress há anos. Me conta o escopo que monto uma proposta objetiva.",
  },
];
