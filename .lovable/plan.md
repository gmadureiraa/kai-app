

# Atualizar Automação Preço do Bitcoin — Jornal Cripto

## Mudanças

### 1. Transformar em 3 postagens diárias
A automação atual posta 1x às 07:00. Vou:
- **Manter** a existente (`75d83989`) e ajustar para "Preço do Bitcoin — Manhã" às 07:00
- **Criar** "Preço do Bitcoin — Tarde" às 13:00
- **Criar** "Preço do Bitcoin — Noite" às 20:00

Todas com as mesmas configurações (plataformas: twitter, linkedin, threads).

### 2. Atualizar prompt de imagem
Baseado na referência enviada (fundo laranja, preço grande, moedas BTC, setas de movimento), atualizar o `image_prompt_template` para:

- Fundo laranja vibrante com grid pontilhado sutil
- Preço do Bitcoin grande e centralizado em branco bold
- Moedas de Bitcoin douradas como elementos decorativos
- Setas indicando movimento (alta/queda)
- Logo "X @JornalCripto" na parte inferior centralizado
- **Sem baleia**, sem texto além do @ e preço
- Estilo moderno, editorial financeiro

### 3. Atualizar prompt de texto
Adaptar o prompt para funcionar nos 3 horários (manhã/tarde/noite) usando `{{time_of_day}}`.

## Execução
| Ação | Detalhe |
|------|---------|
| Database | UPDATE automação existente (nome + image prompt) |
| Database | INSERT 2 novas automações (tarde e noite) |
| Nenhum arquivo | Só alterações no banco |

