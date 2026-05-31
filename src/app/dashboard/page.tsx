"use client";

import { useState } from "react";
import Link from "next/link";
import { SEARCH_REGIONS } from "@/lib/regions";

interface Lead {
  title: string;
  body: string;
  subreddit: string;
  url: string;
  upvotes: number;
  score: number;
  urgency: string;
  suggestedMessage: string;
}

export default function Dashboard() {
  const [servico, setServico] = useState("");
  const [regiao, setRegiao] = useState("internacional");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  async function handleSearch() {
    if (!servico.trim()) return;
    setIsSearching(true);
    setError("");
    setLeads([]);
    setTotal(0);

    try {
      const res = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servico, regiao }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro na busca.");
      }

      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold">
          Leads<span className="text-accent">fy</span>
        </Link>
        <Link href="/" className="text-sm text-muted">Voltar</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted mb-8">Descreva seu serviço e encontre oportunidades no Reddit.</p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Seu serviço</label>
          <textarea
            className="w-full rounded-xl border border-border bg-card p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            rows={3}
            placeholder="Ex: video editor, graphic designer, web developer, copywriter..."
            value={servico}
            onChange={(e) => setServico(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Idioma / região</label>
          <div className="flex flex-col gap-2">
            {SEARCH_REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRegiao(r.value)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  regiao === r.value
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="font-medium text-sm">{r.label}</div>
                <div className="text-xs text-muted mt-1">{r.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching || !servico.trim()}
          className="w-full py-3 rounded-xl bg-accent text-white font-semibold disabled:opacity-50 transition-all hover:opacity-90"
        >
          {isSearching ? "Buscando no Reddit..." : "Encontrar clientes"}
        </button>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {leads.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Resultados</h2>
              <span className="text-sm text-muted">{total} oportunidades encontradas</span>
            </div>
            <div className="flex flex-col gap-4">
              {leads.map((lead, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted">{lead.subreddit}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      lead.urgency === "quente"
                        ? "bg-accent/20 text-accent"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {lead.urgency?.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-3">{lead.title}</h3>
                  <div className="flex gap-2">
                    
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-card/80 transition-all"
                    >
                      Abrir no Reddit
                    </a>
                    <button
                      onClick={() => setSelectedMessage(
                        selectedMessage === lead.suggestedMessage ? null : lead.suggestedMessage
                      )}
                      className="px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm hover:bg-accent/30 transition-all"
                    >
                      Ver mensagem sugerida
                    </button>
                  </div>
                  {selectedMessage === lead.suggestedMessage && (
                    <div className="mt-3 p-3 rounded-lg bg-background border border-border text-sm text-muted">
                      {lead.suggestedMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && leads.length === 0 && !error && servico && (
          <div className="mt-8 text-center text-muted text-sm">
            Nenhum lead encontrado. Tente outras palavras-chave.
          </div>
        )}
      </main>
    </div>
  );
}