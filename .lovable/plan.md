

# Plano: Expandir MCP Reader com Upload de Arquivos e Novos Recursos

## Estado Atual

O `mcp-reader` tem 17 tools (list_tables, query_table, get_client, get_content_library, get_references, get_metrics, get_automations, get_planning, search_knowledge, get_schema, create_planning_item, update_planning_item, update_automation, insert_row, update_row, delete_row, invoke_function). Nenhuma lida com storage/arquivos.

O projeto usa o bucket `client-files` para arquivos. Não há buckets explícitos criados em migrations visíveis, mas o código referencia `client-files` e `chat-images`.

---

## Novas Tools a Adicionar (8 tools)

### Storage / Arquivos

1. **`upload_file`** — Upload de arquivo via URL ou base64 para qualquer bucket (client-files, chat-images, etc.). Retorna URL pública permanente.
   - Params: `bucket`, `path`, `file_url` (baixa e sobe) OU `base64` + `content_type`
   - Suporta imagens, PDFs, vídeos, qualquer tipo

2. **`list_files`** — Lista arquivos de um bucket/pasta
   - Params: `bucket`, `folder` (optional), `limit`

3. **`delete_file`** — Remove arquivo de um bucket
   - Params: `bucket`, `path`

4. **`get_file_url`** — Retorna URL pública de um arquivo
   - Params: `bucket`, `path`

### Conteúdo / IA

5. **`generate_content`** — Gera conteúdo via `unified-content-api` de forma simplificada (wrapper com params tipados em vez de chamar invoke_function genérico)
   - Params: `client_id`, `format`, `topic`, `additional_instructions`

6. **`analyze_url`** — Extrai conteúdo de uma URL via `firecrawl-scrape`
   - Params: `url`

### Gestão de Clientes

7. **`update_client`** — Atualiza campos do cliente (voice_profile, identity_guide, description, etc.)
   - Params: `client_id`, `updates`

8. **`list_clients`** — Lista todos os clientes de um workspace
   - Params: `workspace_id`

---

## Arquivo a Modificar

- **`supabase/functions/mcp-reader/index.ts`** — Adicionar as 8 tools novas após as existentes, antes do HTTP transport setup (linha 472)

## Detalhes de Implementação

- `upload_file` com URL: faz `fetch(url)` → `arrayBuffer()` → `sb.storage.from(bucket).upload(path, buffer, { contentType })`
- `upload_file` com base64: decodifica → mesmo fluxo
- `generate_content` chama `unified-content-api` internamente com os headers corretos
- `analyze_url` chama `firecrawl-scrape` internamente
- Todos retornam JSON estruturado como as tools existentes

