

# Revisão de Automações: Ordenação Estável + Análise de Volume e Qualidade

## 1. Fix: Ordenação Estável

**Problema:** No `AutomationsTab.tsx` (linhas 200-209), o sort usa `last_triggered_at` como critério secundário. Toda vez que uma automação roda, ela muda de posição na lista.

**Solução:** Trocar o sort secundário de `last_triggered_at` para `created_at` (ordem de criação). Mantém `is_active` como primeiro critério.

**Arquivo:** `src/components/automations/AutomationsTab.tsx` (linhas 203-208)

---

## 2. Análise de Volume por Cliente

### Gabriel Madureira — **32 posts/semana no Twitter** (problema grave)

| Automação | Frequência | Plataforma | Qualidade | Recomendação |
|---|---|---|---|---|
| GM Tweet | Diário 08:15 | Twitter+Threads | Boa, leve e humano | **Manter** |
| Tweet Insight Diário | Diário 12:00 | Twitter+Threads | Boa, mas sobrepõe com Marketing | **Fundir com Marketing & Growth** |
| Tweet Marketing & Growth | Diário 15:00 | Twitter+Threads | Boa, mas redundante com Insight | **Manter este, desativar Insight** |
| Tweet Pessoal & Bastidores | 3x/sem (seg/qua/sex) | Twitter+Threads | Boa, diferenciada | **Manter** |
| Tweet Dica & Ferramenta | 1x/sem (qua) | Twitter+Threads | Boa, prática | **Manter** |
| LinkedIn Opinião | 1x/sem (ter) | LinkedIn | Boa | **Manter** |
| LinkedIn Building in Public | 1x/sem (qui) | LinkedIn | Boa | **Manter** |
| LinkedIn Case | 1x/sem (sex) | LinkedIn | Boa | **Manter** |
| Blog | 2x/sem (ter/qui) | Blog | Boa, profunda | **Manter** |
| Dica do Claude | Diário | Twitter | Nova, boa | **Reduzir para 3x/sem** |

**Diagnóstico:** O Madureira tem **3 tweets diários automáticos** (GM + Insight + Marketing) + Claude daily = **4/dia**. Isso gera repetitividade e pode parecer spam.

**Recomendação:**
- **Desativar "Tweet Insight Diário"** — o prompt é quase idêntico ao "Marketing & Growth", ambos pedem opinião forte + dados + provocação
- **Dica do Claude para 3x/semana** (seg/qua/sex) em vez de diário
- **Resultado: 2 tweets diários + 4 semanais** = ~18/semana (vs 32 atual, redução de 44%)

### Defiverso — Volume adequado
Automações são RSS-driven (disparam quando sai newsletter/vídeo), não há sobreposição. GM diário é leve. **Sem alterações.**

### Jornal Cripto — Volume adequado para portal de notícias
3 posts BTC/dia + RSS de notícias. Coerente com perfil de mídia. **Sem alterações.**

---

## 3. Plano de Implementação

1. **Mudar sort** no `AutomationsTab.tsx`: trocar `last_triggered_at` por `created_at` no critério secundário
2. **Desativar** automação "Tweet Insight Diário" (id: `ade530e7`) via SQL UPDATE
3. **Alterar frequência** da "Dica do Claude" (id: `b1d77876`) de `daily` para `weekly` (seg/qua/sex) via SQL UPDATE

**Arquivos a modificar:**
- `src/components/automations/AutomationsTab.tsx` — sort estável
- Database — UPDATE em 2 automações

