ALTER TABLE public.kai_chat_conversations 
ADD COLUMN IF NOT EXISTS context_summary TEXT,
ADD COLUMN IF NOT EXISTS last_format_used TEXT;