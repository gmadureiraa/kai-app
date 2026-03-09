

# Plano: Analytics Fix + Canvas UX Perfeito

## Parte 1: Fix Analytics

### Problema
A edge function `late-analytics` **não está registrada no `config.toml`**, então não é deployada. Precisa adicionar a entrada.

### Correção
1. Adicionar `[functions.late-analytics]` com `verify_jwt = false` ao `config.toml` (validação de JWT é feita manualmente no código)
2. A edge function já existe e está correta -- busca `late_profile_id` de `client_social_credentials`, chama Late API endpoints `/analytics` e `/follower-stats`
3. O hook `useLateAnalytics` e o componente `KaiAnalyticsTab` já estão implementados e corretos
4. Sidebar já tem o item "Analytics ✨" e routing no `Kai.tsx` já renderiza o componente

**Única mudança necessária**: adicionar entry no `config.toml`.

---

## Parte 2: Canvas -- Plano de UI/UX Perfeito

Após revisão completa do código (1154 linhas do ContentCanvas + 7 nodes + 12 components + 5 hooks), estas são as melhorias organizadas por prioridade:

### A. Correções Imediatas

| Item | Problema | Solução |
|------|----------|---------|
| Toolbar overflow mobile | Toolbar fixa no bottom pode cortar em telas pequenas | Scroll horizontal + safe-area padding |
| Header z-index overlap | Header (z-55) pode conflitar com drag overlay (z-50) | Ajustar hierarquia z-index |
| Empty state keyboard hints | Shortcuts A/G/L mostrados mas sem feedback visual de que funcionaram | Flash visual no empty state ao pressionar |

### B. Melhorias de UI (Visual Polish)

| Item | Detalhe |
|------|---------|
| Node glow on hover | Adicionar sutil glow (box-shadow primary/20) nos nodes ao hover, seguindo a estética Linear |
| Animated edges gradient | Edge animada com gradient da cor do source node para target node |
| Toolbar glassmorphism | Fundo blur+transparência estilo Linear para a toolbar |
| MiniMap styling | Customizar cores do minimap para match com tema dark/light |
| Drag feedback refinado | Ao arrastar arquivo, mostrar preview do tipo de arquivo (ícone) |
| Node connection animation | Pulse animation suave quando nodes são conectados |

### C. Funcionalidades Canvas (Garantir tudo funcional)

| Feature | Status | Ação |
|---------|--------|------|
| Attachment (URL/PDF/Audio/Video/Image) | ✅ Funcional | -- |
| Generator (9 formatos, text+image) | ✅ Funcional | -- |
| Output (edit, copy, download, remix) | ✅ Funcional | -- |
| Send to Planning | ✅ Funcional | -- |
| Version History | ✅ Funcional | -- |
| Approval Status | ✅ Funcional | -- |
| Comments (NodeComment) | ✅ Funcional | -- |
| Remix (fork output → new generator) | ✅ Funcional | -- |
| Drawing Layer (pencil/eraser) | ✅ Funcional | -- |
| Sticky Notes | ✅ Funcional | -- |
| Text Nodes | ✅ Funcional | -- |
| Shape Nodes | ✅ Funcional | -- |
| Library Drawer (drag & drop) | ✅ Funcional | -- |
| Quick Templates | ✅ Funcional | -- |
| Canvas Save/Load/Delete | ✅ Funcional | -- |
| Auto-save | ✅ Funcional | -- |
| Context Menu (right click) | ✅ Funcional | -- |
| Keyboard Shortcuts | ✅ Funcional | -- |
| File Drag & Drop | ✅ Funcional | -- |
| Chat Node (MaterialChatNode) | ✅ Funcional | -- |
| Image Analysis Modal | ✅ Funcional | -- |
| Streaming Preview | ✅ Funcional | -- |
| Content Viewer Modal | ✅ Funcional | -- |

### D. Melhorias UX Futuras (Roadmap)

| Feature | Descrição |
|---------|-----------|
| Undo/Redo | Ctrl+Z/Ctrl+Y com histórico de ações |
| Node grouping | Agrupar nodes em frames/grupos nomeados |
| Canvas zoom controls UI | Indicador de zoom % no toolbar |
| Snap guides | Linhas de alinhamento ao arrastar nodes |
| Node search | Ctrl+F para buscar conteúdo dentro dos nodes |
| Batch operations | Selecionar múltiplos nodes → gerar/deletar em batch |
| Canvas comments | Comentários no canvas (não em nodes) para colaboração |
| Export canvas as image | Screenshot do canvas inteiro como PNG |

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `supabase/config.toml` | Adicionar `[functions.late-analytics]` |
| `src/components/kai/canvas/ContentCanvas.tsx` | Polish de z-index, hover effects |
| `src/components/kai/canvas/CanvasToolbar.tsx` | Glassmorphism, mobile scroll, zoom % |
| `src/components/kai/canvas/components/CanvasEmptyState.tsx` | Keyboard feedback visual |
| `src/components/kai/canvas/components/AnimatedEdge.tsx` | Gradient edge colors |
| `src/components/kai/canvas/nodes/*.tsx` | Hover glow effect nos nodes |
| `docs/CONTENT_CANVAS.md` | Atualizar roadmap com features futuras |

