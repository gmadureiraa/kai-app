

# Plano de Melhoria do Planejamento (Estilo ClickUp)

## Problema Atual
O dialog de criação/edição de cards usa um modal estreito (`max-w-xl`) com formulário linear empilhado, difícil de navegar. Tudo fica apertado em uma única coluna vertical. No ClickUp, o detalhe de uma task é amplo, com layout de duas colunas: conteúdo principal à esquerda e propriedades/metadados à direita.

---

## Mudanças Planejadas

### 1. Dialog Expandido com Layout de Duas Colunas (ClickUp-style)
- Expandir o dialog de `max-w-xl` para `max-w-4xl` (desktop)
- **Coluna esquerda (65%)**: Título (input grande, sem label), editor de conteúdo expandido, seção de mídia, e comentários
- **Coluna direita (35%)**: Sidebar com todas as propriedades empilhadas verticalmente: Cliente, Formato, Plataformas, Data/Hora, Responsável, Coluna, Prioridade, Recorrência, e seção "Gerar com IA"
- Header do dialog: título editável inline (grande, tipo heading), com status badge ao lado

### 2. Propriedades como Campos Inline (não grid)
- Cada propriedade na sidebar direita fica em uma linha: `Label | Valor` lado a lado, como no ClickUp
- Usar ícones pequenos antes de cada label
- Campos colapsam quando vazios, mostrando placeholder clicável

### 3. Conteúdo Principal Mais Limpo
- Título como input sem borda (estilo contentEditable), fonte maior (18px)
- Editor de conteúdo com altura mínima maior (min 300px no desktop)
- Mídia embaixo do editor com grid de thumbnails maiores

### 4. Cards do Kanban - Ajustes Finos
- Padding ligeiramente maior nos cards (de `p-3` para `p-3.5`)
- Thumbnail de mídia com altura aumentada (de `h-28` para `h-32`)
- Título com fonte `text-sm` em vez de `text-[13px]`

### 5. Calendário - Cards com mais informação
- Aumentar altura mínima das células para `140px`
- Mostrar até 2 linhas do título em vez de truncar em 1

---

## Arquivos Modificados
1. **`src/components/planning/PlanningItemDialog.tsx`** - Reestruturação completa do layout (duas colunas, sidebar de propriedades)
2. **`src/components/planning/PlanningItemCard.tsx`** - Ajustes de tamanho/espaçamento
3. **`src/components/planning/CalendarView.tsx`** - Altura de células e cards

---

## Detalhes Técnicos

**Dialog - Nova estrutura:**
```text
┌─────────────────────────────────────────────────────┐
│  [Título grande editável inline]          [Status]  │
├──────────────────────────┬──────────────────────────┤
│                          │  Cliente: Kaleidos       │
│  [Editor de conteúdo]    │  Formato: Post           │
│  (área grande)           │  Plataformas: IG, TW     │
│                          │  Data: 15/04 09:00       │
│                          │  Responsável: João       │
│                          │  Coluna: Rascunho        │
│                          │  Prioridade: Alta        │
│                          │  Recorrência: Nenhuma    │
│──────────────────────────│                          │
│  [Gerar com IA]          │──────────────────────────│
│──────────────────────────│  [Publicar] [Salvar]     │
│  [Mídia: grid de fotos]  │                          │
│──────────────────────────│                          │
│  [Comentários]           │                          │
└──────────────────────────┴──────────────────────────┘
```

- No mobile, mantém layout de coluna única (atual)
- Usa `grid grid-cols-[1fr_320px]` no desktop

