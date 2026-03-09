

# Plano: Atualizar Documentação para Refletir Multi-plataforma

## O que mudou e não está documentado

As três docs principais (`PLANNING_KANBAN.md`, `SOCIAL_PUBLISHING.md`, `AUTOMATIONS_PIPELINE.md`) estão desatualizadas em relação às mudanças recentes:

1. **Multi-plataforma** -- O card agora suporta `metadata.target_platforms` e publicação simultânea em múltiplas redes, mas nenhuma doc menciona isso
2. **Tracking multi-plataforma** -- `published_platforms[]`, `late_post_ids{}`, `published_urls{}`, `added_to_library` são campos novos no metadata não documentados
3. **UI de chips com ícones** -- O dialog agora usa chips branded com ícones Lucide ao invés de seletor simples de plataforma
4. **Cards Kanban** -- Agora mostram múltiplas plataformas no footer (até 3 ícones + "+N")
5. **Datas de "Última atualização"** -- Todas dizem "Março 2025", deveria ser "Março 2026"

## Mudanças

### PLANNING_KANBAN.md
- Adicionar campo `target_platforms` na seção de campos do Planning Item
- Adicionar campos de tracking multi-plataforma (`published_platforms`, `late_post_ids`, `published_urls`, `added_to_library`)
- Atualizar seção "Dialog de Edição" para mencionar seleção multi-plataforma com chips
- Atualizar seção "Publicação" para descrever loop multi-plataforma
- Corrigir data para Março 2026

### SOCIAL_PUBLISHING.md
- Adicionar seção "Publicação Multi-plataforma" explicando o loop sequencial e tracking
- Atualizar interface `PostRequest` (já está ok, mas adicionar nota sobre multi-plat)
- Adicionar nota sobre deduplicação na biblioteca (`added_to_library`)
- Corrigir data para Março 2026

### AUTOMATIONS_PIPELINE.md
- Atualizar seção "AUTO-PUBLICAÇÃO" para mencionar `metadata.target_platforms` e loop multi-plataforma
- Já está em Março 2026, ok

