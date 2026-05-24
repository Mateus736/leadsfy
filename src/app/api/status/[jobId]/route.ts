import { NextResponse } from "next/server";
import { getRedditSearchJobStatus } from "@/lib/apify";
import { getApifyApiKey, validateApifyApiKey } from "@/lib/env";
import { formatSubredditList, parseSearchRegion } from "@/lib/regions";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const apiKey = getApifyApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "APIFY_API_KEY não configurada no servidor." },
        { status: 500 },
      );
    }

    const keyError = validateApifyApiKey(apiKey);
    if (keyError) {
      return NextResponse.json({ error: keyError }, { status: 500 });
    }

    const { jobId } = await context.params;

    if (!jobId?.trim()) {
      return NextResponse.json({ error: "jobId inválido." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const servico = searchParams.get("servico")?.trim() ?? "";
    const regiao = parseSearchRegion(searchParams.get("regiao"));

    if (!servico) {
      return NextResponse.json(
        { error: "Parâmetro servico é obrigatório." },
        { status: 400 },
      );
    }

    const result = await getRedditSearchJobStatus(
      jobId.trim(),
      apiKey,
      servico,
      regiao,
      formatSubredditList(regiao),
    );

    return NextResponse.json({ jobId, ...result });
  } catch (error) {
    console.error("[api/status]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao consultar status da busca.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
