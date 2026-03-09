

# Plano de Melhorias: Documentacao + Qualidade de Conteudo das Automacoes

## Diagnostico

Apos revisao completa, identifiquei 3 areas de melhoria:

### A. Documentacao Incompleta
1. **2 arquivos de formato faltando**: `REELS_SHORT_VIDEO.md` e `LONG_VIDEO_YOUTUBE.md` sao referenciados no README mas nao existem no diretorio `docs/formatos/`
2. **CONTENT_WRITER.md desatualizado**: Nao menciona o pipeline unified-content-api (Writer → Validate → Repair → Review) nem o sistema de rotacao editorial
3. **Sem doc do pipeline de automacao**: Nao ha documentacao explicando como `process-automations` orquestra geracao, validacao e publicacao

### B. Automacao: Voice Profile Nao Injetado Diretamente
O `process-automations` chama `getFullContentContext()` que carrega identity_guide, biblioteca e top performers. Depois passa tudo para `unified-content-api` que carrega **novamente** `getFullContentContext()` + `getStructuredVoice()`. Isso significa que o Voice Profile (Use/Evite) **ja e usado** pelo unified-content-api.

**Porem**, o `process-automations` nao injeta `getStructuredVoice()` no prompt que monta antes de chamar a API. Isso cria um prompt intermediario (o `finalPrompt`) que nao tem as regras de voz. O unified-content-api adiciona depois, mas o contexto ja vem pre-construido pelo process-automations.

### C. Prompt Template sem Contexto de Voice Profile
Os `buildEnrichedPrompt()` e `variationContext` injetados pelo process-automations nao incluem instrucoes explicitas sobre o Voice Profile. Quando o prompt template e curto, o fallback generico nao menciona "siga o tom de voz do cliente".

---

## Plano de Implementacao (5 passos)

### Passo 1: Criar docs faltantes (REELS_SHORT_VIDEO.md + LONG_VIDEO_YOUTUBE.md)
- Criar `docs/formatos/REELS_SHORT_VIDEO.md` com estrutura padrao (baseado nas regras ja existentes em format-rules.ts `short_video` e `reels`)
- Criar `docs/formatos/LONG_VIDEO_YOUTUBE.md` (baseado em `long_video` do format-rules.ts)
- Ambos seguem o template: Estrutura Obrigatoria → Regras de Ouro → Boas Praticas → Formato de Entrega → Checklist → Erros Comuns

### Passo 2: Atualizar CONTENT_WRITER.md
- Adicionar secao sobre o pipeline unified-content-api (Writer → Validate → Repair → Review)
- Documentar sistema de rotacao editorial (8 categorias para tweets, 3 tipos editoriais para LinkedIn)
- Mencionar anti-exemplos (ultimos 7 posts) como mecanismo anti-repeticao
- Referenciar quality-rules.ts e content-validator.ts

### Passo 3: Injetar Voice Profile no enrichedContext do process-automations
**Mudanca principal**: No `process-automations/index.ts`, apos carregar `enrichedContext` via `getFullContentContext()`, tambem carregar `getStructuredVoice()` e concatenar ao contexto. Isso garante que o Voice Profile apareca ANTES do prompt do usuario, dando mais peso ao tom de voz.

```
Arquivo: supabase/functions/process-automations/index.ts
Mudanca: Importar getStructuredVoice e adicionar ao enrichedContext
```

### Passo 4: Melhorar buildEnrichedPrompt para incluir instrucao de voz
No fallback prompt (quando template e curto/vazio), adicionar instrucao explicita: "Siga RIGOROSAMENTE o tom de voz e as expressoes do Voice Profile do cliente. Use as expressoes da lista 'USE' e evite absolutamente as da lista 'EVITE'."

### Passo 5: Criar doc do pipeline de automacoes
- Criar `docs/AUTOMATIONS_PIPELINE.md` documentando:
  - Fluxo completo: Trigger → RSS/Schedule check → Content generation → Validation → Cleaning → Image gen → Auto-publish
  - Sistema de rotacao editorial (tweets + LinkedIn)
  - Anti-exemplos e como funciona
  - Cleaning rules e por que existem
  - Formato de entrega por plataforma

---

## Detalhes Tecnicos

**Arquivos modificados:**
- `supabase/functions/process-automations/index.ts` (importar getStructuredVoice, injetar no contexto)
- `docs/formatos/REELS_SHORT_VIDEO.md` (novo)
- `docs/formatos/LONG_VIDEO_YOUTUBE.md` (novo)
- `docs/agentes/CONTENT_WRITER.md` (atualizar)
- `docs/AUTOMATIONS_PIPELINE.md` (novo)

**Edge function redeployada:** process-automations

**Impacto esperado:** Conteudo gerado por automacoes vai ter aderencia mais forte ao Voice Profile do cliente, pois as regras de "Use/Evite" aparecerão tanto no contexto do process-automations quanto no sistema do unified-content-api (dupla camada de reforco).

