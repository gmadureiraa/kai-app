

# Plano: Preencher Voice Profile Completo de Cada Cliente

## Análise por Cliente

Baseado nos conteúdos da biblioteca, guias de copywriting, newsletters e READMEs, vou popular o campo `voice_profile` (JSON com `tone`, `use[]`, `avoid[]`) de cada cliente via UPDATE direto no banco.

### Clientes e seus dados disponíveis:

| Cliente | Fontes Analisadas | Status Atual |
|---------|-------------------|--------------|
| **Gabriel Madureira** | guia-conteudo.md (92 linhas), README.md, identity_guide ✅ | voice_profile vazio |
| **NeoBankLess** | guia-copywriting.md (1005 linhas com USE/AVOID explícitos) | voice_profile vazio |
| **Layla Foz** | 6 newsletters completas, análise de padrões, temas | voice_profile vazio |
| **Defiverso** | resumos-semanais.md, outras-newsletters.md | voice_profile vazio |
| **Kaleidos** | README.md (equipe, serviços, tom) | voice_profile vazio |
| **Lucas Amendola** | identity_guide ✅, sem docs em /public | voice_profile vazio |

---

## Implementação

### Fase Única: 6 UPDATEs no banco

Para cada cliente, um `UPDATE clients SET voice_profile = '{...}'` com:

**1. Gabriel Madureira** — Extraído do guia-conteudo.md
- **Tone:** "Técnico mas didático, direto e sem rodeios, visionário e provocador, transparente (building in public)"
- **Use:** "builders", "na prática", "o que funciona", "growth", "framework", "hack", "tá ligado", "bora", "vou te mostrar", "full-stack", "Web3", "automação", "na real", "olha só", "case real"
- **Avoid:** "certamente", "vale ressaltar", "é importante notar", "neste artigo vamos", "sem mais delongas", "espero que goste", "descubra como", "vou te ensinar", "queridos seguidores", "fique à vontade"

**2. NeoBankLess** — Extraído do guia-copywriting.md (seções 7 e 8)
- **Tone:** "Direto e objetivo, confiante (não arrogante), disruptivo, empoderador, acessível"
- **Use:** "Dolarize", "Proteja", "Controle", "Seu dinheiro. Suas regras.", "Bancos sem bancos", "Taxa de 0,5%", "Autocustódia", "Conta global", "Sem fronteiras", "Transparência total", "Em segundos", "Link na bio", "Para quem quer mais do que um banco"
- **Avoid:** "yield farming", "liquidity pools", "gas fees", "o melhor", "incrível", "fantástico", "revolucionário", "pensando fora da caixa", "soluções inovadoras", "experiência única", "recomenda-se", "caro leitor", "certamente", "vale ressaltar"

**3. Layla Foz** — Extraído das 6 newsletters (padrões de escrita)
- **Tone:** "Íntima e acolhedora, poética mas acessível, reflexiva e provocadora, feminina e empoderada"
- **Use:** "Deusa", "me conta uma coisa", "já parou pra pensar", "na prática", "entre eu e você", "a verdade é que", "e se eu te contar que", "respira fundo", "não é sobre", "é sobre"
- **Avoid:** "certamente", "vale ressaltar", "neste texto vamos abordar", "é importante salientar", "caros leitores", "confira", "aprenda a", "dicas incríveis", "vamos falar sobre", "segue abaixo", "você sabia que"

**4. Defiverso** — Extraído dos resumos semanais
- **Tone:** "Técnico mas acessível, direto ao ponto, informativo com emojis contextuais, foco em ação prática"
- **Use:** "GM, humanos do criptoverso", "👽", "bora entender", "na prática", "por que isso importa", "o que isso muda pra você", "resumo da semana", "fato:", "contexto:", "impacto:"
- **Avoid:** "certamente", "vale ressaltar", "é importante notar", "caro leitor", "neste artigo", "sem mais delongas", "confira", "descubra", "incrível", "fantástico", "revolucionário"

**5. Kaleidos** — Extraído do README
- **Tone:** "Profissional mas acessível, focado em resultados e dados, inspirador e direto ao ponto"
- **Use:** "resultado", "crescimento", "viralizar", "estratégia", "criativo", "conteúdo que converte", "dados reais", "case de sucesso", "na prática", "sem enrolação"
- **Avoid:** "certamente", "vale ressaltar", "é importante notar", "soluções inovadoras", "somos os melhores", "empresa líder", "parceria de sucesso", "fique à vontade", "sem mais delongas", "experiência única"

**6. Lucas Amendola** — Baseado no segmento (Finanças/YouTube), sem docs detalhados, perfil mais básico
- **Tone:** "Educativo, acessível, analítico, descontraído"
- **Use:** "bora analisar", "na prática", "olha isso", "fato importante", "gráfico mostra", "o que isso significa", "resumindo"
- **Avoid:** "certamente", "vale ressaltar", "é importante notar", "caros investidores", "sem mais delongas", "confira", "descubra", "incrível"

---

## Execução

6 chamadas UPDATE ao banco via insert tool, uma por cliente. Sem mudança de schema, sem mudança de código — apenas dados.

