

## Problem

The batch transcription process (`batch-transcribe-posts`) updates `full_content` but does NOT set `content_synced_at`. The `PostContentSyncButton` component checks `contentSyncedAt` to decide whether to show a green "Sincronizado" badge or a "Carregar" button. So all batch-processed posts still appear as needing sync.

Additionally, the batch process doesn't set `thumbnail_url` from the stored images.

## Plan

### 1. Update `batch-transcribe-posts` Edge Function
- When updating a post after transcription, also set `content_synced_at: new Date().toISOString()`
- Set `thumbnail_url` from the first image in the `images` array (build the public storage URL)
- This fixes future batch runs

### 2. Backfill already-processed posts (one-time SQL migration)
- Run a database migration to set `content_synced_at = now()` for all `instagram_posts` where `full_content IS NOT NULL` and `content_synced_at IS NULL`
- Also set `thumbnail_url` from the first element of `images` array for posts that have images but no thumbnail

### 3. Update `PostContentSyncButton` logic (optional improvement)
- As a fallback, also check if `full_content` exists (not just `content_synced_at`) to show the synced badge — makes the UI resilient to future batch processes

These three changes will make the table immediately reflect all synced content with proper badges and thumbnails.

