

# Plano: Sino de Notificações no Desktop + Ajustes Gerais

## Problema
O `NotificationBell` existe e funciona, mas no desktop ele **nao aparece em lugar nenhum** -- so e renderizado no `MobileHeader`. No desktop, o usuario nao tem como ver notificacoes.

## Mudancas

### 1. Adicionar NotificationBell na Sidebar (Desktop)
- No `KaiSidebar.tsx`, adicionar o componente `NotificationBell` na area inferior da sidebar, acima do bloco do usuario
- Quando a sidebar estiver colapsada, mostrar apenas o icone com badge de contagem
- Quando expandida, mostrar icone + texto "Notificacoes" + badge

### 2. Estilizar o Bell para contexto de Sidebar
- Criar uma variante do botao do bell que se integre visualmente com os outros itens da sidebar (mesmo padding, cores, hover)
- O popover de notificacoes abre ao lado (right) quando na sidebar

### 3. Revisar itens pendentes no Planejamento
- Verificar se o `PlanningListRow` esta navegando corretamente ao clicar (abrir dialog)
- Confirmar que os status "publishing" e "failed" funcionam nas colunas do Kanban

### 4. Verificar Automacoes e Performance
- Checar se ha warnings ou erros visiveis nos componentes de automacoes e performance
- Garantir consistencia visual (mesmos padroes de cards/tabelas)

## Detalhes Tecnicos

**Arquivo principal**: `src/components/kai/KaiSidebar.tsx`
- Importar `NotificationBell` 
- Inserir entre o bloco "Collapse Toggle" e o bloco "User" (linhas ~412-414)
- Usar o mesmo pattern de `NavItem` para manter consistencia visual
- Passar estado `collapsed` para ajustar layout

**Arquivo secundario**: `src/components/notifications/NotificationBell.tsx`
- Ajustar para aceitar prop opcional `variant="sidebar"` que muda o estilo do trigger (botao mais largo, texto ao lado)
- Manter o Popover alinhado a `side="right"` quando usado na sidebar

## Resultado
O usuario tera acesso permanente as notificacoes no desktop via sidebar, com badge de contagem visivel. No mobile, continua funcionando pelo header como ja esta.

