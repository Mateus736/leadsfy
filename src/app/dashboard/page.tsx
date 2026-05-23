"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LeadCard } from "@/components/lead-card";
import { Logo } from "@/components/logo";
import { MessageModal } from "@/components/message-modal";
import { clearUser, getUser } from "@/lib/auth";
import { MOCK_LEADS, type LeadResult } from "@/lib/mock-leads";

const inputClassName =
  "w-full resize-y rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [results, setResults] = useState<LeadResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
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

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service.trim()) return;

    setHasSearched(true);
    setResults(MOCK_LEADS);
    setMessagePreview(null);
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
              placeholder="Ex.: Desenvolvo sites em Next.js para pequenas empresas..."
              value={service}
              onChange={(event) => setService(event.target.value)}
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-accent px-8 py-3 font-medium text-white shadow-lg shadow-accent/20 hover:bg-accent-muted transition-colors"
          >
            Buscar clientes
          </button>
        </form>

        {hasSearched && (
          <section className="mt-12" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold">Resultados</h2>
              <p className="text-sm text-muted">
                {results.length} oportunidades (demonstração)
              </p>
            </div>

            <ul className="mt-6 grid gap-4 lg:grid-cols-1">
              {results.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onViewMessage={setMessagePreview}
                />
              ))}
            </ul>
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
