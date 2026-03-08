

# Revisao Completa do App - Plano de Melhorias

Apos revisar todas as paginas e componentes do projeto, identifiquei os seguintes problemas e oportunidades de melhoria:

---

## Problemas Encontrados

### 1. Pagina 404 - WhatsApp com numero falso
O `NotFound.tsx` (linha 70) usa `wa.me/5511999999999` como link de suporte - um numero placeholder. Deveria usar o mesmo link real do WhatsApp que a pagina Help usa: `https://api.whatsapp.com/send/?phone=12936180547`.

### 2. Help - Links de artigos nao funcionam
Os artigos nas categorias da pagina Help sao `<button>` sem acao nenhuma - clicar neles nao faz nada. Sao links mortos.

### 3. Help - Video tutorial e placeholder
A secao "Aprenda em 5 minutos" mostra um botao "Assistir tutorial" que nao vai a lugar nenhum.

### 4. Help - Link /settings quebrado
O quick link "Configuracoes" aponta para `/settings` que nao existe como rota no App.tsx. Deveria apontar para `/kaleidos?tab=settings`.

### 5. Help - Link /kai desatualizado
Os links "Voltar ao app" e "Abrir Canvas" apontam para `/kai` em vez de `/kaleidos`.

### 6. Sidebar - Automacoes so visivel para devs
A aba de Automacoes na sidebar so aparece para usuarios com `hasDevAccess`. Se voce quer que admins do workspace tambem vejam, isso precisa mudar.

### 7. NotFound - Icone Search para "Entrar na conta"
O botao "Entrar na conta" usa icone `Search` em vez de um icone mais adequado como `LogIn`.

### 8. Rotas catch-all redirecionam para /kaleidos
As rotas `/:slug` e `/:slug/*` redirecionam tudo para `/kaleidos`, impedindo paginas como `/no-workspace` e `/help` de funcionar corretamente via navegacao direta (embora /help esteja declarado antes, `/no-workspace` nao esta na lista de rotas).

### 9. Rota /no-workspace ausente
`NoWorkspacePage` e importado em Login.tsx redirect logic mas a rota `/no-workspace` nao esta declarada no App.tsx, fazendo o redirect cair no catch-all `/:slug` → `/kaleidos`.

---

## Plano de Implementacao

### Passo 1: Corrigir NotFound.tsx
- Trocar WhatsApp placeholder pelo link real
- Trocar icone Search por LogIn

### Passo 2: Corrigir links da pagina Help
- `/kai` → `/kaleidos`
- `/settings` → `/kaleidos?tab=settings`
- `/kai?tab=planning` → `/kaleidos?tab=planning`

### Passo 3: Adicionar rota /no-workspace no App.tsx
- Importar e adicionar `<Route path="/no-workspace" element={<NoWorkspacePage />} />` antes dos catch-alls

### Passo 4: Tornar Automacoes visivel para admins do workspace
- Mudar condicao de `hasDevAccess` para `hasDevAccess || canManageTeam` na sidebar

### Passo 5: Remover/melhorar secoes placeholder do Help
- Remover secao de video tutorial (ou marcar como "Em breve")
- Adicionar toast "Em breve" ao clicar nos artigos

---

## Detalhes Tecnicos

- **Arquivos afetados**: `NotFound.tsx`, `Help.tsx`, `App.tsx`, `KaiSidebar.tsx`
- **Sem migracao de banco** necessaria
- **Sem novas dependencias**
- Todas as mudancas sao frontend-only

