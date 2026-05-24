"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LeadCard } from "@/components/lead-card";
import { Logo } from "@/components/logo";
import { MessageModal } from "@/components/message-modal";
import { clearUser, getUser } from "@/lib/auth";
import type { LeadResult } from "@/lib/mock-leads";
import {
  formatSubredditList,
  SEARCH_REGIONS,
  type SearchRegion,
} from "@/lib/regions";

const inputClassName =
  "w-full resize-y rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [region, setRegion] = useState<SearchRegion>("brasil");
  const [results, setResults] = useState<LeadResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagePreview, setMessagePreview] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserEmail(user.email);
  }, [router]);

  function handleLogout() {
    clearUser();
    router.push("/login");
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setMessagePreview(null);
    setResults([]);

    try {
      const response = await fetch("/api/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servico: service.trim(), regiao: region }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível buscar leads.");
      }

      setResults(data.leads ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao buscar leads.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!userEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{userEmail}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-muted">
            Descreva seu serviço e encontre oportunidades no Reddit.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-8 max-w-2xl space-y-4">
          <div>
            <label htmlFor="service" className="mb-2 block text-sm font-medium">
              Seu serviço
            </label>
            <textarea
              id="service"
              rows={4}
              required
              disabled={isLoading}
              placeholder="Ex.: Desenvolvo sites em Next.js para pequenas empresas..."
              value={service}
              onChange={(event) => setService(event.target.value)}
              className={inputClassName}
            />
          </div>

          <fieldset>
            <legend className="mb-3 block text-sm font-medium">
              Idioma / região
            </legend>
            <div className="space-y-2">
              {SEARCH_REGIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    region === option.value
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="region"
                    value={option.value}
                    checked={region === option.value}
                    disabled={isLoading}
                    onChange={() => setRegion(option.value)}
                    className="mt-1 accent-accent"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-accent px-8 py-3 font-medium text-white shadow-lg shadow-accent/20 hover:bg-accent-muted transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Buscando no Reddit..." : "Buscar clientes"}
          </button>
        </form>

        {hasSearched && (
          <section className="mt-12" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold">Resultados</h2>
              {!isLoading && !error && (
                <p className="text-sm text-muted">
                  {results.length}{" "}
                  {results.length === 1
                    ? "oportunidade encontrada"
                    : "oportunidades encontradas"}
                </p>
              )}
            </div>

            {isLoading && (
              <p className="mt-6 text-sm text-muted">
                Buscando posts em {formatSubredditList(region)}... Isso pode
                levar até 2 minutos.
              </p>
            )}

            {error && (
              <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {!isLoading && !error && results.length === 0 && (
              <p className="mt-6 text-sm text-muted">
                Nenhum lead encontrado para essa descrição. Tente usar outras
                palavras-chave do seu serviço.
              </p>
            )}

            {!isLoading && results.length > 0 && (
              <ul className="mt-6 grid gap-4">
                {results.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onViewMessage={setMessagePreview}
                  />
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {messagePreview && (
        <MessageModal
          message={messagePreview}
          onClose={() => setMessagePreview(null)}
        />
      )}
    </div>
  );
}
