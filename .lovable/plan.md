# Auditoria Completa: kAI Chat — O Que Tem e O Que Falta

## Análise do Estado Atual

O `kai-simple-chat` é uma edge function de **2623 linhas** que funciona como o cérebro do kAI. Após auditoria completa, aqui está o mapa de acesso:

### O que o kAI Chat JÁ acessa


| Recurso                       | Como acessa                              | Qualidade                  |
| ----------------------------- | ---------------------------------------- | -------------------------- |
| **Identity Guide** do cliente | `clients.identity_guide`                 | Bom (truncado em 8K chars) |
| **Métricas Instagram**        | `instagram_posts` (top 5 por ER)         | Parcial — só Instagram     |
| **Biblioteca de Conteúdo**    | Via `@mentions` (citations) + auto-fetch | Bom                        |
| **Biblioteca de Referências** | Via `@mentions` (citations) + auto-fetch | Bom                        |
| **Regras de Formato**         | `_shared/format-rules.ts`                | Excelente                  |
| **Web Search** (Google)       | Via Gemini grounding                     | Bom                        |
| **Geração de Imagem**         | Endpoint dedicado                        | Bom                        |
| **Criação de Cards**          | INSERT em `planning_items`               | Bom                        |
| **Comparação de Períodos**    | `instagram_posts` com date ranges        | Parcial — só Instagram     |
| **Histórico de Conversa**     | 15 mensagens recentes                    | Bom                        |


### O que o kAI Chat NÃO acessa (GAPS)


| Recurso Ausente                             | Impacto                                    | Prioridade |
| ------------------------------------------- | ------------------------------------------ | ---------- |
| **Twitter/LinkedIn/YouTube posts**          | Não analisa métricas dessas plataformas    | Alta       |
| **Analytics real-time (Late API)**          | Recém-criado, não integrado ao chat        | Alta       |
| **Planning items (leitura)**                | Não sabe o que está agendado/pendente      | Alta       |
| **Documentos** (PDFs, DOCX)                 | Não consulta documentos do cliente         | Média      |
| **Websites** (conteúdo scrapeado)           | Não usa sites do cliente como contexto     | Média      |
| **Global Knowledge**                        | Base de conhecimento do workspace ignorada | Média      |
| **Voice Profile**                           | Perfil de voz gerado mas não injetado      | Média      |
| **Content Guidelines**                      | Diretrizes de conteúdo não acessadas       | Média      |
| **Automations status**                      | Não sabe quais automações existem          | Baixa      |
| **Canvas data**                             | Não vê conteúdo de canvas salvos           | Baixa      |
| **Operações de escrita** (além de planning) | Não pode editar items, mover cards, etc.   | Média      |


### Bugs/Limitações Encontrados

1. **Bloqueio de plano**: Linhas 1911-1917 checam `ALLOWED_PLANS = ["pro", "enterprise", "agency"]` — mas o sistema é interno sem planos. Se o workspace não tiver subscription "pro", o chat retorna 403.
2. **Só Instagram**: `fetchMetricsContext` e `fetchComparisonContext` consultam apenas `instagram_posts`. Twitter, LinkedIn, YouTube são ignorados.
3. **Google API Key direta**: Usa `GOOGLE_AI_STUDIO_API_KEY` em vez do Lovable AI Gateway (que não requer API key).
4. **Sem Knowledge Base**: `global_knowledge` com embeddings existe mas o chat não usa `search_knowledge_semantic`.

---

## Plano de Melhorias

### 1. Remover bloqueio de plano (sistema interno)

- Remover check de `ALLOWED_PLANS` que bloqueia acesso

### 2. Expandir métricas para todas as plataformas

- Adicionar queries para `twitter_posts`, `linkedin_posts`, `youtube_videos`
- Detectar plataforma mencionada e buscar dados corretos

### 3. Integrar leitura do Planejamento

- Quando o usuário perguntar "o que temos agendado?" ou "planejamento da semana", buscar `planning_items` do cliente
- Permitir perguntas como "quantos posts pendentes?" ou "o que está atrasado?"

### 4. Integrar Analytics real-time

- Quando detectar intent de analytics, chamar internamente a edge function `late-analytics` e injetar os dados no contexto

### 5. Injetar Voice Profile e Content Guidelines

- Buscar `voice_profiles` e `content_guidelines` do cliente e adicionar ao system prompt

### 6. Integrar Global Knowledge

- Usar `search_knowledge_semantic` para enriquecer respostas com conhecimento do workspace

### 7. Acessar Documentos e Websites

- Buscar `client_documents.extracted_content` e `websites.scraped_markdown` quando relevante

## Arquivos Modificados


| Arquivo                                       | Mudança                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/functions/kai-simple-chat/index.ts` | Remover plan check, adicionar multi-platform metrics, planning read, voice profile, knowledge search, document access, gateway migration |


## Prioridade de Implementação

1. Remover bloqueio de plano (1 linha)
2. Multi-platform metrics (Twitter, LinkedIn, YouTube)
3. Leitura do planejamento
4. Voice profile + content guidelines injection
5. Global knowledge search
6. Analytics real-time integration
7. Documents/websites context