/**
 * Viral Sequence — aba de criação de carrossel estilo Twitter.
 *
 * Fluxo único (MVP — F-SV1):
 *   1. User digita briefing/tema do carrossel
 *   2. Clica "Gerar carrossel" → KAI cria 8 slides de copy (heading + body)
 *   3. Grid dos 8 slides aparece — cada um editável (heading, body, imagem)
 *   4. Por slide, user escolhe imagem: IA (stub) / Buscar (Unsplash) / Upload
 *   5. Autosave em sessionStorage — sobrevive a refresh
 *   6. Botões: Começar do zero, Exportar JSON (temporário), Publicar (em breve)
 *
 * Persistência real no Supabase do sequencia-viral fica pro Lovable plugar.
 * A camada storage.ts isola isso.
 */

import { useEffect, useState } from "react";
import {
  Sparkles,
  RotateCcw,
  Download,
  Send,
  Loader2,
  Twitter,
  ArrowRight,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Client } from "@/hooks/useClients";
import type { ViralCarousel, ViralProfile } from "./viral-sequence/types";
import { emptyCarousel } from "./viral-sequence/types";
import {
  saveCurrentCarousel,
  loadCurrentCarousel,
  clearCurrentCarousel,
} from "./viral-sequence/storage";
import { generateCarouselCopies } from "./viral-sequence/generateCopy";
import { SlideEditor } from "./viral-sequence/SlideEditor";

interface ViralSequenceTabProps {
  clientId: string;
  client: Client;
}

function buildInitialProfile(client: Client): ViralProfile {
  const sm = (client.social_media ?? {}) as Record<string, string>;
  const twitterHandle = sm.twitter ?? sm.x ?? "";
  const handle = twitterHandle.startsWith("@")
    ? twitterHandle
    : twitterHandle
      ? `@${twitterHandle.replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//, "").split("/")[0]}`
      : `@${client.name.toLowerCase().replace(/\s+/g, "")}`;
  return {
    name: client.name,
    handle,
    avatarUrl: client.avatar_url ?? undefined,
  };
}

export const ViralSequenceTab = ({ clientId, client }: ViralSequenceTabProps) => {
  const [carousel, setCarousel] = useState<ViralCarousel>(() => {
    const saved = loadCurrentCarousel();
    // Só reusa rascunho salvo se for do mesmo cliente
    if (saved && saved.clientId === clientId) return saved;
    return emptyCarousel(clientId, buildInitialProfile(client));
  });
  const [briefing, setBriefing] = useState(carousel.briefing ?? "");
  const [tone, setTone] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Autosave (debounced pela natureza de useEffect a cada render)
  useEffect(() => {
    saveCurrentCarousel(carousel);
  }, [carousel]);

  // Se trocar cliente no meio do caminho, reseta
  useEffect(() => {
    if (carousel.clientId !== clientId) {
      setCarousel(emptyCarousel(clientId, buildInitialProfile(client)));
      setBriefing("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const hasAnySlideFilled = carousel.slides.some(
    (s) => s.heading.trim() || s.body.trim(),
  );

  const handleGenerate = async () => {
    if (!briefing.trim()) {
      toast.error("Escreva um briefing/tema pra gerar.");
      return;
    }
    setIsGenerating(true);
    try {
      const { slides } = await generateCarouselCopies({
        clientId,
        briefing: briefing.trim(),
        tone: tone.trim() || undefined,
      });
      setCarousel((c) => ({
        ...c,
        title: briefing.trim().slice(0, 60),
        briefing: briefing.trim(),
        slides,
        updatedAt: new Date().toISOString(),
      }));
      toast.success("Carrossel gerado! Ajuste as copies e adicione imagens por slide.");
    } catch (err) {
      console.error("[ViralSequence] generate failed:", err);
      toast.error(`Falha na geração: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Descartar carrossel atual e começar do zero?")) return;
    clearCurrentCarousel();
    setCarousel(emptyCarousel(clientId, buildInitialProfile(client)));
    setBriefing("");
    setTone("");
    toast.success("Rascunho descartado.");
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(carousel, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carrossel-${carousel.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublishStub = () => {
    toast.info(
      "Publicar/Agendar: em breve — vai chamar a integração LATE (já disponível no KAI em outras áreas) direto daqui.",
      { duration: 4000 },
    );
  };

  const handleSaveStub = () => {
    toast.info(
      "Salvar no Supabase do Sequência Viral: em breve. Rascunho continua autosaved localmente (sobrevive a refresh).",
      { duration: 4000 },
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/60 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30">
            <Twitter className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Sequência Viral
              <span className="text-xs font-normal text-muted-foreground">·</span>
              <span className="text-xs font-normal text-muted-foreground">
                {client.name}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Carrossel estilo Twitter — KAI cria as copies, você escolhe a imagem de cada slide.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasAnySlideFilled && (
              <>
                <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Zerar
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJson} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveStub} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublishStub}
                  className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Send className="h-3.5 w-3.5" />
                  Publicar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Briefing */}
        <div className="bg-card border border-border/30 rounded-xl p-5 space-y-4 max-w-3xl mx-auto w-full">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Briefing do carrossel
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escreva o tema, ângulo e insights que você quer passar. Quanto mais específico, melhor.
            </p>
          </div>
          <Textarea
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            placeholder={`Ex: "Por que a maioria dos iniciantes em Bitcoin perde dinheiro nos primeiros 6 meses — traz 5 erros comuns + 1 hack que ninguém fala sobre self-custody."`}
            rows={4}
            className="text-sm resize-none"
            disabled={isGenerating}
          />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Tom (opcional): ex: direto, provocativo, técnico..."
                className="h-8 text-sm"
                disabled={isGenerating}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !briefing.trim()}
              className={cn(
                "gap-2 bg-sky-600 hover:bg-sky-700 text-white",
                hasAnySlideFilled && "bg-sky-600",
              )}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating
                ? "Gerando..."
                : hasAnySlideFilled
                  ? "Re-gerar"
                  : "Gerar carrossel"}
            </Button>
          </div>
        </div>

        {/* Grid de slides */}
        {hasAnySlideFilled ? (
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">Slides</h3>
              <span className="text-xs text-muted-foreground">
                · {carousel.slides.length} slides · autosalvando
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {carousel.slides.map((slide) => (
                <SlideEditor
                  key={slide.id}
                  slide={slide}
                  totalSlides={carousel.slides.length}
                  profile={carousel.profile}
                  onChange={(next) =>
                    setCarousel((c) => ({
                      ...c,
                      updatedAt: new Date().toISOString(),
                      slides: c.slides.map((s) => (s.id === next.id ? next : s)),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-xl mx-auto gap-4">
      <div className="p-4 rounded-full bg-sky-100 dark:bg-sky-900/20">
        <Twitter className="h-7 w-7 text-sky-600 dark:text-sky-400" />
      </div>
      <h3 className="text-base font-semibold">
        Escreva um briefing pra começar
      </h3>
      <p className="text-sm text-muted-foreground">
        O KAI vai gerar 8 slides estilo Twitter (hook + 6 insights + CTA).
        Você ajusta as copies e escolhe uma imagem por slide — gerada com IA,
        buscada no Unsplash, ou upload direto.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <span>Próximo passo:</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Escreva acima e clique em "Gerar carrossel"</span>
      </div>
    </div>
  );
}
