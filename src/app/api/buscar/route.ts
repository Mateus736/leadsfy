import { NextResponse } from "next/server";
import { searchRedditLeads } from "@/lib/apify";
import { getApifyApiKey, validateApifyApiKey } from "@/lib/env";
import { formatSubredditList, parseSearchRegion } from "@/lib/regions";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const apiKey = getApifyApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "APIFY_API_KEY não configurada. Crie .env.local na raiz do projeto e reinicie o servidor (npm run dev).",
        },
        { status: 500 },
      );
    }

    const keyError = validateApifyApiKey(apiKey);
    if (keyError) {
      return NextResponse.json({ error: keyError }, { status: 500 });
    }

    const body = await request.json();
    const servico =
      typeof body.servico === "string"
        ? body.servico.trim()
        : typeof body.service === "string"
          ? body.service.trim()
          : "";

    if (!servico) {
      return NextResponse.json(
        { error: "Informe a descrição do seu serviço." },
        { status: 400 },
      );
    }

    const regiao = parseSearchRegion(body.regiao ?? body.region);

    const leads = await searchRedditLeads(servico, apiKey, regiao);

    return NextResponse.json({
      leads,
      query: servico,
      regiao,
      subreddits: formatSubredditList(regiao),
      total: leads.length,
    });
  } catch (error) {
    console.error("[api/buscar]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao buscar leads no Reddit.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
