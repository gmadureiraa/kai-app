## Diagnóstico

Comparei o `template-twitter.tsx` do repo `gmadureiraa/sequencia-viral` (commit `4ef43003`, "audit editor=preview 100% sincronizado") com o nosso `src/components/kai/viral-sequence/TwitterSlide.tsx` e com o slide que ficou salvo em `viral_carousels/428d5af4...`.

**Padrão correto do Madureira (single-layout, sem variantes):**
1. Card branco (ou dark) com border `2px solid #e5e7eb`, radius `44px`, padding generoso.
2. Header: avatar **redondo 100px** (foto real do perfil) + nome bold + **selo verified azul (#1D9BF0)** + `@handle` em cinza + contador `n/total` no topo direito.
3. Body: parágrafo único, Inter 39px, hierarquia via `**bold**` inline.
4. Imagem opcional **ABAIXO do texto** (não como cover/overlay), border `1px solid #e5e7eb`, radius 20.
5. **Sem CTA hardcoded**, sem "action bar", sem variantes editoriais, sem cover-overlay com gradient. Mesma estrutura do slide 1 ao slide N.
6. Twitter dark detectado por luminância (`isTwitterDark`) — alterna texto.

**Problemas no nosso template + edge function:**

| Item | Madureira | Nosso (atual) |
|---|---|---|
| Variantes de layout | Layout único | Tem `imageAsCover`, `editorial.kicker/headline/credit`, overlay 6 níveis, modo "capa de jornal" |
| Avatar | Foto real, sempre | Cliente Jornal Cripto sem `avatar_url` → renderiza `J` em gradient azul. Edge function nunca buscou logo do site nem ofereceu fallback. |
| Imagem no slide | Sempre abaixo do texto | Quando `imageAsCover=true` (default da edge no slide 1), vira overlay. |
| Imagem real | Vem do briefing/scrape | Edge function gerou **SVG indigo gradient** (`buildFallbackCover`) porque a UI/chamada interna não passou `coverImageUrl`. O preview salvo confirma: `image.kind:"fallback"`. |
| Negrito | `**palavra**` | Igual ✓ |
| Auto-shrink | Não tem (font fixa 39px, layout decide) | Tem curva 1.0 → 0.72. Pode ficar, é uma boa adição compatível. |

**Resultado que o usuário viu:** slide com gradient indigo de fundo + texto branco centralizado, sem avatar, sem imagem do artigo, sem cara de tweet — basicamente o **layout cover/editorial**, não o template Twitter.

## Plano de execução

### 1. Refatorar `TwitterSlide.tsx` — voltar ao layout único

- **Remover** branches `imageAsCover`, `editorial`, `coverTextStyle`, `coverPosition`, `coverOverlay`, `coverColorMode`, `COVER_SIZE_MULT`, todo overlay gradient.
- **Manter** apenas: header (avatar + nome + verified + handle + contador), body com `renderRichText`, imagem opcional abaixo (border 1px, radius 20).
- **Adicionar** detector `isTwitterDark()` igual ao Madureira (alterna `bg/fg/muted/border` por luminância).
- **Manter** auto-shrink de body (compatível, melhora robustez).
- **Manter** `rewriteImageUrl` (necessário pro proxy de export PNG).
- Atualizar `types.ts`: remover `imageAsCover`, `coverTextStyle`, `editorial` do `ViralSlide` (ou marcar deprecated mas ignorar no render).

### 2. Atualizar `OffscreenSlideRenderer.tsx`, `SlideEditor.tsx`, `CarouselFullPreview.tsx`

- Tirar qualquer UI de "modo capa", toggle de `imageAsCover`, controles de overlay/posição/cor da capa, edição de `editorial.headline/kicker/subtitle/credit`.
- Editor passa a ter: campo `body` (com bold), botão de imagem (URL ou upload), e toggle "remover imagem". Só isso.

### 3. Edge function `generate-viral-carousel` — corrigir tratamento de imagem

- **Remover** `buildFallbackCover()` SVG indigo. Quando não há `coverImageUrl`, slide 1 fica **sem imagem** (`image: { kind: "none" }`) — o tweet text-only é o padrão correto.
- **Remover** `imageAsCover: true` no slide 1. Imagem entra abaixo do texto, igual aos demais slides.
- Manter `cacheCoverImage()` quando `coverImageUrl` é passado (RSS/notícia real).
- **Avatar fallback**: se `client.avatar_url` está vazio, tentar pegar `social_media.website` → favicon ou OG image via Firecrawl. Se falhar, deixar avatar com inicial (já é o atual fallback do template, fica OK).

### 4. Atualizar `coverFallback.ts` no front

- Como o template não tem mais modo "cover", deletar arquivo e remover imports.

### 5. Refazer o teste do Jornal Cripto

Após a refatoração:
- Apagar o carrossel atual `428d5af4-7f92-48a6-840a-821eb69713ea`.
- Chamar `generate-viral-carousel` passando:
  - `briefing`: notícia real do Bitcoin abaixo de US$ 77k
  - `coverImageUrl`: imagem real do artigo do Valor (já scrapeada, está no `media_urls` do planning item original)
  - `slideCount`: 8 (capa + 6 insights + CTA — padrão Madureira, não 1)
  - `profile.avatarUrl`: tentar logo do Jornal Cripto via OG image de jornalcripto.com
  - `persistAs`: `both` (carousel + planning)
- Abrir o `CarouselFullPreview` e confirmar: tweet branco, avatar/handle/verified, body com bold, imagem do BTC abaixo do texto.

### 6. Migration leve

- Coluna `template` em `viral_carousels` já default `'twitter'` ✓
- Não precisa alterar schema. O JSON de `slides` aceita os novos campos ausentes sem migração.

## Detalhes técnicos

**Arquivos editados:**
- `src/components/kai/viral-sequence/TwitterSlide.tsx` (reescrita parcial: remove ~250 linhas de overlay/editorial)
- `src/components/kai/viral-sequence/types.ts` (remove `imageAsCover`, `coverTextStyle`, `editorial`, `CoverTextStyle`)
- `src/components/kai/viral-sequence/SlideEditor.tsx` (remove controles de cover)
- `src/components/kai/viral-sequence/CarouselFullPreview.tsx` (remove props de cover ao instanciar slides)
- `src/components/kai/viral-sequence/OffscreenSlideRenderer.tsx` (idem)
- `src/components/kai/viral-sequence/coverFallback.ts` (deletar)
- `supabase/functions/generate-viral-carousel/index.ts` (remove `buildFallbackCover`, remove `imageAsCover:true`, simplifica slide 1)

**Não muda:**
- `publishCarousel.ts`, `exportCarousel.ts`, `imageSearch.ts`, `generateCopy.ts`, `storage.ts`
- Edge `publish-viral-carousel`, `kai-content-agent`
- Schema do banco

**Risco:** carrosséis antigos no banco que tenham `imageAsCover:true` ou `editorial:{...}` — após refactor, esses campos serão ignorados pelo render e o slide aparecerá como tweet padrão. Sem quebra, só estética diferente. Migration de cleanup opcional (não vou fazer agora).

**Validação final:** rodar o teste do Jornal Cripto descrito acima e mostrar o preview pro usuário.
