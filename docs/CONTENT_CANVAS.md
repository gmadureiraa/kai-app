# 🎨 Content Canvas — Editor Visual
> Última atualização: 09 de Março de 2026

## Visão Geral

O Content Canvas é um editor visual baseado em **ReactFlow** que permite organizar, conectar e gerar conteúdo de forma visual. Funciona como um "whiteboard" de ideias com nós conectáveis, geração de IA integrada e ferramentas de desenho.

---

## 🏗️ Componentes

```
src/components/kai/canvas/
├── ContentCanvas.tsx              # Componente principal (ReactFlow + Whiteboard)
├── CanvasToolbar.tsx              # Barra de ferramentas unificada
├── CanvasLibraryDrawer.tsx        # Drawer para arrastar conteúdo da library
├── nodes/
│   ├── AttachmentNode.tsx         # Nó de anexo (URL, arquivo, imagem, áudio, vídeo, library)
│   ├── GeneratorNode.tsx          # Nó gerador de conteúdo (texto/imagem via IA)
│   ├── ContentOutputNode.tsx      # Nó de resultado (texto/imagem gerado)
│   ├── MaterialChatNode.tsx       # Nó de chat flutuante no canvas
│   ├── TextNode.tsx               # Nó de texto livre (whiteboard)
│   ├── StickyNode.tsx             # Sticky note (whiteboard)
│   └── ShapeNode.tsx              # Forma geométrica (whiteboard)
├── hooks/
│   ├── useCanvasState.ts          # Estado dos nós, edges, persistência e auto-save
│   ├── useCanvasGeneration.ts     # Lógica de geração via IA (texto e imagem)
│   ├── useCanvasPersistence.ts    # Auto-save no banco (debounced 2s)
│   ├── useCanvasExtractions.ts    # Extração de URL (YouTube, artigos)
│   └── useCanvasShortcuts.ts      # Atalhos de teclado
└── components/
    ├── AnimatedEdge.tsx           # Edge animada entre nós
    ├── ApprovalStatus.tsx         # Status de aprovação nos nós
    ├── CanvasContextMenu.tsx      # Menu de contexto (right-click)
    ├── CanvasEmptyState.tsx       # Empty state com atalhos rápidos
    ├── DrawingLayer.tsx           # Camada de desenho livre (pencil/eraser)
    ├── InputPreviews.tsx          # Previews de inputs conectados
    ├── LazyImage.tsx              # Carregamento lazy de imagens
    ├── NodeComment.tsx            # Comentários em nós
    ├── SimpleModeToggle.tsx       # Toggle de modo simples
    ├── StreamingPreview.tsx       # Preview de streaming de geração
    ├── TranscriptionModal.tsx     # Modal de transcrição de áudio/vídeo
    └── VersionHistory.tsx         # Histórico de versões de conteúdo
```

---

## 📦 Tipos de Nós

### Nós de Conteúdo (Core)

| Nó | Descrição | Funcionalidade |
|----|-----------|----------------|
| **Attachment** | Entrada de dados (URL, arquivo, imagem, áudio, vídeo, library) | Extrai conteúdo de URLs, transcreve áudio/vídeo, importa da biblioteca |
| **Generator** | Gerador de conteúdo via IA | Configura formato, plataforma, prompt e gera texto ou imagem |
| **Output** | Resultado da geração | Exibe conteúdo gerado, permite edição, remix, envio ao planning |
| **Chat** | Chat IA no canvas | Conversa livre com IA, pode criar nós de resultado |

### Nós de Whiteboard

| Nó | Descrição | Funcionalidade |
|----|-----------|----------------|
| **Text** | Texto livre | Editável inline, configurável (tamanho, cor, alinhamento) |
| **Sticky** | Nota adesiva | Cores configuráveis, tamanhos variados |
| **Shape** | Forma geométrica | Retângulo, círculo, triângulo, diamante com fill/stroke |

### Fluxo Principal
```
Attachment (entrada) → Generator (processamento) → Output (resultado)
```

---

## 🔗 Persistência

Tabela `content_canvas`:
```sql
{
  id: uuid,
  workspace_id: uuid,
  client_id: uuid,
  user_id: uuid,
  name: text,
  nodes: jsonb,    -- Array de nós do ReactFlow
  edges: jsonb,    -- Array de conexões
  created_at, updated_at
}
```

- **Auto-save:** debounced (2s) após qualquer alteração
- **Múltiplos canvas:** Pode salvar, carregar e deletar canvas separados
- **Templates:** Templates pré-configurados com nós já conectados

---

## ✨ Funcionalidades Implementadas

### Core
1. **Drag & Drop** — Arrastar conteúdo da library para o canvas
2. **Drag & Drop de Arquivos** — Arrastar imagens, áudios, vídeos diretamente do sistema
3. **Chat no Canvas** — Chat IA inline via MaterialChatNode
4. **Conexões** — Conectar Attachment → Generator para contexto automático
5. **Geração de Texto** — Gerar conteúdo via IA com formato/plataforma configuráveis
6. **Geração de Imagem** — Gerar imagens via IA com referências visuais
7. **Remix** — Criar variações de conteúdo a partir de um Output existente
8. **Envio ao Planning** — Enviar Output diretamente para o Kanban de Planejamento
9. **Extração de URL** — Extrair conteúdo de YouTube, artigos, websites
10. **Transcrição** — Transcrever áudios e vídeos com IA

### Whiteboard
11. **Desenho Livre** — Ferramenta pencil com cores e tamanhos configuráveis
12. **Borracha** — Apagar traços de desenho
13. **Texto Livre** — Nós de texto no canvas
14. **Sticky Notes** — Notas adesivas coloridas
15. **Formas** — Retângulo, círculo, triângulo, diamante

### Gestão
16. **Salvar/Carregar Canvas** — Múltiplos canvas por cliente
17. **Templates Rápidos** — Carrossel, Thread, LinkedIn, Stories, Repurpose, Imagens
18. **Atalhos de Teclado** — Ctrl+S (salvar), Delete (deletar nó), atalhos de ferramentas
19. **Menu de Contexto** — Right-click para ações rápidas
20. **Empty State** — Interface guiada com atalhos e templates
21. **Histórico de Versões** — Rastreamento de versões em nós de Output
22. **Comentários** — Adicionar comentários em nós de Output
23. **Status de Aprovação** — Draft → Review → Approved em nós de Output

---

## 🤖 Geração via Canvas

### Geração de Texto
```
Attachment(s) selecionado(s)
  → Conecta ao Generator
  → Generator coleta conteúdo de todos Attachments conectados
  → Configura formato (carousel, thread, post, etc.) e plataforma
  → Chama edge function com contexto do cliente + conteúdo
  → Novo Output Node criado e conectado automaticamente
  → Conteúdo pode ser editado inline
```

### Geração de Imagem
```
Generator configurado para tipo "image"
  → Coleta texto/briefing de nós conectados
  → Busca referências visuais do cliente (DNA visual)
  → Chama generate-image
  → Novo Output Node com imagem criado e conectado
```

### Remix
```
Output Node existente
  → Clica "Remix"
  → Novo Generator criado e conectado ao Output
  → Generator pré-configurado com mesmo formato/plataforma
  → Permite ajustar prompt e gerar variação
```

### Continuidade e Memória
- Nós de Attachment conectados fornecem contexto automático ao Generator
- Múltiplos Attachments podem alimentar um único Generator
- Output pode ser conectado a novo Generator para refinamento iterativo

---

## ⌨️ Atalhos e Interações

| Ação | Atalho/Gesto |
|------|-------------|
| Salvar canvas | `Ctrl+S` |
| Deletar nó | `Delete` / `Backspace` |
| Conectar nós | Drag do handle de saída para handle de entrada |
| Zoom | Scroll / Pinch |
| Pan | Click + Drag no fundo |
| Fit to view | Botão "Fit" nos controles |
| Menu de contexto | Right-click no canvas |
| Adicionar texto | Click com ferramenta Text ativa |
| Adicionar sticky | Click com ferramenta Sticky ativa |
| Desenhar | Drag com ferramenta Pencil ativa |
| Apagar | Drag com ferramenta Eraser ativa |

---

## 📤 Movendo para Planning

Conteúdo gerado no Canvas pode ser enviado para o Planning:
1. Seleciona Output Node
2. Clica "Enviar para Planning"
3. Abre PlanningItemDialog pré-preenchido
4. Cria card no Kanban (coluna "Rascunho" por padrão)
5. Preserva conteúdo, plataforma, formato e metadados
6. Thread tweets são parseados automaticamente para formato correto

---

## 📊 Analytics (Beta) — Novo

### Visão Geral
Dashboard de métricas em tempo real via Late API, separado da aba Performance (dados históricos).

### Arquitetura
```
KaiAnalyticsTab
  → useLateAnalytics hook (React Query, 5min cache)
    → late-analytics Edge Function
      → Late API (/analytics + /follower-stats)
```

### Funcionalidades
- **Métricas por plataforma:** Instagram, Twitter, LinkedIn, TikTok, YouTube, Threads
- **Follower Stats:** Seguidores atuais, crescimento 7d/30d, sparkline
- **Top Posts:** Top 10 posts recentes por engagement rate
- **Agregados:** Engagement rate médio, impressões totais, curtidas, comentários
- **Período:** Toggle 7d / 30d
- **Refresh:** Botão para atualização manual on-demand
- **Sync Status:** Indicador de última atualização

### Arquivos
```
supabase/functions/late-analytics/index.ts  # Edge Function
src/hooks/useLateAnalytics.ts               # Hook React Query
src/components/kai/KaiAnalyticsTab.tsx       # Dashboard UI
```

---

## 🔮 Recursos Futuros (Roadmap)

### Canvas v2
- [ ] **Colaboração em tempo real** — Múltiplos usuários editando o mesmo canvas simultaneamente
- [ ] **Grupos de nós** — Agrupar nós relacionados em containers
- [ ] **Zoom semântico** — Níveis de detalhe diferentes por zoom
- [ ] **Export** — Exportar canvas como imagem (html-to-image já instalado)
- [ ] **Undo/Redo** — Histórico de ações com Ctrl+Z / Ctrl+Y
- [ ] **Minimap interativo** — Clicar no minimap para navegar

### Geração Avançada
- [ ] **Geração em batch** — Gerar múltiplos formatos de um único briefing
- [ ] **A/B Testing** — Criar variações e comparar lado a lado
- [ ] **Brand Voice Lock** — Travar tom de voz por cliente para todas as gerações
- [ ] **Prompt Library** — Biblioteca de prompts reutilizáveis por formato
- [ ] **Auto-suggest** — Sugerir próximos nós baseado no contexto

### Analytics v2
- [ ] **Comparativo temporal** — Comparar períodos (esta semana vs semana passada)
- [ ] **Heatmap de horários** — Melhor horário para postar por plataforma
- [ ] **Benchmarks** — Comparar métricas com médias do setor
- [ ] **Alertas** — Notificar queda/aumento significativo de métricas
- [ ] **Export de relatório** — Gerar PDF com métricas selecionadas
- [ ] **Integração com Performance** — Combinar dados históricos + real-time

### Integrações
- [ ] **Canva integration** — Abrir designs do Canva como referências
- [ ] **Figma integration** — Importar frames do Figma
- [ ] **Google Trends** — Pesquisar tendências diretamente no canvas
- [ ] **Competitor Monitoring** — Monitorar posts de concorrentes

---

*Última atualização: 09 de Março de 2026*
