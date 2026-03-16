-- Telegram bot state (singleton for polling offset + chat_id)
CREATE TABLE public.telegram_bot_config (
  id int PRIMARY KEY CHECK (id = 1),
  chat_id bigint,
  update_offset bigint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the single row
INSERT INTO public.telegram_bot_config (id, update_offset) VALUES (1, 0);

-- Enable RLS
ALTER TABLE public.telegram_bot_config ENABLE ROW LEVEL SECURITY;

-- Only service_role can access
CREATE POLICY "Service role only" ON public.telegram_bot_config
  FOR ALL USING (false);

-- Telegram messages table
CREATE TABLE public.telegram_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id bigint UNIQUE,
  chat_id bigint NOT NULL,
  message_text text,
  callback_data text,
  raw_update jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_messages_chat_id ON public.telegram_messages (chat_id);
CREATE INDEX idx_telegram_messages_processed ON public.telegram_messages (processed) WHERE NOT processed;

-- Enable RLS
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

-- Only service_role can access
CREATE POLICY "Service role only" ON public.telegram_messages
  FOR ALL USING (false);