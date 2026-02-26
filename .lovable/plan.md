

# Plan: Fix Image Generation for Automations

## Problem
Image generation fails because:
1. The `generate-content-v2` function calls Google's API directly with the deprecated model `gemini-2.0-flash-exp-image-generation` (404 error)
2. When called from automations (service_role), `user.id` is undefined, which would crash on the upload path

## Changes

### File: `supabase/functions/generate-content-v2/index.ts`

**Change 1 — Switch to Lovable AI Gateway (lines 816-829)**

Replace the direct Google API call with the Lovable AI gateway:
```typescript
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image",
    messages: [{
      role: "user",
      content: referenceImage 
        ? [{ type: "text", text: imagePrompt }, { type: "image_url", image_url: { url: referenceImage } }]
        : imagePrompt,
    }],
    modalities: ["image", "text"],
  }),
});
```

**Change 2 — Parse new response format (lines 845-870)**

The Lovable gateway returns images in `choices[0].message.images[0].image_url.url` (base64 data URL), not in Google's `candidates[0].content.parts[].inlineData` format. Update parsing accordingly.

**Change 3 — Fix user.id for service_role (line 886)**

Replace `user.id` with a fallback: extract user from auth if available, otherwise use `clientId` or `"automation"` for the storage path.

**Change 4 — Also fix kai-simple-chat (line 1370)**

Same deprecated model call exists in `kai-simple-chat/index.ts`. Apply same fix.

### Deploy
- Deploy `generate-content-v2` and `kai-simple-chat`
- Re-trigger the visual tweet automation to verify

