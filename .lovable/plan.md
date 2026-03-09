

# Limpeza e Melhorias: Admin, Help, Chat e Canvas

## 1. Remoção de Páginas (Admin + Help)

### Arquivos a deletar
- `src/pages/AdminDashboard.tsx` (389 linhas)
- `src/pages/Help.tsx` (360 linhas)
- `src/components/admin/FormatMetricsDashboard.tsx`
- `src/components/SuperAdminRoute.tsx`
- `src/hooks/useSuperAdmin.ts` (195 linhas)

### Arquivos a editar
- **`src/App.tsx`** — Remover imports de Help, AdminDashboard, SuperAdminRoute, AuthOnlyRoute. Remover rotas `/admin` e `/help`
- **`src/components/AuthOnlyRoute.tsx`** — Pode ser deletado se nenhuma outra rota o usar (verificar — usado apenas pelo admin route)

**Total: ~950 linhas removidas**

---

## 2. Componentes de Chat Não Utilizados (8 arquivos)

Estes componentes em `src/components/chat/` não são importados por nenhum arquivo:

| Arquivo | Linhas | Status |
|---------|--------|--------|
| `AdvancedProgress.tsx` | ~100 | Não importado |
| `MinimalProgress.tsx` | ~80 | Não importado |
| `QuickActionChips.tsx` | ~60 | Não importado |
| `QuickActionsSuggestions.tsx` | ~80 | Não importado |
| `CitationPopover.tsx` | ~70 | Não importado |
| `ActionMenuPopover.tsx` | ~90 | Não importado |
| `ChatErrorState.tsx` | ~50 | Não importado |
| `ImageActionButtons.tsx` | ~80 | Não importado |
| `SendToCanvasButton.tsx` | ~60 | Não importado |

**Total: ~670 linhas removidas**

---

## 3. Melhoria do kAI Chat — Dois hooks duplicados

O app mantém **dois sistemas de chat paralelos**:
- `useClientChat.ts` — **2390 linhas**. Usado apenas no `KaiAssistantTab` (chat por cliente). Contém: regras de formato hardcoded, client-side model selection, parsing complexo, pipeline multi-agente local
- `useKAISimpleChat.ts` — **361 linhas**. Usado no Global kAI e Canvas floating chat. Mais limpo, delega toda lógica ao backend

**Problema**: `useClientChat` duplica lógica que agora vive no backend (`kai-simple-chat`, `unified-content-api`). Importa regras de formato de `@/types/template` que já existem no servidor. Resultado: 2390 linhas de lógica client-side redundante.

### Proposta
- **Migrar `KaiAssistantTab` para usar `useKAISimpleChat`** em vez de `useClientChat`
- Mover funcionalidades específicas que `KaiAssistantTab` precisa (export, planning dialog, performance mode) para o próprio componente
- **Deletar `useClientChat.ts`** (~2390 linhas) e todo o sistema de regras client-side que ele importa
- Isso elimina a maior fonte de duplicação no projeto

---

## 4. Melhoria do Canvas

O `ContentCanvas.tsx` com 1154 linhas funciona bem mas pode ser melhorado:
- `ContentCanvas` re-cria `nodeTypes` no useMemo mas cada node type é uma closure que captura `handlersRef` — isso é correto e estável
- Sem bugs identificados, mas o arquivo é grande. Não vou refatorar agora para não quebrar funcionalidade

---

## Resumo de Impacto

| Categoria | Linhas removidas |
|-----------|-----------------|
| Admin + Help pages | ~950 |
| Chat components unused | ~670 |
| useClientChat migration | ~2390 |
| **Total** | **~4000 linhas** |

## Ordem de Execução

1. Deletar páginas Admin/Help e dependências (SuperAdminRoute, useSuperAdmin, AuthOnlyRoute, FormatMetricsDashboard)
2. Limpar App.tsx (remover rotas e imports)
3. Deletar 9 componentes de chat não utilizados
4. Migrar KaiAssistantTab para useKAISimpleChat e deletar useClientChat

