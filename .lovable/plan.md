

# Plano: Automações LinkedIn + Twitter para Gabriel Madureira

## Estado Atual
- **Client ID:** `c3fdf44d-1eb5-49f0-aa91-a030642b5396`
- **Twitter conectado:** account_id `6967b6e72b6dfd227e11c4b3` (valid)
- **LinkedIn conectado:** account_id `6967b73c2b6dfd227e11c4b6` (valid)
- **5 automações Twitter já existentes:** GM, Insight Diário, Visual, Noturno, Thread Semanal
- **0 automações LinkedIn**
- **Biblioteca:** 6+ conteúdos (tweets, articles, case studies) + 10+ referências (x_articles, tweets)

## Novas Automações a Criar

### LinkedIn (3 automações)

**1. Post LinkedIn Semanal — Artigo de Opinião**
- **Trigger:** Weekly, terça-feira 09:00
- **Formato:** `linkedin_post`
- **Prompt:** Criar post longo estilo artigo de opinião sobre marketing Web3, empreendedorismo ou tecnologia. Tom profissional e provocador. Baseado nas referências da biblioteca. Estrutura: hook forte → desenvolvimento com dados → conclusão com CTA de debate.
- `auto_publish: false` (revisão antes de publicar no LinkedIn)

**2. Post LinkedIn Semanal — Building in Public**
- **Trigger:** Weekly, quinta-feira 10:00
- **Formato:** `linkedin_post`
- **Prompt:** Compartilhar aprendizado real da Kaleidos — bastidores, decisões, métricas, erros. Tom transparente e autêntico. Baseado nos pilares de conteúdo do cliente.
- `auto_publish: false`

**3. Post LinkedIn Semanal — Case/Prova Social**
- **Trigger:** Weekly, sexta-feira 11:00
- **Formato:** `linkedin_post`
- **Prompt:** Post de prova social — resultado de cliente, framework utilizado, ou insight prático do trabalho na Kaleidos. Tom autoridade + didático.
- `auto_publish: false`

### Twitter (1 automação adicional)

**4. Tweet de Dica/Ferramenta**
- **Trigger:** Weekly, quarta-feira 14:00
- **Formato:** `tweet`
- **Prompt:** Tweet prático com dica de ferramenta, hack de produtividade ou insight de copywriting. Baseado no pilar 4 do guia de conteúdo. Direto, acionável, curto.
- `auto_publish: false`

## Implementação
- **4 INSERTs** na tabela `planning_automations` via insert tool
- Sem mudanças de código — o sistema já suporta LinkedIn via Late API e todos os formatos
- `auto_publish: false` em todas para o Madureira revisar antes de publicar (diferente do Defiverso que é automático)

