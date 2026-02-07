-- ============================================
-- ENERMAX V3 - Limpieza post-MercadoPago
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Migrar solicitudes en estados obsoletos
UPDATE solicitudes SET estado = 'pendiente' WHERE estado = 'pendiente_pago';
UPDATE solicitudes SET estado = 'completada' WHERE estado = 'confirmada';
UPDATE solicitudes SET estado = 'cancelada' WHERE estado = 'disputa';

-- 2. Limpiar tabla pagos (ya no se usa con MercadoPago)
-- Primero eliminar registros huerfanos
DELETE FROM pagos WHERE solicitud_id NOT IN (SELECT id FROM solicitudes);
-- Vaciar tabla (ya no hay flujo de pagos)
TRUNCATE pagos CASCADE;

-- 3. Recrear enum estado_solicitud sin valores de MercadoPago
-- PostgreSQL no permite ALTER TYPE ... DROP VALUE, hay que recrear
ALTER TABLE solicitudes ALTER COLUMN estado DROP DEFAULT;
ALTER TABLE solicitudes ALTER COLUMN estado TYPE TEXT;
DROP TYPE IF EXISTS estado_solicitud;
CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aceptada', 'en_progreso', 'completada', 'cancelada');
ALTER TABLE solicitudes ALTER COLUMN estado TYPE estado_solicitud USING estado::estado_solicitud;
ALTER TABLE solicitudes ALTER COLUMN estado SET DEFAULT 'pendiente';

-- 4. Limpiar enum estado_pago (tabla queda por compatibilidad pero sin uso)
ALTER TABLE pagos ALTER COLUMN estado DROP DEFAULT;
ALTER TABLE pagos ALTER COLUMN estado TYPE TEXT;
DROP TYPE IF EXISTS estado_pago;
CREATE TYPE estado_pago AS ENUM ('pendiente', 'retenido', 'liberado', 'reembolsado');
ALTER TABLE pagos ALTER COLUMN estado TYPE estado_pago USING estado::estado_pago;
ALTER TABLE pagos ALTER COLUMN estado SET DEFAULT 'pendiente';

-- 5. Agregar columnas de comision a solicitudes si no existen
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes' AND column_name = 'monto_total') THEN
    ALTER TABLE solicitudes ADD COLUMN monto_total DECIMAL(12,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'solicitudes' AND column_name = 'comision_enermax') THEN
    ALTER TABLE solicitudes ADD COLUMN comision_enermax DECIMAL(12,2) DEFAULT 0;
  END IF;
END $$;

-- 6. Limpiar notificaciones viejas (mas de 90 dias)
DELETE FROM notificaciones WHERE created_at < NOW() - INTERVAL '90 days';

-- 7. Limpiar chat_mensajes huerfanos (sin solicitud)
DELETE FROM chat_mensajes WHERE solicitud_id NOT IN (SELECT id FROM solicitudes);

-- 8. Verificacion final
DO $$
DECLARE
  sol_count INT;
  estados TEXT;
BEGIN
  SELECT count(*) INTO sol_count FROM solicitudes;
  SELECT string_agg(DISTINCT estado::TEXT, ', ') INTO estados FROM solicitudes;
  RAISE NOTICE 'Solicitudes: %, Estados activos: %', sol_count, COALESCE(estados, 'ninguno');
END $$;
