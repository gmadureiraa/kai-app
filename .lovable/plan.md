
# Auditoria 100% da Documentação — Análise Completa e Plano de Melhorias

## 📊 Diagnóstico Geral

Após revisão completa, a documentação está em **~85% de cobertura**. Existem gaps importantes que precisam ser preenchidos para atingir 100%.

---

## ✅ O QUE ESTÁ BEM DOCUMENTADO

| Área | Documento | Status |
|------|-----------|--------|
| Arquitetura | `ARCHITECTURE.md` | ✅ Completo - stack, RLS, modelo de acesso |
| kAI Chat | `KAI_CHAT.md` | ✅ Completo - detecção, contexto, métricas |
| Pipeline Geração | `UNIFIED_CONTENT_PIPELINE.md` | ✅ Completo - 4 etapas, validação |
| Planning | `PLANNING_KANBAN.md` | ✅ Completo - colunas, cards, publicação |
| Canvas | `CONTENT_CANVAS.md` | ⚠️ Básico - falta detalhes dos nós |
| Automações | `AUTOMATIONS_PIPELINE.md` | ✅ Completo - rotação, voice profile |
| Publicação | `SOCIAL_PUBLISHING.md` | ✅ Completo - Late API, OAuth |
| Repurpose | `CONTENT_REPURPOSE.md` | ⚠️ Básico - falta fluxo detalhado |
| Engagement | `ENGAGEMENT.md` | ⚠️ Básico - falta scoring |
| Onboarding | `CLIENT_ONBOARDING.md` | ✅ Completo |
| Formatos (12) | `docs/formatos/` | ✅ Todos presentes |
| Agentes (6) | `docs/agentes/` | ✅ Todos presentes |
| API | `API-EDGE-FUNCTIONS.md` | ⚠️ Desatualizado - funções legadas |
| Design System | `DESIGN-SYSTEM-COMPLETO.md` | ✅ Completo |

---

## 🔴 GAPS IDENTIFICADOS (15% faltante)

### 1. Performance Hub & Métricas (FALTA DOCUMENTAÇÃO)
- **Problema:** Não existe `docs/PERFORMANCE_METRICS.md`
- **Funcionalidades não documentadas:**
  - Dashboard de métricas (Instagram, YouTube, LinkedIn, Beehiiv)
  - Sincronização de posts via RSS
  - Tabelas `instagram_posts`, `linkedin_posts`, `youtube_videos`
  - Edge functions de coleta (`fetch-instagram-metrics`, `fetch-youtube-metrics`, etc.)
  - Análise de top performers

### 2. Content Library (FALTA DOCUMENTAÇÃO)
- **Problema:** Não existe `docs/CONTENT_LIBRARY.md`
- **Funcionalidades não documentadas:**
  - Tipos de conteúdo (posts, newsletters, case studies, reports)
  - Sistema de favoritos (`is_favorite`)
  - Sincronização RSS/Beehiiv
  - Reference Library (artigos, estudos)
  - Visual References (logos, paletas)
  - Preview modal otimizado

### 3. Geração de Imagens (FALTA DOCUMENTAÇÃO)
- **Problema:** Não existe `docs/IMAGE_GENERATION.md`
- **Funcionalidades não documentadas:**
  - Pipeline Gemini 2.0 Flash para imagens
  - DNA Visual do cliente (`client_visual_references`)
  - Regra "Sem Texto" com retry automático
  - Modificadores de estilo (photographic, illustration, etc.)
  - Integração com Canvas e Planning

### 4. Sistema de Notificações (FALTA DOCUMENTAÇÃO)
- **Problema:** Não existe `docs/NOTIFICATIONS.md`
- **Funcionalidades não documentadas:**
  - In-app notifications
  - Push notifications (Web Push + Service Worker)
  - Email notifications (queue + edge function)
  - Preferências por usuário
  - Tipos de notificação (publish_reminder, automation_complete, etc.)

### 5. API Edge Functions (DESATUALIZADO)
- **Problema:** `API-EDGE-FUNCTIONS.md` menciona funções legadas inexistentes
- **Funções faltantes na doc:**
  - `kai-simple-chat` (principal!)
  - `kai-content-agent`, `kai-planning-agent`, `kai-metrics-agent`
  - `process-automations`, `process-recurring-content`
  - `late-post`, `late-oauth-*`
  - `research-newsletter-topic`
  - `sync-rss-to-library`
- **Funções legadas que devem ser removidas:**
  - `n8n-api`, `execute-workflow`, `run-automation`
  - `chat-multi-agent`, `orchestrator`
  - `transcribe-audio`, `transcribe-video`
  - `analyze-research`, `scrape-research-link`

### 6. Canvas — Detalhes Técnicos (INCOMPLETO)
- **O que falta em `CONTENT_CANVAS.md`:**
  - Schema completo de cada tipo de nó (data fields)
  - Integração de OutputNode com threads/carrosséis
  - Workflow de geração nó a nó
  - Atalhos de teclado e gestos
  - Export/Import de canvas

### 7. Engagement Hub — Scoring (INCOMPLETO)
- **O que falta em `ENGAGEMENT.md`:**
  - Algoritmo de `relevance_score`
  - Critérios de categorização (industry, competitor, audience)
  - Configuração de keywords por cliente
  - Rate limits do Twitter API

### 8. Tokens & Billing (FALTA DOCUMENTAÇÃO DEDICADA)
- **Problema:** Existe apenas menção em `ARCHITECTURE.md`
- **Falta doc dedicada:**
  - Sistema de tokens (`workspace_tokens`)
  - Débito por chamada de IA
  - Planos (Free, Pro, Enterprise)
  - Stripe checkout e portal
  - Limites por plano

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Documentos Novos (Críticos)

| # | Documento | Descrição |
|---|-----------|-----------|
| 1 | `docs/PERFORMANCE_METRICS.md` | Dashboard, coleta de métricas, análise de top performers |
| 2 | `docs/CONTENT_LIBRARY.md` | Tipos, favoritos, sync RSS, visual references |
| 3 | `docs/IMAGE_GENERATION.md` | Pipeline Gemini, DNA visual, retry "sem texto" |
| 4 | `docs/NOTIFICATIONS.md` | Push, email, in-app, preferências |
| 5 | `docs/TOKENS_BILLING.md` | Sistema de créditos, planos, Stripe |

### Fase 2: Atualizações

| # | Documento | Mudança |
|---|-----------|---------|
| 6 | `API-EDGE-FUNCTIONS.md` | Remover 12 funções legadas, adicionar 15 funções atuais |
| 7 | `CONTENT_CANVAS.md` | Adicionar schema de nós, OutputNode, atalhos |
| 8 | `ENGAGEMENT.md` | Adicionar algoritmo de scoring, keywords config |
| 9 | `CONTENT_REPURPOSE.md` | Expandir fluxo, adicionar tela UI |
| 10 | `README.md` | Adicionar links para novos docs |

### Fase 3: Detalhes Finais

| # | Área | Ação |
|---|------|------|
| 11 | Formatos | Verificar se `format-schemas.ts` está 100% alinhado com docs |
| 12 | Agentes | Adicionar links para edge functions correspondentes |
| 13 | Data de atualização | Atualizar todas para "Março 2026" |

---

## 📁 Arquivos a Criar/Modificar

**Criar (5 arquivos):**
- `docs/PERFORMANCE_METRICS.md`
- `docs/CONTENT_LIBRARY.md`
- `docs/IMAGE_GENERATION.md`
- `docs/NOTIFICATIONS.md`
- `docs/TOKENS_BILLING.md`

**Atualizar (5 arquivos):**
- `docs/API-EDGE-FUNCTIONS.md`
- `docs/CONTENT_CANVAS.md`
- `docs/ENGAGEMENT.md`
- `docs/CONTENT_REPURPOSE.md`
- `docs/README.md`

---

## 📊 Resultado Esperado

Após implementação:
- **Cobertura:** 100% das funcionalidades documentadas
- **Total de docs:** ~25 arquivos completos
- **Utilidade:** Qualquer pessoa consegue entender o sistema completo lendo a documentação
