-- Tabla de comisiones para tracking de monetización
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS comisiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE UNIQUE,
  monto_trabajo DECIMAL(12, 2) NOT NULL,
  porcentaje_comision DECIMAL(5, 4) NOT NULL DEFAULT 0.15,
  monto_comision DECIMAL(12, 2) NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'condonada')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comisiones_estado ON comisiones(estado);
