-- Habilitar Realtime para las tablas necesarias
-- Ejecutar DESPUÉS de schema.sql

ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;
