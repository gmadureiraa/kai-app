

# Plano: Regras de Criação como Fonte Única + Exemplos + Remover VISUAL RECOMENDADO

## Problema Atual

Existem **3 cópias** desincronizadas das regras de formato:
1. `supabase/functions/_shared/format-rules.ts` — o que a IA realmente usa
2. `docs/formatos/CARROSSEL.md` — arquivo markdown separado
3. `src/pages/Documentation.tsx` — dados hardcoded na UI (array `formatRules`)

Alterar na documentação **não** altera o comportamento da IA. Além disso, o carrossel ainda menciona "VISUAL RECOMENDADO" em múltiplos lugares.

---

## Implementação

### 1. Remover "VISUAL RECOMENDADO" de todos os lugares

**Arquivos afetados:**
- `supabase/functions/_shared/format-rules.ts` — remover qualquer menção a VISUAL RECOMENDADO no template do carousel
- `docs/formatos/CARROSSEL.md` — limpar formato de entrega e exemplos (apenas "Página X:" + texto)
- `src/pages/Documentation.tsx` — atualizar `deliveryFormat` do carrossel

O formato de entrega do carrossel passa a ser:
```
Página 1:
[Headline impactante - máx 8 palavras]
[Subtítulo se necessário]

---

Página 2:
[Título do ponto]
[Texto - máx 30 palavras]

---
[...]

LEGENDA:
[Texto da legenda]
```

### 2. Fonte Única de Verdade: format-rules.ts → Documentation.tsx

Em vez de manter dados hardcoded duplicados na UI, criar um arquivo compartilhado `src/lib/formatRulesData.ts` que exporta o array `formatRules` (com structure, goldenRules, deliveryFormat, commonMistakes, **examples**). Este arquivo será:
- Importado por `Documentation.tsx` para exibir na UI
- A referência canônica que deve espelhar exatamente o `FORMAT_RULES` em `format-rules.ts`

Adicionar um aviso claro no topo de ambos os arquivos: "Ao alterar regras aqui, atualize também o arquivo espelho."

### 3. Adicionar 1-2 Exemplos por Formato

Adicionar campo `examples` ao tipo de dados de cada formato em `src/lib/formatRulesData.ts`. Cada exemplo é um conteúdo completo no formato de entrega, servindo como referência.

Para o **carrossel**, usar os exemplos já existentes no `CARROSSEL.md` (o de produtividade e templates do guia), adaptados sem VISUAL RECOMENDADO.

Para os demais formatos, criar exemplos concisos mas completos mostrando o formato correto.

Na UI (`FormatRuleCard`), renderizar os exemplos numa seção "📌 Exemplos de Referência" com `<pre>` formatado.

### 4. Atualizar CARROSSEL.md e demais docs de formato

Sincronizar `docs/formatos/CARROSSEL.md` para refletir as mesmas regras sem VISUAL RECOMENDADO.

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/formatRulesData.ts` | **Criar** — fonte única para UI com structure, rules, examples |
| `src/pages/Documentation.tsx` | **Modificar** — importar de `formatRulesData.ts` em vez de dados hardcoded |
| `supabase/functions/_shared/format-rules.ts` | **Modificar** — remover VISUAL RECOMENDADO do carousel, adicionar aviso de sync |
| `docs/formatos/CARROSSEL.md` | **Modificar** — remover VISUAL RECOMENDADO, atualizar exemplos |

