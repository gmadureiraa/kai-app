import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const tgHeaders = {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TELEGRAM_API_KEY,
      'Content-Type': 'application/json',
    };

    const { itemId, chatId: overrideChatId } = await req.json();

    // Get chat_id from config
    let chatId = overrideChatId;
    if (!chatId) {
      const { data: config } = await supabase
        .from('telegram_bot_config')
        .select('chat_id')
        .eq('id', 1)
        .single();
      chatId = config?.chat_id;
    }

    if (!chatId) {
      return new Response(JSON.stringify({ error: 'No chat_id configured' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get planning item
    const { data: item, error: itemError } = await supabase
      .from('planning_items')
      .select('*, client:clients(name)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const clientName = (item.client as any)?.name || 'Cliente';
    const preview = (item.content || '').substring(0, 800);
    const platformEmoji = item.platform === 'instagram' ? '📸' : item.platform === 'linkedin' ? '💼' : item.platform === 'twitter' ? '🐦' : '📝';

    const message = `${platformEmoji} <b>Novo conteúdo para aprovação</b>\n\n` +
      `👤 <b>Cliente:</b> ${escapeHtml(clientName)}\n` +
      `📋 <b>Tipo:</b> ${item.content_type || 'post'}\n` +
      `📌 <b>Título:</b> ${escapeHtml(item.title)}\n\n` +
      `<pre>${escapeHtml(preview)}</pre>`;

    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: tgHeaders,
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Aprovar', callback_data: `approve:${itemId}` },
              { text: '❌ Reprovar', callback_data: `reject:${itemId}` },
            ],
            [
              { text: '🔄 Regenerar', callback_data: `regen:${itemId}` },
              { text: '📝 Publicar agora', callback_data: `publish:${itemId}` },
            ],
          ],
        },
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('[telegram-send-notification] Error:', JSON.stringify(result));
      return new Response(JSON.stringify({ error: 'Failed to send', details: result }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[telegram-send-notification] Sent successfully:', result.result?.message_id);

    return new Response(JSON.stringify({ ok: true, messageId: result.result?.message_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[telegram-send-notification] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
