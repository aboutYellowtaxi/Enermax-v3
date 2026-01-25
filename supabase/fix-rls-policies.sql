-- ============================================
-- FIX RLS POLICIES - Agregar INSERT policies
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Profesionales: usuarios autenticados pueden crear su perfil
CREATE POLICY "Users can create own profesional profile" ON profesionales
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Servicios: profesionales pueden crear sus servicios
CREATE POLICY "Profesionales can create services" ON servicios
  FOR INSERT WITH CHECK (
    profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
  );

-- Servicios: profesionales pueden actualizar sus servicios
CREATE POLICY "Profesionales can update own services" ON servicios
  FOR UPDATE USING (
    profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
  );

-- Servicios: profesionales pueden eliminar sus servicios
CREATE POLICY "Profesionales can delete own services" ON servicios
  FOR DELETE USING (
    profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
  );

-- Solicitudes: clientes pueden crear solicitudes
CREATE POLICY "Clients can create solicitudes" ON solicitudes
  FOR INSERT WITH CHECK (auth.uid() = cliente_auth_id OR cliente_auth_id IS NULL);

-- Solicitudes: participantes pueden actualizar
CREATE POLICY "Participants can update solicitudes" ON solicitudes
  FOR UPDATE USING (
    auth.uid() = cliente_auth_id OR
    auth.uid() IN (SELECT auth_id FROM profesionales WHERE id = profesional_id)
  );

-- Reviews: clientes pueden crear reviews
CREATE POLICY "Clients can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = cliente_auth_id);

-- Chat: participantes pueden enviar mensajes
CREATE POLICY "Participants can send messages" ON chat_mensajes
  FOR INSERT WITH CHECK (
    solicitud_id IN (
      SELECT id FROM solicitudes WHERE
        cliente_auth_id = auth.uid() OR
        profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
    )
  );

-- Notificaciones: sistema puede crear (usando service role)
-- Por ahora permitimos a usuarios autenticados crear notificaciones
CREATE POLICY "Authenticated users can create notifications" ON notificaciones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Pagos: solo desde API (service role), pero permitimos SELECT
CREATE POLICY "Users can view own pagos" ON pagos
  FOR SELECT USING (
    solicitud_id IN (
      SELECT id FROM solicitudes WHERE
        cliente_auth_id = auth.uid() OR
        profesional_id IN (SELECT id FROM profesionales WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- IMPORTANTE: También necesitamos que zonas y categorias
-- sean legibles por todos (sin RLS o con policy pública)
-- ============================================

-- Zonas: todos pueden leer
ALTER TABLE zonas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zonas are viewable by everyone" ON zonas
  FOR SELECT USING (true);

-- Categorías: todos pueden leer
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias are viewable by everyone" ON categorias
  FOR SELECT USING (true);

-- Cupones: todos pueden leer cupones activos
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active cupones are viewable by everyone" ON cupones
  FOR SELECT USING (activo = true);
