

# kAI Chat: Análise de Métricas + Criação de Cards no Planejamento

## Problema
O kAI já cria cards no planejamento e já consulta métricas (Instagram, LinkedIn), mas:
1. **YouTube não está no contexto de métricas** — a tabela `youtube_videos` nunca é consultada em `fetchMetricsContext()`
2. **O fluxo de planejamento não usa métricas** — quando o usuário pede "analise os melhores vídeos e crie 10 temas no planejamento", o sistema não sabe combinar análise + criação de cards
3. **A detecção de intent não captura pedidos compostos** — como "analise...e suba no planejamento"

## Mudanças

### 1. Adicionar YouTube ao `fetchMetricsContext()` (`kai-simple-chat/index.ts`)

Incluir query à tabela `youtube_videos` no `Promise.all` existente, ordenando por views/likes. Renderizar os top vídeos com título, views, likes, comments e published_at no contexto.

### 2. Expandir `detectPlanningIntent()` com padrões de análise+criação

Adicionar patterns como:
- `analise...e crie/suba/coloque no planejamento`
- `com base nos melhores...crie cards`
- `sugira temas...e adicione ao planejamento`

Novo campo no `PlanningIntent`: `analyzeFirst: boolean` — indica que deve buscar métricas antes de gerar os cards.

### 3. Enriquecer `generatePlanningCards()` com dados de métricas

Quando `intent.analyzeFirst` é true:
- Buscar top YouTube videos (e outros dados de métricas) do cliente
- Incluir esses dados no prompt de geração como contexto de análise
- O prompt pedirá para a IA criar temas **novos** inspirados nos melhores conteúdos

### 4. Prompt de geração enriquecido

O prompt incluirá:
- Lista dos top vídeos com views/likes
- Instrução para identificar padrões de sucesso
- Instrução para gerar temas **novos** com tópicos detalhados
- Output JSON com title + description (tópicos a abordar)

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/kai-simple-chat/index.ts` | Adicionar YouTube a `fetchMetricsContext`, expandir `detectPlanningIntent`, enriquecer `generatePlanningCards` |

## Fluxo do Usuário

```text
User: "Analise os melhores conteúdos de YouTube de todos os tempos 
       e crie 10 temas no planejamento"

→ detectPlanningIntent: isPlanning=true, analyzeFirst=true, 
  quantity=10, platform=youtube

→ generatePlanningCards:
  1. Busca top 30 youtube_videos por views DESC
  2. Monta prompt com dados reais dos vídeos
  3. IA gera 10 temas novos com tópicos detalhados
  4. Insere 10 cards no planejamento
  
→ Resposta: "✅ 10 cards criados para YouTube!
   Baseado na análise dos seus top vídeos..."
```

