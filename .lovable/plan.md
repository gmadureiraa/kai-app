

# Plano: Bot Telegram para Gestão de Automações

## Visão Geral

Criar um bot Telegram que funciona como hub de controle do kAI. Todo conteúdo gerado por automações será enviado ao Telegram com texto + imagem. Você poderá aprovar, reprovar, ou pedir regeneração direto pelo chat. Além disso, o bot responderá com IA para demandas rápidas.

---

## Arquitetura

```text
┌─────────────────────┐     ┌──────────────────────┐
│ process-automations │────▶│ telegram-notify      │
│ (já existente)      │     │ (nova edge function) │
│                     │     │ Envia texto+imagem    │
└─────────────────────┘     │ com botões inline     │
                            └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │  Telegram Bot API    │
                            │  (via connector)     │
                            └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │ telegram-poll        │
                            │ (nova edge function) │
                            │ getUpdates cada 1min │
                            │ Processa callbacks   │
                            │ + mensagens de texto │
                            └──────────────────────┘
```

---

## Componentes a Criar

### 1. Conectar Bot Telegram
- Usar o connector `telegram` via `standard_connectors--connect`
- Configurar o `chat_id` do seu Telegram pessoal (obtido via `/start` no bot)

### 2. Tabelas no banco

```sql
-- Estado do polling e config do bot
telegram_bot_config (
  id int PRIMARY KEY CHECK (id = 1),
  chat_id bigint,            -- seu chat_id pessoal
  update_offset bigint,      -- controle do getUpdates
  is_active boolean DEFAULT true,
  updated_at timestamptz
)

-- Mensagens recebidas do Telegram
telegram_messages (
  id uuid PRIMARY KEY,
  update_id bigint UNIQUE,
  chat_id bigint,
  message_text text,
  callback_data text,        -- para botões inline (approve/reject)
  raw_update jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz
)
```

### 3. Edge Function: `telegram-notify`
Chamada pelo `process-automations` após criar cada item. Responsável por:
- Enviar mensagem formatada com título, conteúdo (preview), plataforma, cliente
- Se tiver imagem, enviar via `sendPhoto` com caption
- Incluir **botões inline** (InlineKeyboardMarkup):
  - `✅ Aprovar` → callback `approve:{item_id}`
  - `❌ Reprovar` → callback `reject:{item_id}`
  - `🔄 Regenerar` → callback `regen:{item_id}`
  - `📝 Publicar agora` → callback `publish:{item_id}`

### 4. Edge Function: `telegram-poll`
Polling loop (55s por invocação, cron a cada 1min):
- Processa **callback_query** (botões inline):
  - `approve:{id}` → Atualiza `planning_items.status` para "approved", move para coluna "approved"
  - `reject:{id}` → Atualiza status para "rejected", responde pedindo feedback
  - `regen:{id}` → Chama `unified-content-api` para regenerar conteúdo, atualiza item, reenvia preview
  - `publish:{id}` → Chama `late-post` para publicar imediatamente
- Processa **mensagens de texto**:
  - Comandos: `/status`, `/pendentes`, `/aprovar_todos`
  - Texto livre → Responde via `kai-simple-chat` (IA conversacional)
  - Demandas de conteúdo: "cria um post sobre X para o Madureira" → Cria item no planejamento

### 5. Integração no `process-automations`
Após criar o item e gerar conteúdo/imagem (linha ~1963, onde já cria notificação):
- Chamar `telegram-notify` passando `item_id`, conteúdo, imagem, plataforma, nome da automação
- Isso acontece independente de `auto_publish` — o Telegram sempre recebe

### 6. Cron Job (pg_cron + pg_net)
Agendar `telegram-poll` a cada minuto para processar respostas.

---

## Fluxo do Usuário

1. Automação gera conteúdo → Telegram recebe mensagem com preview + botões
2. Você clica `✅ Aprovar` → Item marcado como aprovado no planejamento
3. Você clica `📝 Publicar agora` → Post é publicado imediatamente na plataforma
4. Você clica `❌ Reprovar` → Item rejeitado, bot pergunta motivo
5. Você clica `🔄 Regenerar` → Conteúdo regenerado, nova preview enviada
6. Você escreve "cria um tweet sobre tokenização de ativos para o Madureira" → Item criado no planejamento

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| `supabase/functions/telegram-notify/index.ts` | **Criar** — Envio de notificações com botões |
| `supabase/functions/telegram-poll/index.ts` | **Criar** — Polling + processamento de callbacks |
| `supabase/functions/process-automations/index.ts` | **Modificar** — Chamar telegram-notify após criar item |
| Database (2 tabelas) | **Criar** — `telegram_bot_config`, `telegram_messages` |
| Database (cron job) | **Criar** — Polling a cada 1 minuto |

---

## Fase 1 (este plano)
- Conectar bot Telegram
- Criar tabelas
- `telegram-notify`: envio de conteúdo com botões inline
- `telegram-poll`: processar aprovações/rejeições
- Integrar no `process-automations`
- Cron job

## Fase 2 (futuro)
- Comandos de texto avançados (`/pendentes`, `/status`)
- Resposta por IA via `kai-simple-chat`
- Criação de conteúdo por texto livre
- Relatório diário resumo

