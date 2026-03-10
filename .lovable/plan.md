

# Reorganização Visual das Automações

## Problema Atual
Os nomes das automações incluem a rede social redundantemente (ex: "LinkedIn — Newsletter do Dia", "Thread Twitter — Newsletter"), quando já existe um badge de plataforma ao lado. Além disso, os badges de plataforma são genéricos e pouco visuais.

## Mudanças

### 1. Ícones coloridos de plataforma em vez de badges de texto
Substituir os badges de texto "Twitter", "LinkedIn" etc. por ícones com cores de marca (mesmo padrão já usado no Planejamento). Cada plataforma terá seu ícone SVG + cor de fundo, exibido como chip visual ao lado do nome.

Mapa de cores:
- Twitter/X → cinza escuro
- LinkedIn → azul #0077B5
- Instagram → gradiente rosa/roxo
- Threads → cinza
- YouTube → vermelho
- Facebook → azul #1877F2
- TikTok → preto
- Newsletter → verde
- Blog → laranja

### 2. Limpeza inteligente dos nomes
Criar uma função `cleanAutomationName` que remove prefixos de plataforma redundantes do nome:
- "LinkedIn — Newsletter do Dia" → "Newsletter do Dia"
- "Thread Twitter — Newsletter" → "Newsletter" (Thread aparece como content type badge)
- "Tweet — Dica & Ferramenta" → "Dica & Ferramenta" (Tweet aparece como content type)
- Nomes sem prefixo (ex: "GM Diário Defiverso") ficam intactos

### 3. Layout melhorado do card
```text
[📅] Newsletter do Dia          [Post] [🔵 LinkedIn] [🟣 IA] [🟢 Auto]   [🔛] [⋮]
     RSS Feed: rss.beehiiv.com
     Última: há 3 horas • 2 cards
```

Mudanças visuais:
- Ícones de plataforma com fundo colorido (circulares, 20px)
- Badges `platforms[]` também renderizados (para automações multi-plataforma)
- Separação visual mais clara entre nome/tags e metadados

### 4. Ordenação dentro de cada grupo
Automações ativas primeiro, depois pausadas. Dentro de cada grupo, ordenar por `last_triggered_at` (mais recente primeiro).

## Arquivo Afetado
`src/components/automations/AutomationsTab.tsx` — único arquivo. Todas as mudanças são no componente `AutomationCard` e helpers.

