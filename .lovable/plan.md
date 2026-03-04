

# Plano: Nova Automação — Artigo Longo de Marketing (2x/semana)

## O que será criado

Uma nova automação `📝 Artigo de Marketing & Growth` que gera artigos longos e aprofundados sobre marketing digital, Web3 marketing, growth e estratégia — similar aos conteúdos da biblioteca de referências do Madureira.

## Configuração

| Campo | Valor |
|---|---|
| Nome | 📝 Artigo de Marketing & Growth |
| Plataforma | `blog` |
| Content type | `blog_post` |
| Frequência | 2x/semana (Terça e Quinta, 11:00) |
| Auto-publish | `false` (para revisão) |
| Auto-generate image | `true` (capa anime) |
| Image style | `illustration` |

## Prompt

Artigo longo (1500-3000 caracteres) cobrindo temas como:
- Estratégias de growth para Web3 e tech
- Frameworks práticos de marketing digital
- Cases reais de marcas/projetos com análise detalhada
- Análise de tendências (IA em marketing, community-led growth, etc.)
- Deep dives em métricas e otimização

Regras: estrutura com H2s, dados obrigatórios, exemplos reais, tom técnico-didático, CTA no final. Proibido conteúdo genérico sem substância.

## Implementação

1. **SQL INSERT** — 1 nova automação na `planning_automations` com `content_type: blog_post`, `platform: blog`, trigger semanal Ter+Qui

