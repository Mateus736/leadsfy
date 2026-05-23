"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/logo";
import { saveUser } from "@/lib/auth";

const inputClassName =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground outline-none placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function validate(): boolean {
    if (!email.trim() || !password.trim()) {
      setError("Preencha e-mail e senha.");
      return false;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    setError("");
    return true;
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    saveUser(email);
    router.push("/dashboard");
  }

  function handleRegister() {
    if (!validate()) return;

    saveUser(email);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border px-6 py-4">
        <Logo />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <h1 className="text-2xl font-bold tracking-tight">Entrar no Leadsfy</h1>
            <p className="mt-2 text-sm text-muted">
              Acesse sua conta para buscar clientes no Reddit.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClassName}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-accent py-3 font-medium text-white hover:bg-accent-muted transition-colors"
              >
                Entrar
              </button>

              <button
                type="button"
                onClick={handleRegister}
                className="w-full rounded-xl border border-border py-3 font-medium hover:border-accent/50 hover:bg-card-hover transition-colors"
              >
                Cadastrar
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/" className="hover:text-foreground transition-colors">
              ← Voltar para a página inicial
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
