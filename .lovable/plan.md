

# Plano: Humanizar BTC, GM Madureira e GM Defiverso

## Problemas Concretos Detectados nos Últimos Posts

**BTC (Jornal Cripto)** — IA ignora o template e volta aos vícios:
- "Bitcoin dispara!" / "Bitcoin em queda!" (sensacionalismo proibido)
- "O que isso significa para o mercado?" (filler genérico)
- "Siga para não perder" / "acesse jornalcripto.com" (CTAs e links proibidos)
- "Será que o Bitcoin vai disparar?" (clickbait)

**GM Madureira** — Desvios do objetivo:
- "Cripto tá premiando inovação real" (virou insight/guru, não é GM)
- "O Bitcoin subiu 1.5%" (mistura preço BTC no GM, foge do propósito)
- Template atual é bom mas precisa ser mais rígido nas proibições

**GM Defiverso** — Fora das specs:
- Posts com 200+ chars (limite é 180)
- "Fato: a descentralização é o futuro" (genérico/guru)
- "Quase 50% dos investidores nunca venderam" (dado inventado)
- Falta a personalidade alienígena/espacial da marca

---

## Ação: Reescrever os 5 Templates via Migration

### 1. BTC Manhã — Reforçar anti-sensacionalismo
Adicionar proibições explícitas inline: "NUNCA use 'dispara', 'despenca', 'será que vai'. NUNCA faça perguntas retóricas. NUNCA adicione CTAs." Exemplo mais seco e factual.

### 2. BTC Tarde — Mesmo reforço
Proibir "O que isso significa?", links, CTAs. Manter tom contextual.

### 3. BTC Noite — Mesmo reforço
Proibir "Para análises completas", links. Manter tom analítico de fechamento.

### 4. GM Madureira — Blindar contra desvios
Adicionar: "PROIBIDO falar de preço de Bitcoin, insight de mercado, ou qualquer conteúdo educacional. O GM é SOCIAL, não informativo." Mais exemplos de variação (música, café, rotina).

### 5. GM Defiverso — Respeitar limite + personalidade
Reforçar 180 chars max com "CONTE os caracteres". Proibir dados inventados. Adicionar exemplos com personalidade alien/space. Proibir tom de professor.

### Arquivos
- **Database migration** — UPDATE nos 5 `prompt_template` das automações

