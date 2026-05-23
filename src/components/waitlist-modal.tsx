"use client";

import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "leadsfy-waitlist-email";
const SUCCESS_MESSAGE = "Você entrou na lista! Te avisaremos em breve.";

type WaitlistModalProps = {
  triggerLabel: string;
  triggerClassName?: string;
};

export function WaitlistModal({
  triggerLabel,
  triggerClassName,
}: WaitlistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function openModal() {
    setSuccess(false);
    setEmail("");
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    localStorage.setItem(STORAGE_KEY, trimmed);
    setSuccess(true);
  }

  return (
    <>
      <button type="button" onClick={openModal} className={triggerClassName}>
        {triggerLabel}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-foreground/40"
            onClick={closeModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-title"
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            {success ? (
              <div className="text-center">
                <p className="text-lg font-semibold text-accent">
                  {SUCCESS_MESSAGE}
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-6 rounded-full bg-accent px-6 py-2.5 font-medium text-white hover:bg-accent-muted transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <h2 id="waitlist-title" className="text-xl font-semibold">
                  Entrar na lista de espera
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Deixe seu e-mail e avisaremos quando o Leadsfy estiver
                  disponível.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="waitlist-email" className="sr-only">
                      E-mail
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      autoFocus
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-full border border-border px-4 py-2.5 font-medium hover:border-accent/30 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-full bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-muted transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
