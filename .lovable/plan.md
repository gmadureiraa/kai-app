

# Limpeza Final + Melhorias Baseadas em Pesquisa para kAI Chat e Canvas

## Parte 1: Limpeza Restante (~800 linhas)

### Arquivos completamente não utilizados para deletar
| Arquivo | Linhas | Motivo |
|---------|--------|--------|
| `src/lib/sse.ts` | 99 | Duplicata exata do `parseOpenAIStream.ts`. Zero imports |
| `src/lib/retry.ts` | ~50 | Zero imports |
| `src/lib/errors.ts` | ~50 | Zero imports |
| `supabase/functions/chat/index.ts` | 548 | Edge function legada. Único uso: `KaiSettingsTab` chama para regenerar contexto — pode ser migrado para `kai-simple-chat` ou `kai-content-agent` |

### KaiSettingsTab: Migrar chamada `chat` → `kai-simple-chat`
- `KaiSettingsTab.tsx` linha 141 chama `supabase.functions.invoke("chat")` para regenerar contexto do cliente
- Migrar para chamar `kai-simple-chat` (ou melhor: `generate-client-context` que já existe)
- Após migração, a edge function `chat/` (548 linhas) pode ser deletada

---

## Parte 2: Melhorias do kAI Chat (baseadas em pesquisa)

### 2.1 Context Window Management — Sliding Window + Summarization
**Problema atual**: O chat envia `messages.slice(-10)` como histórico (linha 228 do `useKAISimpleChat`), o que é um sliding window simples. Conversas longas perdem contexto completamente após 10 mensagens.

**Melhoria**: Implementar **anchored iterative summarization** no backend:
- Quando o histórico excede 10 mensagens, resumir as mais antigas em um "session summary"
- Manter as últimas 5 mensagens intactas + o resumo condensado
- Guardar o resumo na tabela `kai_chat_conversations` (novo campo `context_summary`)
- O backend faz: `[system_prompt, {role: "system", content: summary}, ...last5messages, user_message]`
- Isso mantém o contexto de longo prazo sem explodir tokens

**Implementação**:
- Novo campo `context_summary TEXT` na tabela `kai_chat_conversations`
- No `kai-simple-chat`: quando `history.length > 10`, chamar Gemini Flash Lite para resumir as mensagens antigas em ~500 tokens e salvar
- No próximo request, incluir o summary como mensagem de sistema adicional

### 2.2 SSE Streaming Robustness no Frontend
**Problema atual**: `useKAISimpleChat` faz parsing SSE inline (linhas 267-306) sem:
- Buffer de linhas parciais entre chunks (se JSON chega dividido entre 2 chunks, silenciosamente ignora)
- Flush do buffer final (dados na última linha sem `\n` são perdidos)
- Sem detecção de `\r\n` (CRLF)

**Melhoria**: Extrair para usar o `parseOpenAIStream` que já existe (e é mais robusto), ou melhor, criar uma função `streamSSEToCallback` em `parseOpenAIStream.ts` que aceite um callback `onDelta`:

```text
streamSSEToCallback(reader, {
  onDelta: (token) => { /* update message */ },
  onDone: () => { /* finalize */ },
  onImage: (url) => { /* handle image */ }
})
```

Isso elimina a duplicação de parsing SSE no hook.

### 2.3 Melhorar Detecção de Formato Implícito no Backend
**Problema atual**: Quando o usuário diz "cria outro" sem especificar formato, o `kai-simple-chat` analisa as últimas 5 mensagens do histórico para detectar formato anterior. Mas com o novo sliding window + summarization, esse contexto pode se perder.

**Melhoria**: Salvar o último formato usado como metadata na conversa (`last_format_used` na tabela `kai_chat_conversations`), para que detecção implícita funcione mesmo em conversas longas.

---

## Parte 3: Melhorias do Canvas

### 3.1 `chat-about-material` pode ser inlined no `kai-simple-chat`
**Problema**: Edge function `chat-about-material` (204 linhas) é um mini-chat com contexto de material. Funcionalidade idêntica ao `kai-simple-chat` mas sem carregamento de contexto do cliente.

**Melhoria**: Adicionar um parâmetro `materialContext` ao `kai-simple-chat` e quando presente, usar como contexto primário em vez de buscar identity guide. Deletar `chat-about-material/`.

### 3.2 Canvas Floating Chat — Unificar com `useKAISimpleChat`
O `CanvasFloatingChat` já usa `useKAISimpleChat` — está correto. Sem mudança necessária.

---

## Resumo de Impacto

| Ação | Linhas |
|------|--------|
| Deletar `sse.ts`, `retry.ts`, `errors.ts` | -200 |
| Deletar `chat/index.ts` (edge function) | -548 |
| Deletar `chat-about-material/index.ts` | -204 |
| Context summarization (novo código) | +80 |
| SSE streaming refactor | +30 (net: extrair duplicação) |
| **Total líquido** | **~-850 linhas** |

## Ordem de Execução

1. Deletar `src/lib/sse.ts`, `src/lib/retry.ts`, `src/lib/errors.ts`
2. Migrar `KaiSettingsTab` para usar `generate-client-context` em vez de `chat`
3. Deletar `supabase/functions/chat/`
4. Adicionar `materialContext` support ao `kai-simple-chat`, migrar `MaterialChatNode`, deletar `chat-about-material/`
5. Criar `streamSSEToCallback()` em `parseOpenAIStream.ts` e refatorar `useKAISimpleChat` para usá-la
6. Migration: adicionar `context_summary` e `last_format_used` à tabela `kai_chat_conversations`
7. Implementar anchored summarization no `kai-simple-chat` (quando history > 10)

