// Tipos de base de datos para Enermax V3
// Incluye: chat, disponibilidad, cupones, referidos, métricas admin

export type Database = {
  public: {
    Tables: {
      zonas: {
        Row: {
          id: string
          nombre: string
          provincia: string
          lat: number | null
          lng: number | null
          activa: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['zonas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['zonas']['Insert']>
      }
      categorias: {
        Row: {
          id: string
          nombre: string
          slug: string
          icono: string | null
          descripcion: string | null
          activa: boolean
          orden: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categorias']['Insert']>
      }
      profesionales: {
        Row: {
          id: string
          auth_id: string | null
          nombre: string
          apellido: string | null
          telefono: string
          email: string | null
          dni: string | null
          foto_url: string | null
          banner_url: string | null
          zona_base_id: string | null
          direccion: string | null
          lat: number | null
          lng: number | null
          bio: string | null
          experiencia_anos: number
          calificacion: number
          total_trabajos: number
          total_reviews: number
          verificado: boolean
          disponible: boolean
          activo: boolean
          premium: boolean
          mercadopago_user_id: string | null
          cbu: string | null
          alias_cbu: string | null
          categorias: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profesionales']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profesionales']['Insert']>
      }
      disponibilidad: {
        Row: {
          id: string
          profesional_id: string
          dia_semana: number // 0-6 (domingo-sábado)
          hora_inicio: string // HH:mm
          hora_fin: string
          activo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['disponibilidad']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['disponibilidad']['Insert']>
      }
      bloqueos: {
        Row: {
          id: string
          profesional_id: string
          fecha_inicio: string
          fecha_fin: string
          motivo: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bloqueos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bloqueos']['Insert']>
      }
      servicios: {
        Row: {
          id: string
          profesional_id: string
          categoria_id: string | null
          nombre: string
          descripcion: string | null
          precio: number
          precio_desde: boolean
          duracion_minutos: number
          activo: boolean
          destacado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['servicios']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['servicios']['Insert']>
      }
      solicitudes: {
        Row: {
          id: string
          cliente_auth_id: string | null
          profesional_id: string
          servicio_id: string | null
          cliente_nombre: string
          cliente_telefono: string
          cliente_email: string | null
          direccion: string
          lat: number | null
          lng: number | null
          zona_id: string | null
          notas: string | null
          fecha_solicitada: string | null
          horario_preferido: string | null
          fecha_programada: string | null
          fecha_completada: string | null
          monto_total: number
          comision_enermax: number
          monto_profesional: number
          cupon_id: string | null
          descuento_aplicado: number
          estado: EstadoSolicitud
          fotos_trabajo: string[] | null
          notas_profesional: string | null
          score_fraude: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['solicitudes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['solicitudes']['Insert']>
      }
      pagos: {
        Row: {
          id: string
          solicitud_id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          mercadopago_status: string | null
          monto: number
          comision_mp: number
          estado: EstadoPago
          transferencia_id: string | null
          fecha_liberacion: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pagos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pagos']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          solicitud_id: string
          profesional_id: string
          cliente_auth_id: string | null
          cliente_nombre: string | null
          calificacion: number
          comentario: string | null
          respuesta: string | null
          fecha_respuesta: string | null
          visible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      chat_mensajes: {
        Row: {
          id: string
          solicitud_id: string
          autor_tipo: 'cliente' | 'profesional' | 'sistema'
          autor_id: string | null
          mensaje: string
          archivo_url: string | null
          leido: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_mensajes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_mensajes']['Insert']>
      }
      notificaciones: {
        Row: {
          id: string
          usuario_auth_id: string | null
          profesional_id: string | null
          tipo: TipoNotificacion
          titulo: string
          mensaje: string | null
          solicitud_id: string | null
          data: Record<string, unknown> | null
          leida: boolean
          enviada_email: boolean
          enviada_push: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notificaciones']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notificaciones']['Insert']>
      }
      cupones: {
        Row: {
          id: string
          codigo: string
          tipo: 'porcentaje' | 'monto_fijo'
          valor: number
          minimo_compra: number | null
          usos_maximos: number | null
          usos_actuales: number
          fecha_inicio: string
          fecha_fin: string | null
          activo: boolean
          solo_nuevos_usuarios: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cupones']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cupones']['Insert']>
      }
      referidos: {
        Row: {
          id: string
          referente_auth_id: string
          referido_auth_id: string
          codigo_usado: string
          estado: 'pendiente' | 'completado' | 'expirado'
          monto_recompensa: number
          pagado: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referidos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['referidos']['Insert']>
      }
      codigos_referido: {
        Row: {
          id: string
          usuario_auth_id: string
          codigo: string
          usos_totales: number
          monto_ganado: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['codigos_referido']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['codigos_referido']['Insert']>
      }
      admin_metricas: {
        Row: {
          id: string
          fecha: string
          total_solicitudes: number
          solicitudes_completadas: number
          solicitudes_canceladas: number
          gmv: number
          comisiones: number
          nuevos_profesionales: number
          nuevos_clientes: number
          calificacion_promedio: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_metricas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_metricas']['Insert']>
      }
      push_subscriptions: {
        Row: {
          id: string
          usuario_auth_id: string | null
          profesional_id: string | null
          endpoint: string
          keys: Record<string, string>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>
      }
    }
  }
}

export type EstadoSolicitud =
  | 'pendiente'
  | 'aceptada'
  | 'en_progreso'
  | 'completada'
  | 'cancelada'

export type EstadoPago =
  | 'pendiente'
  | 'retenido'
  | 'liberado'
  | 'reembolsado'

export type TipoNotificacion =
  | 'nueva_solicitud'
  | 'solicitud_aceptada'
  | 'trabajo_completado'
  | 'pago_liberado'
  | 'nueva_review'
  | 'nuevo_mensaje'
  | 'recordatorio'
  | 'sistema'

// Tipos auxiliares
export type Profesional = Database['public']['Tables']['profesionales']['Row']
export type Servicio = Database['public']['Tables']['servicios']['Row']
export type Solicitud = Database['public']['Tables']['solicitudes']['Row']
export type Pago = Database['public']['Tables']['pagos']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Zona = Database['public']['Tables']['zonas']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type ChatMensaje = Database['public']['Tables']['chat_mensajes']['Row']
export type Disponibilidad = Database['public']['Tables']['disponibilidad']['Row']
export type Cupon = Database['public']['Tables']['cupones']['Row']
export type Notificacion = Database['public']['Tables']['notificaciones']['Row']

// Profesional con relaciones
export type ProfesionalConDetalles = Profesional & {
  servicios: Servicio[]
  zona_base: Zona | null
  reviews?: Review[]
  disponibilidad?: Disponibilidad[]
}

// Solicitud con relaciones
export type SolicitudConDetalles = Solicitud & {
  profesional: Profesional
  servicio: Servicio | null
  mensajes?: ChatMensaje[]
  pago?: Pago
}
