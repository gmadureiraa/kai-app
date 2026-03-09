ALTER TABLE youtube_videos ADD COLUMN IF NOT EXISTS likes integer DEFAULT 0;
ALTER TABLE youtube_videos ADD COLUMN IF NOT EXISTS comments integer DEFAULT 0;