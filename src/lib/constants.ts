// Constantes de Enermax V3

export const APP_NAME = 'Enermax'
export const APP_DESCRIPTION = 'Profesionales de confianza para tu hogar'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://enermax.com.ar'

// Comisión Enermax (15%)
export const COMISION_PORCENTAJE = 0.15
export const COMISION_ENERMAX = 0.15

// Recompensa por referido
export const RECOMPENSA_REFERIDO = 1000 // ARS

// Categorías de servicios
export const CATEGORIAS = [
  { id: 'electricidad', nombre: 'Electricista', slug: 'electricista', icono: 'Zap' },
  { id: 'plomeria', nombre: 'Plomero', slug: 'plomero', icono: 'Droplets' },
  { id: 'gas', nombre: 'Gasista', slug: 'gasista', icono: 'Flame' },
  { id: 'pintura', nombre: 'Pintor', slug: 'pintor', icono: 'PaintBucket' },
  { id: 'carpinteria', nombre: 'Carpintero', slug: 'carpintero', icono: 'Hammer' },
  { id: 'cerrajeria', nombre: 'Cerrajero', slug: 'cerrajero', icono: 'Key' },
  { id: 'aire', nombre: 'Aire Acondicionado', slug: 'aire-acondicionado', icono: 'Wind' },
  { id: 'limpieza', nombre: 'Limpieza', slug: 'limpieza', icono: 'Sparkles' },
  { id: 'albanileria', nombre: 'Albañil', slug: 'albanil', icono: 'Blocks' },
  { id: 'jardineria', nombre: 'Jardinero', slug: 'jardinero', icono: 'TreePine' },
] as const

// Zonas del AMBA
export const ZONAS_AMBA = [
  'Moreno', 'Merlo', 'Morón', 'Ituzaingó', 'Hurlingham',
  'Tres de Febrero', 'San Martín', 'Vicente López', 'San Isidro',
  'Tigre', 'San Fernando', 'La Matanza', 'Lanús', 'Avellaneda',
  'Quilmes', 'Florencio Varela', 'Berazategui', 'Almirante Brown',
  'Lomas de Zamora', 'Esteban Echeverría', 'Ezeiza', 'CABA'
]

// Zonas con ID (para forms que necesitan ID)
export const ZONAS = ZONAS_AMBA.map((nombre, index) => ({
  id: `zona-${index + 1}`,
  nombre,
}))

// Horarios disponibles
export const HORARIOS = [
  { value: 'manana', label: 'Mañana (8:00 - 12:00)', hora_inicio: '08:00', hora_fin: '12:00' },
  { value: 'tarde', label: 'Tarde (12:00 - 18:00)', hora_inicio: '12:00', hora_fin: '18:00' },
  { value: 'noche', label: 'Noche (18:00 - 21:00)', hora_inicio: '18:00', hora_fin: '21:00' },
] as const

// Días de la semana
export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo', corto: 'Dom' },
  { value: 1, label: 'Lunes', corto: 'Lun' },
  { value: 2, label: 'Martes', corto: 'Mar' },
  { value: 3, label: 'Miércoles', corto: 'Mié' },
  { value: 4, label: 'Jueves', corto: 'Jue' },
  { value: 5, label: 'Viernes', corto: 'Vie' },
  { value: 6, label: 'Sábado', corto: 'Sáb' },
] as const

// Estados de solicitud
export const ESTADOS_SOLICITUD = {
  pendiente: { label: 'Esperando respuesta', color: 'bg-blue-500/10 text-blue-400', icon: 'Clock' },
  aceptada: { label: 'Profesional confirmado', color: 'bg-blue-500/10 text-blue-400', icon: 'CheckCircle' },
  en_progreso: { label: 'Trabajo en progreso', color: 'bg-purple-500/10 text-purple-400', icon: 'Wrench' },
  completada: { label: 'Trabajo terminado', color: 'bg-green-500/10 text-green-400', icon: 'Check' },
  cancelada: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400', icon: 'X' },
} as const

// Formateo de moneda Argentina
export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio)
}

// Formateo de fecha
export function formatFecha(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Formateo de fecha corta
export function formatFechaCorta(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

// Formateo de hora
export function formatHora(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Formateo de tiempo relativo
export function formatTiempoRelativo(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Ahora mismo'
  if (minutos < 60) return `Hace ${minutos} min`
  if (horas < 24) return `Hace ${horas}h`
  if (dias < 7) return `Hace ${dias} días`
  return formatFechaCorta(date)
}

// Calcular comisión
export function calcularComision(monto: number, descuento: number = 0): {
  subtotal: number
  descuento: number
  total: number
  comision: number
  profesional: number
} {
  const subtotal = monto
  const total = monto - descuento
  const comision = Math.round(total * COMISION_PORCENTAJE)
  return {
    subtotal,
    descuento,
    total,
    comision,
    profesional: total - comision,
  }
}

// Generar código de referido
export function generarCodigoReferido(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'ENX'
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Validar teléfono argentino
export function validarTelefono(telefono: string): boolean {
  const limpio = telefono.replace(/\D/g, '')
  return limpio.length >= 10 && limpio.length <= 13
}

// Formatear teléfono
export function formatTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '')
  if (limpio.length === 10) {
    return `${limpio.slice(0, 2)}-${limpio.slice(2, 6)}-${limpio.slice(6)}`
  }
  return telefono
}

// Calcular distancia entre dos puntos (Haversine)
export function calcularDistancia(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // Radio de la tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
