-- Enermax V3 Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE estado_solicitud AS ENUM (
  'pendiente_pago',
  'pendiente',
  'aceptada',
  'en_progreso',
  'completada',
  'confirmada',
  'cancelada',
  'disputa'
);

CREATE TYPE estado_pago AS ENUM (
  'pendiente',
  'retenido',
  'liberado',
  'reembolsado'
);

CREATE TYPE tipo_notificacion AS ENUM (
  'nueva_solicitud',
  'solicitud_aceptada',
  'trabajo_completado',
  'pago_liberado',
  'nueva_review',
  'nuevo_mensaje',
  'recordatorio',
  'sistema'
);

CREATE TYPE tipo_cupon AS ENUM ('porcentaje', 'monto_fijo');
CREATE TYPE estado_referido AS ENUM ('pendiente', 'completado', 'expirado');
CREATE TYPE autor_mensaje AS ENUM ('cliente', 'profesional', 'sistema');

-- ===========================================
-- TABLES
-- ===========================================

-- Zonas
CREATE TABLE zonas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  provincia TEXT DEFAULT 'Buenos Aires',
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icono TEXT,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profesionales
CREATE TABLE profesionales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT NOT NULL,
  email TEXT,
  dni TEXT,
  foto_url TEXT,
  banner_url TEXT,
  zona_base_id UUID REFERENCES zonas(id),
  direccion TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  bio TEXT,
  experiencia_anos INTEGER DEFAULT 0,
  calificacion DECIMAL(3, 2) DEFAULT 5.00,
  total_trabajos INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verificado BOOLEAN DEFAULT false,
  disponible BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  premium BOOLEAN DEFAULT false,
  mercadopago_user_id TEXT,
  cbu TEXT,
  alias_cbu TEXT,
  categorias TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disponibilidad
CREATE TABLE disponibilidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bloqueos (vacaciones, etc.)
CREATE TABLE bloqueos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Servicios
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12, 2) NOT NULL,
  precio_desde BOOLEAN DEFAULT false,
  duracion_minutos INTEGER DEFAULT 60,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupones
CREATE TABLE cupones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  tipo tipo_cupon NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  minimo_compra DECIMAL(12, 2),
  usos_maximos INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  activo BOOLEAN DEFAULT true,
  solo_nuevos_usuarios BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solicitudes
CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_auth_id UUID REFERENCES auth.users(id),
  profesional_id UUID REFERENCES profesionales(id),
  servicio_id UUID REFERENCES servicios(id),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  cliente_email TEXT,
  direccion TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  zona_id UUID REFERENCES zonas(id),
  notas TEXT,
  fecha_solicitada DATE,
  horario_preferido TEXT,
  fecha_programada TIMESTAMPTZ,
  fecha_completada TIMESTAMPTZ,
  monto_total DECIMAL(12, 2) NOT NULL,
  comision_enermax DECIMAL(12, 2) NOT NULL,
  monto_profesional DECIMAL(12, 2) NOT NULL,
  cupon_id UUID REFERENCES cupones(id),
  descuento_aplicado DECIMAL(12, 2) DEFAULT 0,
  estado estado_solicitud DEFAULT 'pendiente_pago',
  fotos_trabajo TEXT[],
  notas_profesional TEXT,
  score_fraude INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  mercadopago_status TEXT,
  monto DECIMAL(12, 2) NOT NULL,
  comision_mp DECIMAL(12, 2) DEFAULT 0,
  estado estado_pago DEFAULT 'pendiente',
  transferencia_id TEXT,
  fecha_liberacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  profesional_id UUID REFERENCES profesionales(id),
  cliente_auth_id UUID REFERENCES auth.users(id),
  cliente_nombre TEXT,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  respuesta TEXT,
  fecha_respuesta TIMESTAMPTZ,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Mensajes
CREATE TABLE chat_mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  autor_tipo autor_mensaje NOT NULL,
  autor_id UUID,
  mensaje TEXT NOT NULL,
  archivo_url TEXT,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_auth_id UUID REFERENCES auth.users(id),
  profesional_id UUID REFERENCES profesionales(id),
  tipo tipo_notificacion NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  solicitud_id UUID REFERENCES solicitudes(id),
  data JSONB,
  leida BOOLEAN DEFAULT false,
  enviada_email BOOLEAN DEFAULT false,
  enviada_push BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Códigos de referido
CREATE TABLE codigos_referido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_auth_id UUID REFERENCES auth.users(id) UNIQUE,
  codigo TEXT UNIQUE NOT NULL,
  usos_totales INTEGER DEFAULT 0,
  monto_ganado DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referidos
CREATE TABLE referidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referente_auth_id UUID REFERENCES auth.users(id),
  referido_auth_id UUID REFERENCES auth.users(id),
  codigo_usado TEXT NOT NULL,
  estado estado_referido DEFAULT 'pendiente',
  monto_recompensa DECIMAL(12, 2) DEFAULT 1000,
  pagado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_auth_id UUID REFERENCES auth.users(id),
  profesional_id UUID REFERENCES profesionales(id),
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Métricas (denormalized for fast queries)
CREATE TABLE admin_metricas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE UNIQUE NOT NULL,
  total_solicitudes INTEGER DEFAULT 0,
  solicitudes_completadas INTEGER DEFAULT 0,
  solicitudes_canceladas INTEGER DEFAULT 0,
  gmv DECIMAL(14, 2) DEFAULT 0,
  comisiones DECIMAL(14, 2) DEFAULT 0,
  nuevos_profesionales INTEGER DEFAULT 0,
  nuevos_clientes INTEGER DEFAULT 0,
  calificacion_promedio DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_profesionales_zona ON profesionales(zona_base_id);
CREATE INDEX idx_profesionales_activo ON profesionales(activo, disponible);
CREATE INDEX idx_profesionales_categorias ON profesionales USING GIN(categorias);
CREATE INDEX idx_servicios_profesional ON servicios(profesional_id);
CREATE INDEX idx_solicitudes_cliente ON solicitudes(cliente_auth_id);
CREATE INDEX idx_solicitudes_profesional ON solicitudes(profesional_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_chat_solicitud ON chat_mensajes(solicitud_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_auth_id);
CREATE INDEX idx_notificaciones_profesional ON notificaciones(profesional_id);
CREATE INDEX idx_reviews_profesional ON reviews(profesional_id);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profesionales_updated_at
  BEFORE UPDATE ON profesionales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_servicios_updated_at
  BEFORE UPDATE ON servicios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_solicitudes_updated_at
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pagos_updated_at
  BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment trabajos completados
CREATE OR REPLACE FUNCTION increment_trabajos_completados(prof_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profesionales
  SET total_trabajos = total_trabajos + 1
  WHERE id = prof_id;
END;
$$ LANGUAGE plpgsql;

-- Update profesional rating after review
CREATE OR REPLACE FUNCTION update_profesional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profesionales
  SET
    calificacion = (
      SELECT COALESCE(AVG(calificacion), 5)
      FROM reviews
      WHERE profesional_id = NEW.profesional_id AND visible = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE profesional_id = NEW.profesional_id AND visible = true
    )
  WHERE id = NEW.profesional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_profesional_rating();

-- ===========================================
-- SEED DATA
-- ===========================================

-- Insert zonas
INSERT INTO zonas (nombre, provincia) VALUES
  ('Moreno', 'Buenos Aires'),
  ('Merlo', 'Buenos Aires'),
  ('Morón', 'Buenos Aires'),
  ('Ituzaingó', 'Buenos Aires'),
  ('Hurlingham', 'Buenos Aires'),
  ('Tres de Febrero', 'Buenos Aires'),
  ('San Martín', 'Buenos Aires'),
  ('Vicente López', 'Buenos Aires'),
  ('San Isidro', 'Buenos Aires'),
  ('La Matanza', 'Buenos Aires'),
  ('CABA', 'CABA');

-- Insert categorías
INSERT INTO categorias (nombre, slug, icono, orden) VALUES
  ('Electricidad', 'electricidad', 'Zap', 1),
  ('Plomería', 'plomeria', 'Droplets', 2),
  ('Gas', 'gas', 'Flame', 3),
  ('Pintura', 'pintura', 'PaintBucket', 4),
  ('Carpintería', 'carpinteria', 'Hammer', 5),
  ('Cerrajería', 'cerrajeria', 'Key', 6),
  ('Aire Acondicionado', 'aire', 'Wind', 7),
  ('Limpieza', 'limpieza', 'Sparkles', 8);

-- Insert welcome coupon
INSERT INTO cupones (codigo, tipo, valor, usos_maximos, solo_nuevos_usuarios) VALUES
  ('BIENVENIDO', 'porcentaje', 10, 1000, true);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Profesionales: anyone can read active, only owner can update
CREATE POLICY "Profesionales are viewable by everyone" ON profesionales
  FOR SELECT USING (activo = true);

CREATE POLICY "Profesionales can update own profile" ON profesionales
  FOR UPDATE USING (auth.uid() = auth_id);

-- Servicios: anyone can read active services
CREATE POLICY "Servicios are viewable by everyone" ON servicios
  FOR SELECT USING (activo = true);

-- Solicitudes: clients see their own, professionals see theirs
CREATE POLICY "Users can view own solicitudes" ON solicitudes
  FOR SELECT USING (
    auth.uid() = cliente_auth_id OR
    auth.uid() IN (SELECT auth_id FROM profesionales WHERE id = profesional_id)
  );

-- Reviews: anyone can read visible reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (visible = true);

-- Chat: only participants can view
CREATE POLICY "Chat visible to participants" ON chat_mensajes
  FOR SELECT USING (
    solicitud_id IN (
      SELECT id FROM solicitudes WHERE
        cliente_auth_id = auth.uid() OR
        profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
    )
  );

-- Notificaciones: users see their own
CREATE POLICY "Users see own notifications" ON notificaciones
  FOR SELECT USING (
    usuario_auth_id = auth.uid() OR
    profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
  );
