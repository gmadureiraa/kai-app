

# Plano: Automação Thread Twitter — Defiverso (Newsletter)

## O que será criado

Uma automação RSS que, a cada nova newsletter do Defiverso (Beehiiv), gera automaticamente uma **Thread no Twitter/X** com:
- Conteúdo baseado na leitura real da newsletter (via Firecrawl)
- Estrutura de thread seguindo as regras do guia `THREAD.md` (gancho com 🧵, numeração X/Y, um ponto por tweet, último tweet com resumo + CTA)
- **Imagens geradas por IA** incluindo capa no primeiro tweet (estética alien/space do Defiverso)
- Auto-publicação

## Execução

1 INSERT na tabela `planning_automations` com:

| Campo | Valor |
|-------|-------|
| `name` | Thread Twitter — Newsletter |
| `client_id` | c1227fa7-f9c4-4f8c-a091-ae250919dc07 |
| `trigger_type` | rss |
| `trigger_config.url` | https://rss.beehiiv.com/feeds/UQC5Rb8a1M.xml |
| `platform` | twitter |
| `content_type` | thread |
| `auto_generate_content` | true |
| `auto_generate_image` | true |
| `image_style` | vibrant |
| `auto_publish` | true |
| `target_column_id` | 918ac10d-dc1d-4212-8150-58f3ae32edc9 (Publicado) |

O `prompt_template` instruirá o sistema a:
- Ler a newsletter completa via link
- Extrair os 5-8 pontos mais relevantes
- Criar thread de 7-10 tweets no formato correto (gancho 🧵, numeração, um conceito por tweet, último com resumo + "RT o primeiro tweet")
- Tom Defiverso: "GM humanos do criptoverso", técnico mas acessível

O `image_prompt_template` gerará imagens no estilo alien/space para distribuir nos tweets.

Sem mudança de código — o pipeline existente já suporta `content_type: 'thread'` com parsing, distribuição de imagens e publicação via Twitter API.

