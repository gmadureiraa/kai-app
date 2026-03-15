# Plano de Melhoria: Conteúdo Menos Robótico, Mais Humano e Diverso

## Diagnóstico dos Problemas Atuais

Analisei os últimos 15 posts gerados, os prompts das automações, o pipeline `unified-content-api`, os `quality-rules.ts`, `prompt-builder.ts` e `knowledge-loader.ts`. Os problemas concretos:

**1. Estrutura repetitiva** — Quase todos os posts longos (LinkedIn, Twitter) seguem o mesmo padrão: afirmação bold → lista com bullets → "insight" → pergunta retórica. A IA encontrou uma fórmula que passa na validação e repete ad infinitum.

**2. Tom "guru de LinkedIn"** — Frases como "O que founders geralmente não falam", "Hot take:", "Aqui está o que funciona" são estruturalmente genéricas mesmo sem cair na lista de frases proibidas.

**3. Dados inventados** — Posts com "Vi 47 agências", "300+ marketers", "$25M de receita" são provavelmente alucinados. A IA cria números para parecer autoritativa.

**4. Jornal Cripto monótono** — Os 3 posts diários de BTC price seguem formato idêntico. As notícias RSS são resumos secos sem personalidade.

**5. Falta de Voice Profile no Jornal Cripto** — O voice_profile está `{}` vazio, então a IA usa tom genérico padrão.

**6. Anti-exemplos insuficientes** — O sistema puxa só 5-7 posts recentes, mas como todos são iguais, a IA simplesmente produz variações mínimas do mesmo padrão.

7. nos posts do jroan lcripto com base em notícias, não precisamos colocar links em nenhum dos casos 

---

## Plano de Ação (6 frentes)

### 1. Expandir lista de padrões estruturais proibidos em `quality-rules.ts`

Adicionar uma nova camada de detecção: **padrões estruturais de IA**, não apenas frases. Exemplos:

- Abertura "X fez/disse Y. O que poucos sabem:"
- Padrão "lista de contrastes" (fazem X / não fazem Y)
- "Hot take:" como abertura
- "Aqui está o que funciona" / "O que eu aprendi"
- Números suspeitosamente redondos sem fonte ("300+ empresas", "92% dos builders")

Adicionar validação no `content-validator.ts` para detectar e reprovar esses padrões.

### 2. Reformar instruções de variação editorial com exemplos concretos

Os `VARIATION_CATEGORIES` atuais dão instruções vagas ("Use um tom provocativo"). Reformar para incluir **exemplos concretos de formato de output** para cada categoria:

```text
// Antes:
{ name: 'Provocação', instruction: 'Use um tom provocativo e desafiador...' }

// Depois:
{ name: 'Provocação', instruction: `Escreva como se estivesse respondendo 
um tweet que te irritou. Formato: frase curta + ponto final + uma segunda 
frase que explica por quê. Exemplo de ESTRUTURA (NÃO copie o conteúdo):
"Todo mundo quer escalar. Ninguém quer simplificar primeiro."
NÃO use listas, bullets ou formato "X vs Y".` }
```

Fazer isso para TODAS as categorias de tweet, threads, linkedin e blog.

### 3. Criar regra anti-alucinação de dados no `prompt-builder.ts`

Adicionar regra universal no `UNIVERSAL_OUTPUT_RULES`:

```text
### REGRA #5: DADOS REAIS OU NENHUM
- ❌ NUNCA invente números, métricas ou estatísticas
- ❌ NUNCA cite empresas/pessoas fazendo algo específico sem fonte real
- ✅ Se não tem dado real, use a experiência pessoal do cliente
- ✅ Prefira "na minha experiência" a "segundo pesquisa"
- ✅ Se usar número, seja específico e realista (não "300+ empresas")
```

### 4. Criar e popular Voice Profile do Jornal Cripto

Atualizar via migration o `voice_profile` do Jornal Cripto com tom definido:

- **Tone**: Informativo, acessível, ligeiramente descontraído. Notícias sem sensacionalismo.
- **Use**: "atualização", "dados mostram", "segundo", "cotação", "neste momento"
- **Avoid**: "corre!", "urgente", "oportunidade imperdível", "bomba", "fique de olho", "saiba mais"

### 5. Diversificar posts de preço do BTC (Jornal Cripto)

Os 3 posts diários (manhã/tarde/noite) usam o mesmo prompt. Criar 3 templates distintos:

- **Manhã**: Formato "bom dia cripto" — resumo rápido em 1-2 linhas, tom casual
- **Tarde**: Formato "análise rápida" — preço + contexto do que movimentou (usa variação editorial)  
- **Noite**: Formato "fechamento" — resumo do dia, tom mais analítico

Atualizar os `prompt_template` das 3 automações de BTC.

### 6. Melhorar anti-exemplos com detecção de padrão estrutural

No `process-automations`, ao carregar anti-exemplos, extrair não apenas o texto mas os **padrões estruturais** usados (abertura com pergunta, lista de contrastes, storytelling, etc.) e instruir explicitamente a IA a usar um padrão estrutural DIFERENTE.

Modificar a injeção de anti-exemplos no `buildEnrichedPrompt()` para adicionar:

```text
PADRÕES ESTRUTURAIS JÁ USADOS RECENTEMENTE:
- Abertura com nome de pessoa + feito impressionante (3x)
- Lista de contrastes "fazem X / não fazem Y" (4x)
- Pergunta retórica no final (5x)

USE UM PADRÃO ESTRUTURAL DIFERENTE.
```

---

### Arquivos a modificar

1. `**supabase/functions/_shared/quality-rules.ts**` — Adicionar padrões estruturais proibidos + regra anti-alucinação
2. `**supabase/functions/_shared/prompt-builder.ts**` — Regra #5 (dados reais) no `UNIVERSAL_OUTPUT_RULES`
3. `**supabase/functions/_shared/content-validator.ts**` — Validação de padrões estruturais repetitivos
4. `**supabase/functions/process-automations/index.ts**` — Reformar `VARIATION_CATEGORIES` (tweet, linkedin, threads, blog) com exemplos concretos + melhorar anti-exemplos com detecção de padrão estrutural + diversificar templates BTC
5. **Database migration** — Popular voice_profile do Jornal Cripto + atualizar prompt_templates dos 3 posts de BTC