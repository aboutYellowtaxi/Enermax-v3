-- Tabla de portfolio para galería de trabajos
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
  foto_url TEXT NOT NULL,
  descripcion TEXT,
  subido_por TEXT DEFAULT 'profesional' CHECK (subido_por IN ('profesional', 'cliente', 'admin')),
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bucket para fotos de trabajos
INSERT INTO storage.buckets (id, name, public)
VALUES ('trabajos', 'trabajos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public read trabajos" ON storage.objects
  FOR SELECT USING (bucket_id = 'trabajos');

CREATE POLICY IF NOT EXISTS "Service role upload trabajos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'trabajos');
