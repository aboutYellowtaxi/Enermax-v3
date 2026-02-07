-- Crear bucket para videos de clientes
-- Ejecutar en Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir uploads desde service role (ya funciona por default)
-- Permitir lectura pública
CREATE POLICY "Public read videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

-- Permitir upload via service role (bypass RLS)
CREATE POLICY "Service role upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');
