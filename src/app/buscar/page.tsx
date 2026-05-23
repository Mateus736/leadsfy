"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Urgency = "quente" | "morno";

type LeadResult = {
  id: string;
  title: string;
  subreddit: string;
  urgency: Urgency;
  suggestedMessage: string;
};

const MOCK_RESULTS: LeadResult[] = [
  {
    id: "1",
    title: "Preciso de um dev React para landing page — orçamento flexível",
    subreddit: "r/forhire",
    urgency: "quente",
    suggestedMessage:
      "Olá! Vi seu post e trabalho com React/Next.js. Posso te mandar portfólio e um prazo estimado hoje mesmo, se quiser.",
  },
  {
    id: "2",
    title: "Alguém indica designer para identidade visual de startup?",
    subreddit: "r/startups",
    urgency: "morno",
    suggestedMessage:
      "Oi! Sou designer focado em marcas para startups. Tenho cases parecidos com o que você descreveu — posso compartilhar por DM.",
  },
  {
    id: "3",
    title: "[Hiring] Freelancer para manutenção de site WordPress",
    subreddit: "r/Wordpress",
    urgency: "quente",
    suggestedMessage:
      "Boa tarde! Faço manutenção e melhorias em WordPress há anos. Me conta o escopo que monto uma proposta objetiva.",
  },
];

export default function BuscarPage() {
  const [service, setService] = useState("");
  const [results, setResults] = useState<LeadResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [messagePreview, setMessagePreview] = useState<string | null>(null);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service.trim()) return;

    setHasSearched(true);
    setResults(MOCK_RESULTS);
    setMessagePreview(null);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Leads<span className="text-accent">fy</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Buscar clientes no Reddit
        </h1>
        <p className="mt-2 text-muted">
          Descreva o serviço que você oferece e veja oportunidades relevantes.
        </p>

        <form onSubmit={handleSearch} className="mt-8 space-y-4">
          <div>
            <label htmlFor="service" className="mb-2 block text-sm font-medium">
              Seu serviço
            </label>
            <textarea
              id="service"
              rows={4}
              required
              placeholder="Ex.: Desenvolvo sites em Next.js para pequenas empresas..."
              value={service}
              onChange={(event) => setService(event.target.value)}
              className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-accent px-8 py-3 font-medium text-white shadow-sm hover:bg-accent-muted transition-colors"
          >
            Encontrar clientes
          </button>
        </form>

        {hasSearched && (
          <section className="mt-12" aria-live="polite">
            <h2 className="text-lg font-semibold">Resultados</h2>
            <p className="mt-1 text-sm text-muted">
              {results.length} oportunidades encontradas (dados de demonstração)
            </p>

            <ul className="mt-6 space-y-4">
              {results.map((lead) => (
                <li
                  key={lead.id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug">{lead.title}</h3>
                    <UrgencyBadge urgency={lead.urgency} />
                  </div>

                  <p className="mt-2 text-sm text-muted">{lead.subreddit}</p>

                  <button
                    type="button"
                    onClick={() => setMessagePreview(lead.suggestedMessage)}
                    className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-accent/30 transition-colors"
                  >
                    Ver mensagem sugerida
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {messagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMessagePreview(null)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-title"
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <h2 id="message-title" className="text-lg font-semibold">
              Mensagem sugerida
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {messagePreview}
            </p>
            <button
              type="button"
              onClick={() => setMessagePreview(null)}
              className="mt-6 w-full rounded-full bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-muted transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const isHot = urgency === "quente";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        isHot
          ? "bg-accent/15 text-accent"
          : "bg-amber-500/15 text-amber-700"
      }`}
    >
      {isHot ? "Quente" : "Morno"}
    </span>
  );
}
