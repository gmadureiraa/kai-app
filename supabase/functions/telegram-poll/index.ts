import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';
const MAX_RUNTIME_MS = 55_000;
const MIN_REMAINING_MS = 5_000;

serve(async () => {
  const startTime = Date.now();

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY is not configured');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const headers = {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': TELEGRAM_API_KEY,
    'Content-Type': 'application/json',
  };

  let totalProcessed = 0;

  // Read initial offset
  const { data: state, error: stateErr } = await supabase
    .from('telegram_bot_config')
    .select('update_offset, chat_id, is_active')
    .eq('id', 1)
    .single();

  if (stateErr || !state) {
    return new Response(JSON.stringify({ error: stateErr?.message || 'No config' }), { status: 500 });
  }

  if (!state.is_active) {
    return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'Bot inactive' }));
  }

  let currentOffset = state.update_offset;

  // Poll continuously until time runs out
  while (true) {
    const elapsed = Date.now() - startTime;
    const remainingMs = MAX_RUNTIME_MS - elapsed;
    if (remainingMs < MIN_REMAINING_MS) break;

    const timeout = Math.min(50, Math.floor(remainingMs / 1000) - 5);
    if (timeout < 1) break;

    try {
      const response = await fetch(`${GATEWAY_URL}/getUpdates`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          offset: currentOffset,
          timeout,
          allowed_updates: ['message', 'callback_query'],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('getUpdates failed:', data);
        break;
      }

      const updates = data.result ?? [];
      if (updates.length === 0) continue;

      for (const update of updates) {
        try {
          if (update.callback_query) {
            await handleCallback(supabase, update.callback_query, headers, state.chat_id);
          } else if (update.message) {
            await handleMessage(supabase, update.message, headers);
          }
          totalProcessed++;
        } catch (err) {
          console.error('Error processing update:', err);
        }
      }

      // Store raw updates
      const rows = updates.map((u: any) => ({
        update_id: u.update_id,
        chat_id: u.callback_query?.message?.chat?.id || u.message?.chat?.id || 0,
        message_text: u.message?.text || null,
        callback_data: u.callback_query?.data || null,
        raw_update: u,
      }));

      if (rows.length > 0) {
        await supabase
          .from('telegram_messages')
          .upsert(rows, { onConflict: 'update_id' });
      }

      // Advance offset
      const newOffset = Math.max(...updates.map((u: any) => u.update_id)) + 1;
      await supabase
        .from('telegram_bot_config')
        .update({ update_offset: newOffset, updated_at: new Date().toISOString() })
        .eq('id', 1);
      currentOffset = newOffset;

    } catch (err) {
      console.error('Polling error:', err);
      break;
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: totalProcessed, finalOffset: currentOffset }));
});

// =====================================================
// Handle callback queries (button presses)
// =====================================================
async function handleCallback(
  supabase: any,
  callback: any,
  headers: Record<string, string>,
  configChatId: number | null,
) {
  const data = callback.data;
  const chatId = callback.message?.chat?.id;
  const messageId = callback.message?.message_id;

  if (!data) return;

  const [action, itemId] = data.split(':');

  // Answer callback to remove loading state
  await fetch(`${GATEWAY_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ callback_query_id: callback.id }),
  }).then(r => r.text());

  if (!itemId) {
    await sendReply(chatId, '❌ ID do item não encontrado.', headers);
    return;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

  switch (action) {
    case 'approve': {
      // Get the approved column for this item's workspace
      const { data: item } = await supabase
        .from('planning_items')
        .select('workspace_id, title, status')
        .eq('id', itemId)
        .single();

      if (!item) {
        await sendReply(chatId, '❌ Item não encontrado.', headers);
        return;
      }

      // Find the "approved" column
      const { data: approvedColumn } = await supabase
        .from('kanban_columns')
        .select('id')
        .eq('workspace_id', item.workspace_id)
        .eq('column_type', 'approved')
        .single();

      const updateData: Record<string, unknown> = { status: 'approved' };
      if (approvedColumn) {
        updateData.column_id = approvedColumn.id;
      }

      await supabase
        .from('planning_items')
        .update(updateData)
        .eq('id', itemId);

      await editMessage(chatId, messageId, `✅ <b>Aprovado!</b>\n"${item.title}"`, headers);
      break;
    }

    case 'reject': {
      const { data: item } = await supabase
        .from('planning_items')
        .select('title')
        .eq('id', itemId)
        .single();

      await supabase
        .from('planning_items')
        .update({ status: 'rejected' })
        .eq('id', itemId);

      await editMessage(chatId, messageId, `❌ <b>Reprovado.</b>\n"${item?.title || itemId}"`, headers);
      break;
    }

    case 'regen': {
      await editMessage(chatId, messageId, `🔄 <b>Regenerando conteúdo...</b>`, headers);

      // Get item details for regeneration
      const { data: item } = await supabase
        .from('planning_items')
        .select('*, client:clients(name)')
        .eq('id', itemId)
        .single();

      if (!item) {
        await sendReply(chatId, '❌ Item não encontrado.', headers);
        return;
      }

      try {
        // Call unified-content-api to regenerate
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const regenResponse = await fetch(`${supabaseUrl}/functions/v1/unified-content-api`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brief: item.title,
            clientId: item.client_id,
            formatType: item.content_type || 'tweet',
          }),
        });

        if (regenResponse.ok) {
          const result = await regenResponse.json();
          const newContent = result.content || result.text;

          if (newContent) {
            await supabase
              .from('planning_items')
              .update({ 
                body: newContent,
                status: 'idea',
              })
              .eq('id', itemId);

            // Send new preview
            const preview = newContent.substring(0, 800);
            await sendReply(chatId, 
              `🔄 <b>Conteúdo regenerado!</b>\n\n<pre>${escapeHtml(preview)}</pre>`, 
              headers,
              {
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
              }
            );
          } else {
            await sendReply(chatId, '⚠️ Regeneração retornou sem conteúdo.', headers);
          }
        } else {
          const errText = await regenResponse.text();
          await sendReply(chatId, `⚠️ Erro ao regenerar: ${errText.substring(0, 200)}`, headers);
        }
      } catch (err) {
        await sendReply(chatId, `⚠️ Erro: ${err instanceof Error ? err.message : 'desconhecido'}`, headers);
      }
      break;
    }

    case 'publish': {
      await editMessage(chatId, messageId, `📝 <b>Publicando...</b>`, headers);

      const { data: item } = await supabase
        .from('planning_items')
        .select('*, client:clients(name)')
        .eq('id', itemId)
        .single();

      if (!item) {
        await sendReply(chatId, '❌ Item não encontrado.', headers);
        return;
      }

      try {
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const platform = item.platform || (item.metadata as any)?.target_platforms?.[0] || 'twitter';
        
        const publishResponse = await fetch(`${supabaseUrl}/functions/v1/late-post`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: item.client_id,
            platform,
            content: item.body,
            planningItemId: itemId,
            mediaItems: item.media_urls?.map((url: string) => ({
              url,
              type: url.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
            })) || [],
          }),
        });

        if (publishResponse.ok) {
          const result = await publishResponse.json();
          if (result.success) {
            await sendReply(chatId, `✅ <b>Publicado com sucesso!</b> Plataforma: ${platform}`, headers);
          } else {
            await sendReply(chatId, `⚠️ Late API retornou: ${result.error || JSON.stringify(result).substring(0, 200)}`, headers);
          }
        } else {
          const errText = await publishResponse.text();
          await sendReply(chatId, `❌ Erro ao publicar: ${errText.substring(0, 200)}`, headers);
        }
      } catch (err) {
        await sendReply(chatId, `❌ Erro: ${err instanceof Error ? err.message : 'desconhecido'}`, headers);
      }
      break;
    }

    default:
      await sendReply(chatId, `❓ Ação desconhecida: ${action}`, headers);
  }
}

// =====================================================
// Handle text messages
// =====================================================
async function handleMessage(
  supabase: any,
  message: any,
  headers: Record<string, string>,
) {
  const chatId = message.chat.id;
  const text = message.text;

  if (!text) return;

  // /start command — save chat_id
  if (text === '/start') {
    await supabase
      .from('telegram_bot_config')
      .update({ chat_id: chatId, updated_at: new Date().toISOString() })
      .eq('id', 1);

    await sendReply(chatId, 
      `👋 <b>kAI Bot ativado!</b>\n\nSeu chat_id (${chatId}) foi salvo. Agora você receberá notificações de automações aqui.\n\nComandos:\n/pendentes — Ver itens pendentes\n/status — Status geral`, 
      headers
    );
    return;
  }

  // /pendentes command
  if (text === '/pendentes') {
    const { data: items } = await supabase
      .from('planning_items')
      .select('id, title, platform, content_type, created_at')
      .eq('status', 'idea')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!items || items.length === 0) {
      await sendReply(chatId, '✅ Nenhum item pendente!', headers);
      return;
    }

    let msg = `📋 <b>${items.length} itens pendentes:</b>\n\n`;
    for (const item of items) {
      msg += `• <b>${item.title?.substring(0, 60) || 'Sem título'}</b> (${item.platform || item.content_type})\n`;
    }

    await sendReply(chatId, msg, headers);
    return;
  }

  // /status command
  if (text === '/status') {
    const { count: pendingCount } = await supabase
      .from('planning_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'idea');

    const { count: approvedCount } = await supabase
      .from('planning_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: publishedToday } = await supabase
      .from('planning_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('updated_at', new Date().toISOString().split('T')[0]);

    await sendReply(chatId, 
      `📊 <b>Status:</b>\n\n📝 Pendentes: ${pendingCount || 0}\n✅ Aprovados: ${approvedCount || 0}\n📤 Publicados hoje: ${publishedToday || 0}`,
      headers
    );
    return;
  }

  // Default: echo that commands are limited for now
  await sendReply(chatId, 
    `🤖 Comandos disponíveis:\n/start — Ativar bot\n/pendentes — Ver pendentes\n/status — Status geral\n\nRespostas por IA em breve! 🚀`,
    headers
  );
}

// =====================================================
// Helpers
// =====================================================
async function sendReply(
  chatId: number | string,
  text: string,
  headers: Record<string, string>,
  replyMarkup?: any,
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('sendReply failed:', data);
  }
  return data;
}

async function editMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  headers: Record<string, string>,
) {
  const response = await fetch(`${GATEWAY_URL}/editMessageText`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('editMessage failed:', data);
  }
  return data;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
