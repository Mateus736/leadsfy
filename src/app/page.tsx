import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-6 text-sm text-muted">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">
              Como funciona
            </a>
            <Link
              href="/login"
              className="rounded-xl border border-border px-4 py-2 font-medium hover:border-accent/50 transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="mb-4 inline-block rounded-full border border-border bg-card px-4 py-1 text-sm text-muted">
            Para freelancers
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Encontre clientes onde eles já estão pedindo ajuda — no{" "}
            <span className="text-accent">Reddit</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Leadsfy monitora subreddits relevantes e destaca posts de pessoas
            procurando freelancers, designers, devs e outros profissionais como
            você.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-accent px-8 py-3 font-medium text-white shadow-lg shadow-accent/25 hover:bg-accent-muted transition-colors"
            >
              Começar grátis
            </Link>
            <a
              href="#como-funciona"
              className="rounded-xl border border-border bg-card px-8 py-3 font-medium hover:border-accent/50 transition-colors"
            >
              Ver como funciona
            </a>
          </div>
        </section>

        <section
          id="como-funciona"
          className="border-t border-border bg-card/30 py-20"
        >
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center text-2xl font-semibold">Como funciona</h2>
            <ul className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Crie sua conta",
                  description:
                    "Cadastre-se gratuitamente e descreva o serviço que você oferece.",
                },
                {
                  step: "2",
                  title: "Busque leads",
                  description:
                    "Encontre posts de quem busca contratar ou precisa de um profissional.",
                },
                {
                  step: "3",
                  title: "Feche projetos",
                  description:
                    "Responda com contexto e transforme conversas do Reddit em clientes.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} Leadsfy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
