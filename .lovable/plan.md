

# Plano: Testar LinkedIn/Thread + Reorganizar Temas das Automações

## Estado Atual (9 automações Madureira)

| Automação | Frequência | Auto-publish |
|---|---|---|
| GM Tweet | Diário 08:15 | ✅ sim |
| 🧠 Insight Diário | Diário 12:00 | ❌ |
| 🎨 Visual Diário | Diário 18:00 | ❌ |
| 🌙 Noturno | Diário 21:00 | ❌ |
| Tweet Dica & Ferramenta | Qua 14:00 | ❌ |
| 📚 Thread Semanal | Ter 10:00 | ❌ |
| LinkedIn — Artigo Opinião | Ter 09:00 | ❌ |
| LinkedIn — Building in Public | Qui 10:00 | ❌ |
| LinkedIn — Case & Prova Social | Sex 11:00 | ❌ |

## Mudanças Solicitadas

### 1. Testar LinkedIn e Thread
- Executar manualmente a automação **LinkedIn — Artigo de Opinião** para gerar conteúdo + imagem
- Executar manualmente a **📚 Thread Semanal** para verificar parsing de tweets

### 2. Reformular o GM Tweet
- Remover o "micro-insight educacional" do prompt
- Novo prompt: GM simples com anime, pedindo interação/GM de volta, sem frases de impacto
- Estilo: "GM ☀️ como vocês estão hoje?" / "GM fam 🫡 quem tá acordado?" — curto, humano, interativo
- Manter `auto_generate_image: true` (anime) e `auto_publish: true`

### 3. Criar automação: Tweet sobre Marketing
- Nova automação focada em marketing digital, Web3 marketing, growth, cases reais
- Frequência: diária (ex: 15:00)
- Sem imagem (ou com), foco em conteúdo educacional sobre marketing
- `auto_publish: false` para revisão

### 4. Criar automação: Tweet Pessoal/Bastidores
- Nova automação sobre acontecimentos pessoais, bastidores da Kaleidos, vida de founder
- Frequência: diária ou 3x/semana
- Tom: autêntico, vulnerável, "building in public" versão Twitter
- `auto_publish: false`

### 5. Manter os demais como estão
- 🧠 Insight, 🎨 Visual, 🌙 Noturno, Dica & Ferramenta, Thread, LinkedIn — todos mantidos

## Implementação

1. **SQL UPDATE** no GM Tweet (`d22e5a77`) — novo prompt simples/interativo
2. **SQL INSERT** — 2 novas automações (Marketing + Pessoal) na `planning_automations`
3. **Teste manual** — Executar LinkedIn Artigo + Thread Semanal via `process-automations`

