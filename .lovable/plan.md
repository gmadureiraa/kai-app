

# Plan: Revisão Completa das Automações + Referências Visuais por Automação

## Diagnóstico

Após análise detalhada do `process-automations/index.ts` (1841 linhas) e `generate-content-v2/index.ts` (984 linhas), identifiquei:

### O que está bom
- Twitter: 8 categorias de variação editorial (Provocação, Insight, Pergunta, etc.) com anti-exemplos dos últimos 7 tweets
- LinkedIn: 14 variações em 3 pilares (Opinion, Building in Public, Case Study) com anti-exemplos
- YouTube RSS: transcrição automática de vídeos para enriquecer prompts
- Newsletter: Deep Research com Gemini + Google Search Grounding
- Image generation: já busca `client_visual_references` com `is_primary=true` e envia como input multimodal
- Content cleaning: remove labels de IA (TEXTO DO VISUAL, LEGENDA, etc.)

### Problemas encontrados

1. **Threads (plataforma) não tem sistema de variação** — posts de Threads usam o mesmo formato genérico sem rotação editorial. Twitter tem 8 categorias, LinkedIn tem 14, mas Threads tem 0.

2. **Blog posts não têm variação** — sempre geram com o mesmo prompt sem rotação temática.

3. **Imagens são genéricas entre automações** — todas usam as mesmas `client_visual_references` marcadas como `is_primary`. Se o cliente tem 3 refs de estilo "anime", todas as imagens saem iguais. Não há como variar o tipo de imagem (ex: fluxograma para um post de marketing, visual abstrato para outro).

4. **Retry de imagem tem bug** — linha 1463 tem `type: 'image'` duplicado e o retry não passa `config` (aspectRatio, noText), apenas `settings`.

5. **Sem referências visuais por automação** — sua ideia de anexar refs específicas por automação não existe ainda. Hoje é tudo global via `client_visual_references`.

---

## Mudanças Propostas

### 1. Adicionar campo `image_reference_ids` na tabela `planning_automations`
- Novo campo `image_reference_ids uuid[]` — permite selecionar referências visuais específicas da biblioteca do cliente para cada automação
- Quando preenchido, o sistema usa essas refs em vez das `is_primary` globais
- Isso permite: automação de marketing → refs de fluxogramas/infográficos, automação pessoal → refs de lifestyle/anime

### 2. Sistema de variação para Threads
- Adicionar `THREADS_VARIATION_CATEGORIES` (6-8 categorias): Reflexão, Pergunta Retórica, Insight Rápido, Hot Take, Storytelling Micro, Dado/Métrica, Behind the Scenes, Provocação
- Aplicar rotação via `variation_index` no `trigger_config` (mesmo padrão do Twitter)
- Buscar últimos 7 posts da plataforma Threads como anti-exemplos

### 3. Sistema de variação para Blog
- Adicionar `BLOG_VARIATION_CATEGORIES` (5 categorias): Framework/Tutorial, Análise de Tendência, Opinião Contrarian, Caso de Estudo, Guia Prático
- Aplicar rotação para garantir diversidade de formatos nos artigos

### 4. Corrigir retry de imagem no process-automations
- Remover `type: 'image'` duplicado (linha 1463)
- Passar `config` com `aspectRatio`, `noText`, `useVisualReferences` no retry

### 5. UI: Seletor de referências visuais no AutomationDialog
- Na seção de imagem, adicionar um grid de thumbnails das `client_visual_references` do cliente selecionado
- Checkbox para selecionar quais refs usar naquela automação
- Se nenhuma selecionada, mantém comportamento atual (usa `is_primary`)

### 6. Backend: Usar refs específicas na geração
- No `process-automations`, quando `automation.image_reference_ids` existir, buscar essas refs em vez das `is_primary`
- Passar como inputs multimodais para `generate-content-v2`

---

## Technical Details

### DB Migration
```sql
ALTER TABLE public.planning_automations 
ADD COLUMN image_reference_ids uuid[] DEFAULT NULL;
```

### Files Modified
1. **`supabase/functions/process-automations/index.ts`** — Add Threads/Blog variation categories, fix image retry bug, use `image_reference_ids` when available
2. **`src/components/planning/AutomationDialog.tsx`** — Add visual reference selector grid in image section
3. **DB Migration** — Add `image_reference_ids` column

### Variation Categories (New)

**Threads (8 categorias):**
- Reflexão Profunda, Pergunta Retórica, Insight Rápido, Hot Take, Storytelling Micro, Dado/Métrica, Behind the Scenes, Provocação

**Blog (5 categorias):**
- Framework/Tutorial, Análise de Tendência, Opinião Contrarian, Deep Dive Técnico, Guia Prático

