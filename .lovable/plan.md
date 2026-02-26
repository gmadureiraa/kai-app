

# Plano: Melhorias na Criação de Conteúdo Twitter + Engagement Hub

## Situação Atual

O sistema de automações já funciona bem para o GM Tweet diário do Madureira. O pipeline completo existe: geração via `unified-content-api` com contexto enriquecido (identity_guide, favorites, top performers), parsing de threads, publicação via `twitter-post` com suporte a OAuth 1.0a e threads com mídia. Porém, olhando os tweets publicados na screenshot, todos seguem um padrão muito similar (frases motivacionais curtas sobre "construir o futuro"), o que pode saturar a audiência.

## Melhorias Propostas (3 Frentes)

---

### Frente 1: Variação e Criatividade nos GM Tweets

**Problema:** Os tweets de GM estão repetitivos - todos seguem o mesmo padrão "GM. Frase motivacional sobre construir."

**Solução:** Adicionar sistema de variação ao `process-automations`:

- Criar uma lista de "categorias de GM" que rota automaticamente: Provocação, Insight técnico, Pergunta, Dado/Métrica, Storytelling micro, Call-to-action
- Injetar no prompt da automação uma instrução de variação baseada no dia da semana ou num counter
- Guardar no `trigger_config` da automação um campo `variation_index` que incrementa a cada execução
- O prompt passaria a incluir: "Hoje use o estilo X. NÃO repita padrões dos últimos tweets."
- Buscar os últimos 5-7 tweets publicados do cliente (via `twitter_posts` table) e incluir como "anti-exemplos" no prompt para forçar diferenciação

**Arquivos:** `supabase/functions/process-automations/index.ts` (modificar `buildEnrichedPrompt`)

---

### Frente 2: Automação de Threads

**Problema:** Threads geram muito mais engajamento que tweets simples, mas não há automação de thread configurada.

**Solução:** 

- Criar nova automação "Thread Semanal Madureira" (pode ser feito via UI existente, content_type = 'thread')
- O sistema já suporta: geração de thread, parsing de tweets numerados (`parseThreadFromContent`), publicação encadeada com `reply_to` (`twitter-post`)
- Melhorar o prompt de thread para incluir a documentação de formato (`docs/formatos/THREAD.md`) automaticamente quando `content_type === 'thread'`
- Atualmente o `knowledge-loader.ts` já carrega documentação de formato - verificar se THREAD.md está na tabela `kai_documentation`

**Arquivos:** `supabase/functions/process-automations/index.ts`, `supabase/functions/_shared/knowledge-loader.ts`

---

### Frente 3: Engagement Hub (MVP) - Feed + Replies

Implementar a Fase 1 do plano aprovado anteriormente:

**3.1 - Tabela `engagement_opportunities`**
- `id`, `client_id`, `tweet_id`, `author_username`, `author_name`, `author_followers`, `tweet_text`, `tweet_metrics` (JSONB), `tweet_created_at`, `category` (networking/community/growth), `relevance_score`, `status` (new/saved/replied/dismissed), `reply_text`, `reply_tweet_id`, `replied_at`, `created_at`
- RLS: workspace members only

**3.2 - Edge Function `twitter-feed`**
- Usa Twitter API v2 `GET /2/tweets/search/recent` com queries extraídas do identity_guide do cliente (hashtags, tópicos, pessoas-chave)
- Retorna tweets com métricas públicas (likes, retweets, reply_count)
- Scoring básico por IA (Gemini Flash) para classificar relevância

**3.3 - Edge Function `twitter-reply`**
- Gera reply com IA mantendo o tom de voz do cliente (via identity_guide)
- Seletor de tom: Insightful, Bold, Supportive
- Publica via `twitter-post` existente com `replyToId`

**3.4 - UI: Nova aba "Engajamento" no cliente**
- Feed de tweets relevantes com cards (autor, texto, métricas, categoria)
- Filtros: Todos, Networking, Community, Growth
- Painel lateral de reply com geração por IA e preview
- Integração na sidebar do cliente

**Arquivos novos:**
- `supabase/functions/twitter-feed/index.ts`
- `supabase/functions/twitter-reply/index.ts`
- `src/components/engagement/EngagementHub.tsx`
- `src/components/engagement/OpportunityFeed.tsx`
- `src/components/engagement/OpportunityCard.tsx`
- `src/components/engagement/ReplyPanel.tsx`
- `src/hooks/useEngagementFeed.ts`
- Migration para tabela `engagement_opportunities`

---

## Ordem de Implementação

| Ordem | Tarefa | Esforço |
|-------|--------|---------|
| 1 | Sistema de variação nos GM tweets (anti-repetição) | 30min |
| 2 | Injetar formato THREAD.md no prompt de threads automáticas | 20min |
| 3 | Tabela `engagement_opportunities` + RLS | 15min |
| 4 | Edge Function `twitter-feed` (Search API v2) | 1h |
| 5 | Edge Function `twitter-reply` (geração + post) | 1h |
| 6 | UI do Engagement Hub (feed + reply panel) | 2h |
| 7 | Integração na sidebar/routing do cliente | 30min |

