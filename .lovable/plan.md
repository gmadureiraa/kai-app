

# Plano: Automação Diária de Dicas do Claude com Screenshots Reais

## Conceito

Uma automação diária para o cliente **Kaleidos** (`6fe608ae-b7ab-4c87-8600-50d7d42785b0`) que posta dicas/skills do Claude com prints reais (não gerados por IA). A automação gera o texto com IA e seleciona uma imagem aleatória de um pool de screenshots pré-carregados no storage.

## Implementação

### 1. Criar bucket/pasta para screenshots

Usar a pasta `client-files/kaleidos/claude-tips/` no storage existente. Os screenshots serão carregados via MCP (`upload_file`) ou manualmente. A automação listará os arquivos dessa pasta e escolherá um aleatório que ainda não foi usado recentemente.

### 2. Lógica no `process-automations/index.ts`

Adicionar um handler especial para automações com `metadata.image_pool_folder` no `trigger_config`. Quando presente:

- Lista arquivos do storage na pasta configurada
- Consulta os últimos N `planning_items` dessa automação para ver quais imagens já foram usadas (`media_urls`)
- Filtra as já usadas e seleciona uma aleatória das restantes
- Se todas já foram usadas, reseta o ciclo
- Injeta a URL pública no `media_urls` do item criado
- **Pula** a geração de imagem por IA (mesmo que `auto_generate_image` esteja false)

### 3. Criar o registro da automação (migration)

```sql
INSERT INTO planning_automations (
  workspace_id, client_id, name, is_active, trigger_type, trigger_config,
  platform, platforms, content_type, auto_generate_content, prompt_template,
  auto_publish, auto_generate_image, created_by
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '6fe608ae-b7ab-4c87-8600-50d7d42785b0',
  'Dica do Claude — Daily',
  true, 'schedule',
  '{"type":"daily","time":"10:00"}',
  'twitter', '["twitter"]', 'tweet', true,
  '<template com instruções de tom e contexto>',
  true, false,
  '9381b916-b87e-4bd2-a1e7-e06791854c4c'
);
```

O `prompt_template` instruirá a IA a:
- Escrever uma dica prática sobre Claude/Claude Code
- Tom: direto, útil, sem sensacionalismo
- Referir ao print que será anexado ("como no print" / "veja no print")
- Variações: shortcuts, prompts, workflows, debugging, CLAUDE.md tips

O `trigger_config` terá `image_pool_folder: "kaleidos/claude-tips"` para o handler saber de onde pegar as imagens.

### 4. Arquivo a modificar

- **`supabase/functions/process-automations/index.ts`** — Adicionar lógica de "image pool" que lista storage e seleciona screenshot aleatório não-repetido, executada antes da geração de conteúdo para que o prompt saiba qual imagem será anexada
- **Database migration** — INSERT da automação + prompt template

### 5. Upload dos screenshots

Após a automação estar criada, os prints serão carregados na pasta `client-files/kaleidos/claude-tips/` via MCP `upload_file` ou pelo chat. Quanto mais prints no pool, mais dias sem repetição.

