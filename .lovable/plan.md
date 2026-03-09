

# Fix: Documentação em Configurações + Melhorias

## Bug Principal

Em `SettingsTab.tsx`:
- Linha 44: `validSections` não inclui `"docs"` → quando a URL tem `section=docs`, cai no fallback para `"profile"`
- Linha 324: `renderSectionContent` não tem case para `"docs"` → mesmo que fosse reconhecido, não renderizaria nada

**Fix**: Adicionar `"docs"` ao array `validSections` e adicionar case `"docs"` que renderiza a página `Documentation` completa (935 linhas, com regras de formato, comandos inteligentes, etc.) em vez do `KaiDocsTab` simplificado (apenas 4 cards com links `#`).

## Melhorias Adicionais

### 1. Eliminar `KaiDocsTab` redundante
O `KaiDocsTab.tsx` é uma versão simplificada com 4 cards apontando para `#` (sem destino). A página `Documentation.tsx` já tem conteúdo completo e rico. Substituir todas as referências ao `KaiDocsTab` pelo `Documentation` inline.

### 2. Remover rota `/kaleidos/docs` duplicada
Em `App.tsx` linha 40, existe uma rota `docs` que renderiza `<Documentation />` separadamente. Com a documentação integrada nas Configurações, essa rota é redundante.

### 3. Limpar console.logs de debug
Existem `console.log` de debug espalhados em:
- `src/contexts/GlobalKAIContext.tsx` (linha 295)
- `src/components/performance/InstagramCSVUpload.tsx` (linhas 67, 95, 160)
- `src/hooks/useLateConnection.ts` (linhas 226, 264)

## Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/components/settings/SettingsTab.tsx` | Adicionar "docs" a validSections, importar Documentation content, adicionar case |
| `src/components/settings/SettingsNavigation.tsx` | Já tem "docs" — OK |
| `src/components/kai/KaiDocsTab.tsx` | Deletar (redundante) |
| `src/App.tsx` | Remover rota `/kaleidos/docs` e import de Documentation |
| `src/pages/Kai.tsx` | Remover case "docs" do renderContent e import de KaiDocsTab |
| `src/contexts/GlobalKAIContext.tsx` | Remover console.log debug |
| `src/components/performance/InstagramCSVUpload.tsx` | Remover console.logs |
| `src/hooks/useLateConnection.ts` | Remover console.logs |

