

# Plan: YouTube Table Cleanup, Twitter Apify Scraper & Review

## What You Asked
1. Remove the CTR column from the YouTube videos table
2. Add Apify-based Twitter/X scraper to sync tweets and metrics (similar to YouTube Apify)
3. Full review of Twitter and YouTube performance sections

---

## Changes

### 1. YouTube Videos Table - Remove CTR Column
**File:** `src/components/performance/YouTubeVideosTable.tsx`
- Remove the CTR column header (line 259-262) and corresponding table cell (line 326-328)
- Remove `click_rate` from the `SortField` type
- Clean, simple table: Thumbnail | Title | Date | Views | Likes | Comments | Status | Transcription

### 2. YouTube Dashboard - Cleanup Redundant Buttons
**File:** `src/components/performance/YouTubeDashboard.tsx`
- Remove the "Buscar via API" button (requires YouTube Data API key, rarely used) - keep only "Sincronizar Canal" (Apify) and RSS import
- Remove the CTR StatCard from the KPI grid (line 477-482) since Apify doesn't provide CTR data
- Simplify from 6 KPI cards to 5: Views, Watch Hours, Subscribers, Likes, Comments

### 3. New Edge Function: `fetch-twitter-apify`
**File:** `supabase/functions/fetch-twitter-apify/index.ts`
- New edge function using Apify's Twitter/X scraper actor (`apidojo/twitter-user-scraper` or similar)
- Input: `clientId` + `twitterHandle` (e.g., `@lucasamendola`)
- Multi-token fallback (same pattern as YouTube: `APIFY_API_TOKEN` then `APIFY_API_TOKEN_2`)
- Fetches recent tweets with metrics (likes, retweets, replies, impressions, views)
- Upserts into `twitter_posts` table using `client_id,tweet_id` as conflict key
- Returns count of tweets found/updated

### 4. Frontend Hook: `useFetchTwitterApify`
**File:** `src/hooks/useTwitterMetrics.ts`
- New mutation hook that calls the `fetch-twitter-apify` edge function
- Invalidates `twitter-posts` and `performance-metrics` queries on success

### 5. Twitter Dashboard - Add Sync Button
**File:** `src/components/performance/TwitterDashboard.tsx`
- Add a "Sincronizar Perfil" button in the header (next to "Importar CSV")
- Shows an input for the Twitter/X handle (e.g., `@lucasamendola`)
- Calls `useFetchTwitterApify` to scrape and sync all tweets with metrics
- Same UX pattern as YouTube's "Sincronizar Canal"

### 6. Review Fixes (Twitter & YouTube)
- **TwitterPostsTable**: Already well-structured with sorting, pagination, edit/view dialogs. No changes needed.
- **TwitterDashboard**: Already has KPIs, charts, Top 3 Tweets, Post Averages, secondary metrics. Well organized.
- **YouTubeVideosTable**: Pass `clientId` prop from dashboard (currently not passed, line 541).
- **YouTubeDashboard**: Fix `clientId` not being passed to `YouTubeVideosTable`.

---

## Technical Details

### Apify Twitter Actor
Will use `quacker/twitter-scraper` (or `apidojo/tweet-scraper`) which returns:
- `id`, `text`, `created_at`, `favorite_count` (likes), `retweet_count`, `reply_count`, `view_count`, `bookmark_count`
- Media URLs for images

### Database
No schema changes needed. The `twitter_posts` table already has all necessary columns (`tweet_id`, `content`, `posted_at`, `likes`, `retweets`, `replies`, `impressions`, `engagements`, `engagement_rate`, `images`).

### Files Modified
1. `src/components/performance/YouTubeVideosTable.tsx` - Remove CTR
2. `src/components/performance/YouTubeDashboard.tsx` - Cleanup buttons, remove CTR card, pass clientId
3. `supabase/functions/fetch-twitter-apify/index.ts` - New edge function
4. `src/hooks/useTwitterMetrics.ts` - Add `useFetchTwitterApify` hook
5. `src/components/performance/TwitterDashboard.tsx` - Add sync button/panel

