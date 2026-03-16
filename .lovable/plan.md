

# Melhorias do Bot Telegram — Plano

## O que já funciona
- Notificações com botões inline (aprovar/reprovar/regenerar/publicar)
- Comandos `/start`, `/pendentes`, `/status`
- Polling contínuo via cron

## Melhorias identificadas

### 1. Resposta por IA para texto livre
Atualmente, qualquer mensagem fora dos comandos retorna "Respostas por IA em breve!". Integrar o `kai-simple-chat` para que o bot responda perguntas e demandas diretamente no Telegram.

### 2. Criação de conteúdo por texto
Permitir que mensagens como "cria um tweet sobre tokenização para o Madureira" sejam interpretadas e criem um item no planejamento, usando detecção de intent simples.

### 3. Comando `/pendentes` com botões de ação
Atualmente lista itens como texto puro. Melhorar para enviar cada item com botões inline (aprovar/reprovar), permitindo ação direta na lista.

### 4. Comando `/aprovar_todos`
Aprovar em lote todos os itens pendentes de uma vez.

### 5. Feedback ao reprovar
Quando o usuário clica "Reprovar", pedir motivo via `forceReply` e salvar o feedback no item (campo `rejection_reason` ou `metadata`).

### 6. Relatório diário automático
Enviar um resumo diário (ex: 8h) com quantidade de itens pendentes, aprovados e publicados no dia anterior. Usar um segundo cron job.

### 7. Notificação de publicação concluída
Quando o `late-post` publica com sucesso, enviar confirmação no Telegram com link do post.

---

## Detalhes técnicos

### Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `supabase/functions/telegram-poll/index.ts` | Adicionar IA (kai-simple-chat), criação de conteúdo por texto, `/aprovar_todos`, feedback de rejeição, `/pendentes` com botões |
| `supabase/functions/telegram-notify/index.ts` | Nenhuma mudança necessária |
| Database | Adicionar cron `daily-telegram-report` (8h UTC-3) |
| `supabase/functions/telegram-daily-report/index.ts` | **Criar** — Resumo diário enviado ao Telegram |

### Fluxo de IA no chat
```text
Usuário envia texto livre
  → telegram-poll detecta que não é comando
  → Chama kai-simple-chat com o texto + histórico recente
  → Retorna resposta da IA no Telegram
```

### Fluxo de criação por texto
```text
"cria um post sobre X para o [cliente]"
  → Detecta intent de criação (regex simples)
  → Busca client_id pelo nome
  → Chama unified-content-api
  → Cria planning_item
  → Envia preview com botões
```

### Relatório diário
```sql
-- Cron: todos os dias às 11:00 UTC (8h BRT)
select cron.schedule('daily-telegram-report', '0 11 * * *', $$
  select net.http_post(
    url:='https://tkbsjtgrumhvwlxkmojg.supabase.co/functions/v1/telegram-daily-report',
    headers:='{"Authorization": "Bearer ..."}',
    body:='{}'
  );
$$);
```

