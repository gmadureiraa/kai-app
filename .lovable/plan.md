

# Fix: Threads Posting Issues

## Root Cause

After reviewing the Late API Threads documentation, the code has these issues:

1. **500 character limit not enforced** - Threads has a strict 500 char limit (the #1 failure reason per Late docs at 14.5% failure rate). The code sends the exact same content to Twitter (280 chars) and Threads (500 chars) without validation. Long content from LinkedIn or automation-generated posts will fail silently at publish time even though Late API accepts the schedule (201).

2. **Duplicate content detection** - When posting the same content to Twitter and Threads sequentially, sometimes Late's content hash duplicate detection triggers a 409 for the second platform because both posts have the same `content` field. The hash is per-account, but edge cases exist.

3. **No `customContent` per platform** - Late API supports `customContent` in `platformSpecificData` to provide platform-specific text when cross-posting. The code doesn't use this.

## Changes

### `supabase/functions/late-post/index.ts`

1. **Add Threads 500 char validation and auto-truncation**
   - Before sending to Late API, if platform is `threads` and content exceeds 500 chars, truncate at 497 + "..."
   - Log a warning when truncation happens

2. **Add Threads-specific `platformSpecificData`**
   - For thread sequences on Threads platform, ensure each `threadItem.content` respects the 500 char limit per item

3. **Improve error messaging for Threads-specific failures**
   - Parse the common Threads errors (2207052 media download failure, 2207050 restricted account) and surface clear Portuguese messages

### `src/components/planning/PlanningItemDialog.tsx`

4. **Add content length warning for Threads**
   - When Threads is selected as a target platform and content exceeds 500 chars, show an inline warning badge
   - This is UX-only, the backend will auto-truncate as safety net

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/late-post/index.ts` | 500 char truncation for Threads, improved error parsing |
| `src/components/planning/PlanningItemDialog.tsx` | Content length warning when Threads is selected |

