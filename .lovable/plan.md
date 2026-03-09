

# Ajuste: Voice Profile do Gabriel Madureira

## Mudança

Atualizar o `voice_profile` do Madureira para:
- **Remover** "Web3" e "full-stack" da lista `use` (termos técnicos demais)
- **Adicionar** termos de marketing mais acessíveis: "marketing digital", "estratégia de conteúdo", "cripto" (uso leve)
- **Ajustar o tone** para refletir foco em marketing com menções ocasionais a cripto

### Novo perfil:

**Tone:** "Técnico mas didático, direto e sem rodeios, visionário e provocador, transparente (building in public). Foco em marketing e estratégia de conteúdo, com menções pontuais a cripto quando relevante."

**Use:** `["builders", "na prática", "o que funciona", "growth", "framework", "hack", "tá ligado", "bora", "vou te mostrar", "automação", "na real", "olha só", "case real", "marketing digital", "estratégia de conteúdo", "cripto"]`

**Avoid:** (mantém os atuais) + `["Web3", "web3", "full-stack"]`

## Execução

1 UPDATE na tabela `clients` — apenas dados, sem mudança de schema.

