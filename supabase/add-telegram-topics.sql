-- Add telegram_topic_id to solicitudes for Telegram Forum Topics
-- Each solicitud gets its own topic thread in the Telegram group
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS telegram_topic_id INTEGER;
