

# Plano: Imagens com Referências de Anime para Automações do Madureira

## Problema Atual

1. **Referências visuais não são usadas como imagem**: O `generate-content-v2` busca as `client_visual_references` do Madureira (16 imagens de anime), mas só lê os campos de texto (`description`, `styleAnalysis`). Esses campos estão **todos vazios** (NULL) — então nada é enviado ao modelo.

2. **Nenhuma referência marcada como primária**: O `process-automations` filtra por `is_primary = true`, mas todas as 16 referências do Madureira têm `is_primary = false`. Zero referências são carregadas.

3. **Imagem não é passada ao modelo**: Mesmo quando referências existem, o pipeline só envia texto descritivo ao Gemini — nunca envia a **imagem real** como input visual para o modelo replicar o estilo.

4. **Modelo usado é o Flash (qualidade inferior)**: Usa `gemini-2.5-flash-image` ao invés do `gemini-3-pro-image-preview` que já está referenciado no código como "high-quality model".

## Solução

### 1. Marcar referências do Madureira como primárias
- SQL UPDATE para definir 3-4 das melhores referências de anime como `is_primary = true`

### 2. Atualizar `process-automations` para enviar imagens reais
- No bloco de geração de imagem (linha ~1149), ao buscar `client_visual_references`, incluir o campo `image_url`
- Passar as URLs das imagens de referência como inputs ao `generate-content-v2` para que o modelo Gemini veja o estilo real

### 3. Atualizar `generate-content-v2` para usar referências como input visual
- Quando `visualRefs` contém imagens, baixá-las do Storage e passá-las como `image_url` ao modelo
- Isso permite que o Gemini **veja** o estilo anime e replique fielmente

### 4. Usar modelo de alta qualidade (`gemini-3-pro-image-preview`)
- Trocar o modelo de imagem de `gemini-2.5-flash-image` para `gemini-3-pro-image-preview` quando referências visuais existem, para máxima qualidade

### 5. Atualizar automações do Madureira com imagem
- Habilitar `auto_generate_image: true` nas automações que fazem sentido (GM, Visual Diário, LinkedIn posts)
- Definir `image_prompt_template` com instruções específicas para replicar o estilo anime/personagem do Madureira

## Automações Afetadas

| Automação | Atual | Novo |
|---|---|---|
| 🎨 Tweet Visual Diário | `auto_generate_image: true` mas sem ref | Com referências de anime |
| GM Tweet | `auto_generate_image: false` | `true` com estilo anime |
| LinkedIn — Artigo de Opinião | `false` | `true` com estilo anime |
| LinkedIn — Building in Public | `false` | `true` com estilo anime |
| LinkedIn — Case & Prova Social | `false` | `true` com estilo anime |

## Arquivos a Editar

1. **`supabase/functions/process-automations/index.ts`** — Passar `image_url` das referências ao generate-content-v2
2. **`supabase/functions/generate-content-v2/index.ts`** — Buscar imagem real do Storage e enviar ao Gemini como referência visual; usar modelo pro
3. **SQL** — Marcar referências como primárias + atualizar automações

