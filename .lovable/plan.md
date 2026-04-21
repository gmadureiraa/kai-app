

# Plano: Carrosséis "Viral Sequence" integrados em Automações, Chat KAI e Planejamento

## Visão geral

Hoje a Sequência Viral é uma ilha: gera carrossel manualmente na aba dela e exporta PNG/PDF. Vou conectá-la em três lugares: **Automações** (criar carrossel viral agendado/RSS), **Chat KAI** (ferramenta `create_viral_carousel`), e **Planejamento** (card mostra preview do carrossel viral, botão "Editar no Sequência Viral" abre o editor com os dados, e vice-versa: botão "Mandar pro planejamento" no editor cria card).

Tudo usa o mesmo motor: `kai-content-agent` com o briefing do cliente (identity_guide, voice profile, content guidelines) — então a IA já entende a marca.

## 1. Backbone: schema + edge function unificada

### 1.1 Migração no `viral_carousels`
Adicionar coluna `planning_item_id uuid` (FK opcional pra `planning_items`, nullable, ON DELETE SET NULL) + índice. Esse é o link bidirecional: um carrossel pode estar "anexado" a um card do planejamento.

Adicionar também coluna `source text` (`'manual' | 'automation' | 'chat'`) pra rastreabilidade.

### 1.2 Nova edge function `generate-viral-carousel`
Centraliza a geração de carrosséis Twitter-style — chamada por automações, chat e UI manual. Recebe:
```
{ clientId, briefing, tone?, slideCount?, profile?, persistAs?: 'planning' | 'carousel' | 'both' }
```
Internamente: chama `kai-content-agent` com o prompt já calibrado (mesmo do `generateCopy.ts` atual, mas no servidor), parseia os 8 slides, e dependendo de `persistAs` grava em `viral_carousels` e/ou cria `planning_item` com `content_type='carousel'` + `metadata.viral_carousel_id` + `metadata.carousel_slides` (formato compatível com o que `process-automations` já espera).

Isso elimina duplicação: hoje a UI tem a lógica de prompt no client (`generateCopy.ts`), e o `process-automations` tem outra parecida. As duas passam a chamar essa função.

## 2. Automações: novo content_type `viral_carousel`

### 2.1 No `AutomationDialog`
Adicionar opção "Carrossel Viral (estilo Twitter)" no select de `content_type`. Quando selecionado:
- Mostra textarea de briefing (igual hoje), mas avisa "8 slides, formato tweet"
- Esconde campos irrelevantes (tipo "imagem por slide" — porque cada slide já é um tweet card visual)
- Mostra checkbox "Gerar imagens por slide" (opcional — usa `image_pool_folder` ou geração IA)

### 2.2 No `process-automations/index.ts`
Adicionar branch novo: quando `automation.content_type === 'viral_carousel'`, chamar `generate-viral-carousel` em vez do fluxo de prompt normal. Essa função já cria o `planning_item` com `metadata.viral_carousel_id` apontando pro registro persistido em `viral_carousels` (status `draft`). Comportamento auto-publish/revisão continua igual ao carrossel normal — vai pra "Revisão" se `auto_publish=false`.

## 3. Chat KAI: ferramenta `create_viral_carousel`

Em `supabase/functions/kai-simple-chat/tools/`, criar `createViralCarousel.ts` análogo ao `createContent.ts`:
- Tool exposta pro agente com schema `{ briefing, tone?, addToPlanning?: boolean }`
- Handler chama `generate-viral-carousel` com `persistAs: addToPlanning ? 'both' : 'carousel'`
- Retorna `{ carouselId, planningItemId?, slides, previewUrl }` pro chat renderizar bubble especial

Bubble no chat: card compacto com mini-thumb dos 8 slides + 2 botões — "Abrir no Sequência Viral" e "Ver no Planejamento". Reusa o `TwitterSlide` em mini-scale.

## 4. Planejamento ↔ Sequência Viral: navegação bidirecional

### 4.1 Card de planejamento detecta carrossel viral
No `PlanningItemCard` e `PlanningItemDialog`, quando `metadata.viral_carousel_id` existir:
- Card mostra badge azul "Carrossel Viral" + thumb do slide 1
- No dialog, em vez do `RichContentEditor`, renderiza um preview compacto + botão **"Editar no Sequência Viral"** que faz `navigate(/kaleidos?client=X&tab=sequence&carouselId=Y)`

### 4.2 Sequência Viral abre carrossel via URL
`ViralSequenceTab` lê `?carouselId=` da URL: se presente, chama `loadCarousel(id)` em vez de carregar rascunho local. Assim o ida-e-volta funciona.

### 4.3 Botão "Mandar pro Planejamento" no editor
Substitui o `handleSaveStub` atual por menu real:
- **Salvar carrossel** → grava em `viral_carousels` (já implementado mas nunca chamado)
- **Mandar pro Planejamento** → grava + cria `planning_item` (status `draft`, coluna "Rascunho") com `metadata.viral_carousel_id` apontando de volta. Toast com link "Abrir card".
- **Sincronizar com card existente** → se já tem `planning_item_id`, regrava o conteúdo no card (slides como `metadata.carousel_slides`).

### 4.4 Botão "Publicar via LATE" funcional
Conecta ao `late-post` existente. Exporta os 8 slides como PNGs (já tem `exportCarouselAsPngs`), faz upload pra `client-files` storage, e dispara LATE com plataforma Instagram/X. Reusa o fluxo do `process-automations` pra carrossel.

## 5. UI da Sequência Viral: lista de salvos

Sidebar lateral colapsável no `ViralSequenceTab` com lista de carrosséis salvos do cliente (`listSavedCarousels` já existe). Cada item: título, status, data, ações (abrir, deletar, duplicar). Quando clica em "Novo", limpa estado e zera URL param.

## 6. QA e validação

- Compilar TS, deploy de `generate-viral-carousel` e do `kai-simple-chat` atualizado
- Testar end-to-end:
  1. Chat: pedir "cria um carrossel viral sobre X" → ver bubble com slides → clicar "Abrir no Sequência Viral" → editar → mandar pro planejamento → ver card no kanban
  2. Automação: criar uma com `content_type=viral_carousel`, rodar manualmente, ver card aparecer em Revisão com slides
  3. Sequência Viral: criar do zero → salvar → recarregar → ver na lista lateral → mandar pro planejamento

## Resumo técnico

```text
NEW
  supabase/migrations/<ts>_viral_carousel_planning_link.sql  (planning_item_id, source)
  supabase/functions/generate-viral-carousel/index.ts        (motor central)
  supabase/functions/kai-simple-chat/tools/createViralCarousel.ts
  src/components/kai/viral-sequence/SavedCarouselsSidebar.tsx
  src/components/kai/viral-sequence/PublishLateDialog.tsx

EDITED
  supabase/functions/process-automations/index.ts            (+ branch viral_carousel)
  supabase/functions/kai-simple-chat/index.ts                (+ tool registration)
  src/types/contentTypes.ts                                  (+ viral_carousel option)
  src/components/planning/AutomationDialog.tsx               (+ opção viral_carousel)
  src/components/planning/PlanningItemCard.tsx               (badge + thumb)
  src/components/planning/PlanningItemDialog.tsx             (botão "Editar no SV")
  src/components/kai/ViralSequenceTab.tsx                    (URL param, save real,
                                                              publish real, sidebar)
  src/components/kai/viral-sequence/generateCopy.ts          (passa a chamar
                                                              generate-viral-carousel)
  src/hooks/useKAISimpleChat.ts                              (renderizar bubble do
                                                              carrossel viral)
```

Sem secrets novos — usa `LOVABLE_API_KEY` (já presente) e `LATE_API_KEY` (já presente).

