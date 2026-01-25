# Enermax V3 - Marketplace de Servicios del Hogar

Plataforma que conecta profesionales de servicios del hogar con clientes en Buenos Aires.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Pagos**: MercadoPago Checkout Pro con sistema de escrow
- **PWA**: Service Worker, Push Notifications, Offline Support

## Características Principales

- Landing page estilo Airbnb con búsqueda y filtros
- Perfiles de profesionales con reviews y calendario
- Checkout de 1 página con cupones y upsells
- Chat en tiempo real (Supabase Realtime)
- Sistema de referidos con recompensas
- Dashboard para clientes, profesionales y admin
- AI Matching para emparejar profesionales con clientes
- Detección de fraude automática
- PWA con notificaciones push

---

## 🚀 Setup Rápido

### Paso 1: Instalar dependencias

```bash
cd /Users/valentinpereyra/Documents/Enermax/enermax-v3
npm install
```

### Paso 2: Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus credenciales reales:

```env
# Supabase (Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MercadoPago (Developers → Credenciales)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 3: Configurar Supabase

1. **Ejecutar el schema SQL**:
   - Ve a [Supabase Dashboard](https://app.supabase.com)
   - Selecciona tu proyecto
   - Ve a SQL Editor
   - Copia y pega el contenido de `supabase/schema.sql`
   - Click en "Run"

2. **Crear bucket de Storage**:
   - Ve a Storage
   - Click "New bucket"
   - Nombre: `trabajos`
   - Marcar como "Public bucket"

3. **Habilitar Realtime**:
   - Ve a Database → Replication
   - Habilita Realtime para:
     - `solicitudes`
     - `chat_mensajes`
     - `notificaciones`

### Paso 4: Configurar MercadoPago Webhook

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Credenciales → Webhooks
3. Agregar webhook:
   - URL: `https://TU_DOMINIO/api/mercadopago/webhook`
   - Eventos: `payment`

### Paso 5: Correr el proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
enermax-v3/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── mercadopago/   # Pagos y webhooks
│   │   │   ├── chat/          # Mensajes en tiempo real
│   │   │   ├── upload/        # Subida de fotos
│   │   │   ├── referidos/     # Sistema de referidos
│   │   │   ├── admin/         # Endpoints admin
│   │   │   └── notificaciones/# Push notifications
│   │   ├── dashboard/         # Dashboards
│   │   │   ├── admin/         # Panel admin
│   │   │   ├── cliente/       # Panel cliente
│   │   │   └── profesional/   # Panel profesional
│   │   ├── profesional/       # Perfil profesional
│   │   ├── contratar/         # Checkout
│   │   ├── auth/              # Login/registro
│   │   ├── solicitud/         # Detalle solicitud
│   │   └── (legal)/           # Páginas legales
│   ├── components/            # Componentes React
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades
│   │   ├── supabase.ts       # Clientes Supabase
│   │   ├── database.types.ts # Tipos TypeScript
│   │   ├── constants.ts      # Constantes
│   │   └── ai-matching.ts    # Algoritmo de matching
│   └── styles/               # Estilos globales
├── public/                   # Assets estáticos
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   └── offline.html          # Página offline
├── supabase/
│   └── schema.sql           # Schema de la base de datos
└── package.json
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm run start

# Linting
npm run lint
```

---

## 💰 Modelo de Negocio

- **Comisión Enermax**: 15% de cada transacción
- **Pagos**: MercadoPago retiene el pago hasta que el cliente confirma
- **Referidos**: $1000 ARS de descuento para quien refiere y quien es referido

---

## 🛡️ Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Service Role Key solo en API Routes del servidor
- Validación de fraude en cada transacción
- Webhook de MercadoPago verificado

---

## 📱 PWA

La app funciona como PWA con:
- Instalación en home screen
- Funcionamiento offline básico
- Push notifications
- Cache de assets

---

## 🚀 Deploy a Vercel

1. Push el código a GitHub:
```bash
git remote add origin https://github.com/TU_USUARIO/enermax-v3.git
git push -u origin main
```

2. Ve a [Vercel](https://vercel.com)
3. Import el repositorio
4. Agregar variables de entorno (las mismas de `.env.local`)
5. Deploy

---

## 📊 Admin Dashboard

Acceso: `/dashboard/admin`

Métricas disponibles:
- Solicitudes totales / completadas / canceladas
- GMV (Gross Merchandise Value)
- Comisiones generadas
- Nuevos profesionales y clientes
- Calificación promedio

---

## 🤝 Flujo de una Solicitud

1. Cliente busca y selecciona profesional
2. Cliente elige servicio y completa checkout
3. MercadoPago procesa el pago y lo retiene
4. Profesional recibe notificación y acepta
5. Profesional marca trabajo como completado
6. Cliente confirma y se libera el pago
7. Profesional recibe 85%, Enermax 15%

---

## Contacto

Para soporte técnico, contactar a Valentín Pereyra.
