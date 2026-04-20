/**
 * Geração de copies de carrossel Twitter via edge function `kai-content-agent`.
 *
 * Pede pro KAI 8 slides no formato JSON estrito. Parser tolerante — aceita
 * JSON sujo com markdown/texto antes, extrai o primeiro array válido.
 *
 * Retorna sempre 8 slides (completa com vazios se a IA devolver menos).
 */

import { supabase } from "@/integrations/supabase/client";
import type { ViralSlide } from "./types";
import { emptySlide } from "./types";

const TARGET_SLIDES = 8;

interface GenerateCopyInput {
  clientId: string;
  briefing: string;
  tone?: string; // ex: "direto, provocativo"
  additionalContext?: string;
}

interface GeneratedSlideRaw {
  heading?: string;
  title?: string;
  body?: string;
  text?: string;
  content?: string;
}

function buildPrompt(input: GenerateCopyInput): string {
  const { briefing, tone, additionalContext } = input;
  return [
    "Você vai gerar um carrossel de 8 slides estilo Twitter (thread que vira carrossel Instagram) sobre o tema abaixo.",
    "",
    `TEMA/BRIEFING: ${briefing}`,
    tone ? `\nTOM: ${tone}` : "",
    additionalContext ? `\nCONTEXTO ADICIONAL:\n${additionalContext}` : "",
    "",
    "REGRAS DOS SLIDES:",
    "- 8 slides no total.",
    "- Slide 1 (capa): hook irresistível + promessa clara. heading curto e grande. body opcional (máx 1 frase).",
    "- Slides 2-7: desenvolvem ideia com UM insight por slide. heading = frase-chave bold, body = 1-3 linhas explicando.",
    "- Slide 8 (CTA): chamada pra ação (comentar, salvar, compartilhar). heading provocativo.",
    "- Todo slide cabe num tweet: heading ≤ 80 caracteres, body ≤ 280 caracteres.",
    "- Linguagem informal, direta, em pt-BR. Nada genérico ou corporativo.",
    "- Pode usar **negrito** inline pra destacar uma palavra-chave por slide.",
    "- NÃO use hashtags (é carrossel, não post).",
    "- NÃO numere os slides no heading/body — a numeração é automática.",
    "",
    "FORMATO DE SAÍDA: APENAS um array JSON válido, sem texto antes nem depois.",
    "Cada item: { \"heading\": string, \"body\": string }",
    "",
    "Exemplo:",
    '[{"heading":"Hook forte aqui","body":"Uma frase que aprofunda o hook."},{"heading":"Slide 2...","body":"..."}]',
    "",
    "Agora gera os 8 slides pro tema acima.",
  ].filter(Boolean).join("\n");
}

function extractJsonArray(text: string): unknown[] | null {
  // Remove code fences ```json ... ```
  const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  // Procura primeiro `[` e último `]`
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  const slice = cleaned.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeSlides(raw: unknown[]): ViralSlide[] {
  const slides: ViralSlide[] = [];
  for (let i = 0; i < raw.length && i < TARGET_SLIDES; i++) {
    const item = raw[i] as GeneratedSlideRaw;
    const heading = item.heading ?? item.title ?? "";
    const body = item.body ?? item.text ?? item.content ?? "";
    slides.push({
      ...emptySlide(i + 1),
      heading: typeof heading === "string" ? heading.trim() : "",
      body: typeof body === "string" ? body.trim() : "",
    });
  }
  // Completa até 8 slides se vier menos
  while (slides.length < TARGET_SLIDES) {
    slides.push(emptySlide(slides.length + 1));
  }
  return slides;
}

export async function generateCarouselCopies(
  input: GenerateCopyInput,
): Promise<{ slides: ViralSlide[]; raw: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("Não autenticado");

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kai-content-agent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        clientId: input.clientId,
        request: buildPrompt(input),
        format: "twitter",
        platform: "twitter",
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`KAI agent ${response.status}: ${err.slice(0, 200)}`);
  }

  // Consome SSE stream acumulando tudo
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Resposta sem body");
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data: ")) continue;
      const json = t.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) fullText += content;
      } catch {
        /* ignora linhas parcialmente buffered */
      }
    }
  }

  const arr = extractJsonArray(fullText);
  if (!arr) {
    throw new Error(
      "Não consegui extrair JSON da resposta do KAI. Texto bruto:\n" +
        fullText.slice(0, 500),
    );
  }
  return { slides: normalizeSlides(arr), raw: fullText };
}
