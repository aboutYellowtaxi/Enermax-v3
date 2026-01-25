-- EJECUTAR PRIMERO: Limpia tipos y tablas existentes de V2/V3
-- ⚠️ CUIDADO: Esto borra datos existentes

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS admin_metricas CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS referidos CASCADE;
DROP TABLE IF EXISTS codigos_referido CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS chat_mensajes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS cupones CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS bloqueos CASCADE;
DROP TABLE IF EXISTS disponibilidad CASCADE;
DROP TABLE IF EXISTS profesionales CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS zonas CASCADE;

-- Drop types
DROP TYPE IF EXISTS estado_solicitud CASCADE;
DROP TYPE IF EXISTS estado_pago CASCADE;
DROP TYPE IF EXISTS tipo_notificacion CASCADE;
DROP TYPE IF EXISTS tipo_cupon CASCADE;
DROP TYPE IF EXISTS estado_referido CASCADE;
DROP TYPE IF EXISTS autor_mensaje CASCADE;

-- Now you can run schema.sql
