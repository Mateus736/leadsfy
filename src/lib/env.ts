/**
 * Lê APIFY_API_KEY no servidor (route handlers, Server Components).
 * No Next.js, variáveis em .env.local são carregadas automaticamente.
 */
export function getApifyApiKey(): string | undefined {
  const raw = process.env.APIFY_API_KEY;
  if (!raw) return undefined;

  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateApifyApiKey(apiKey: string): string | null {
  if (!apiKey.startsWith("apify_api_")) {
    return "APIFY_API_KEY inválida. Use o token pessoal da Apify (começa com apify_api_).";
  }
  return null;
}
