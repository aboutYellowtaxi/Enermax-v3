# CLAUDE.md - Enermax V3

## Visión del Producto

Enermax es un marketplace de servicios del hogar estilo Uber. El cliente llega (desde Facebook Ads), ve un servicio con precio fijo, paga, y un profesional verificado lo contacta en minutos.

**Mantra**: Llegás → Pagás → Te contactan. Nada más.

---

## Modelo de Negocio - Fase 1 (MVP actual)

### Flujo del cliente (Lead desde Facebook)
1. Entra a la landing por un anuncio de Facebook
2. Ve: "¿Problema eléctrico? Un electricista te contacta en minutos"
3. Ve precio fijo: **$10.000 - Visita diagnóstico**
4. Completa mini formulario: nombre, teléfono, dirección, descripción breve (opcional)
5. Paga con MercadoPago (Checkout Pro)
6. Ve confirmación: "¡Listo! Leo te va a contactar en menos de 30 minutos"
7. Leo recibe notificación por WhatsApp con los datos del cliente

### Flujo del profesional
1. Recibe WhatsApp automático con: nombre del cliente, teléfono, dirección, descripción
2. Contacta al cliente y coordina la visita
3. Va, hace el diagnóstico
4. Si hay reparación: presupuesta → cliente paga por la app (Fase 2)

### Monetización
- Comisión por visita diagnóstico: 15% ($1.500 de $10.000)
- Futuro: comisión sobre reparaciones, materiales, suscripciones pro

---

## Stack Técnico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Supabase (PostgreSQL + Auth + Realtime + RLS)
- **Pagos**: MercadoPago SDK (Checkout Pro)
- **Deploy**: Vercel (https://enermax-steel.vercel.app)
- **Notificaciones**: WhatsApp API / Push notifications

---

## Estructura de la Landing (Página Principal)

### Diseño: Inspirado en Vivaldi.com + Uber
- **Limpio**, mucho espacio en blanco
- **UN solo CTA dominante** visible sin scroll
- **Precio visible** antes de cualquier acción
- **Confianza**: badges de verificado, MercadoPago seguro, garantía
- **Mobile-first**: 90% del tráfico viene de Facebook mobile

### Secciones (en orden de scroll):
1. **Hero fullscreen**: Headline + precio + botón CTA gigante
2. **Formulario inline**: nombre, teléfono, dirección (aparece al hacer click en CTA o está visible)
3. **Trust section**: íconos de verificado, pago seguro, garantía
4. **Cómo funciona**: 3 pasos con íconos (Pagá → Te contactamos → Problema resuelto)
5. **Footer mínimo**: logo + contacto

### NO incluir en la landing:
- Lista de profesionales (el cliente no elige profesional, Enermax asigna)
- Múltiples categorías (Fase 1 = solo electricista)
- Login/registro de usuarios (no necesario para pagar)
- Chat en vivo (futuro)
- Precios variables (precio fijo por ahora)

---

## Archivos Clave

### Landing & UI
- `src/app/page.tsx` - Landing page principal (REESCRIBIR COMPLETO)
- `src/app/globals.css` - Estilos globales
- `src/app/layout.tsx` - Layout raíz
- `src/app/confirmacion/page.tsx` - Página post-pago (CREAR)

### API & Backend
- `src/app/api/mercadopago/crear-preferencia/route.ts` - Crear pago
- `src/app/api/mercadopago/webhook/route.ts` - Webhook de MercadoPago
- `src/app/api/notificar-profesional/route.ts` - Notificar a Leo (CREAR)

### Base de datos
- `supabase/schema.sql` - Schema completo
- `supabase/insert-leo.sql` - Datos de Leo

---

## Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL=https://rccvmthkznfawggiiruy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
MERCADOPAGO_ACCESS_TOKEN=<key>
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=<key>
NEXT_PUBLIC_APP_URL=https://enermax-steel.vercel.app
```

---

## Reglas de Desarrollo

1. **Mobile-first siempre** - El tráfico viene de Facebook mobile
2. **Mínima fricción** - Cada paso extra = clientes perdidos
3. **Sin login para pagar** - El cliente solo necesita nombre, teléfono y dirección
4. **Precio visible** - Siempre visible, sin sorpresas
5. **Velocidad** - La página debe cargar en <2 segundos
6. **Funcionalidad sobre estética** - Que funcione > que sea bonito

---

## Fases del Proyecto

### Fase 1 (ACTUAL) - Landing de conversión
- [x] Landing con CTA directo
- [x] Formulario mínimo (nombre, tel, dirección)
- [x] Pago MercadoPago $10.000
- [x] Notificación a Leo por WhatsApp
- [x] Página de confirmación
- [ ] Deploy funcional en Vercel

### Fase 2 - Post-diagnóstico
- [ ] Leo carga reporte de diagnóstico
- [ ] Enermax genera presupuesto automático
- [ ] Cliente acepta/rechaza desde la app
- [ ] Pago de reparación por MercadoPago

### Fase 3 - Multi-profesional
- [ ] Más electricistas en la plataforma
- [ ] Asignación automática por zona/disponibilidad
- [ ] Dashboard profesional
- [ ] Reviews y ratings

### Fase 4 - Multi-servicio
- [ ] Plomería, gas, pintura, etc.
- [ ] IA para consultas y presupuestos
- [ ] Gestión de materiales
- [ ] App móvil nativa
