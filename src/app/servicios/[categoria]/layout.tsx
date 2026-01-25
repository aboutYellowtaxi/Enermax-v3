import { Metadata } from 'next'

const CATEGORIAS_META: Record<string, { titulo: string; descripcion: string }> = {
  electricidad: {
    titulo: 'Electricistas en Buenos Aires',
    descripcion: 'Encontra electricistas matriculados y verificados. Instalaciones, reparaciones, urgencias 24hs. Pago protegido.',
  },
  plomeria: {
    titulo: 'Plomeros en Buenos Aires',
    descripcion: 'Plomeros profesionales para destapes, reparaciones e instalaciones sanitarias. Pago protegido.',
  },
  gas: {
    titulo: 'Gasistas Matriculados en Buenos Aires',
    descripcion: 'Gasistas con matricula ENARGAS. Instalaciones seguras, certificaciones, calefactores. Pago protegido.',
  },
  pintura: {
    titulo: 'Pintores en Buenos Aires',
    descripcion: 'Pintores profesionales para interiores y exteriores. Empapelado, impermeabilizacion. Pago protegido.',
  },
  carpinteria: {
    titulo: 'Carpinteros en Buenos Aires',
    descripcion: 'Carpinteros para muebles a medida, placares, cocinas. Diseno e instalacion. Pago protegido.',
  },
  cerrajeria: {
    titulo: 'Cerrajeros 24 Horas en Buenos Aires',
    descripcion: 'Cerrajeros de urgencia. Apertura de puertas, cambio de cerraduras, seguridad. Pago protegido.',
  },
  aire: {
    titulo: 'Tecnicos de Aire Acondicionado en Buenos Aires',
    descripcion: 'Instalacion y reparacion de aires split. Carga de gas, mantenimiento. Pago protegido.',
  },
  limpieza: {
    titulo: 'Servicios de Limpieza en Buenos Aires',
    descripcion: 'Limpieza profesional para hogares y oficinas. Post obra, mudanzas. Pago protegido.',
  },
}

type Props = {
  params: Promise<{ categoria: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const meta = CATEGORIAS_META[categoria]

  if (!meta) {
    return {
      title: 'Servicios Profesionales',
      description: 'Encontra profesionales verificados para tu hogar.',
    }
  }

  return {
    title: meta.titulo,
    description: meta.descripcion,
    keywords: [
      categoria,
      'profesionales',
      'Buenos Aires',
      'Argentina',
      'servicios',
      'hogar',
      'pago protegido',
    ],
    openGraph: {
      title: `${meta.titulo} | Enermax`,
      description: meta.descripcion,
      type: 'website',
    },
  }
}

export function generateStaticParams() {
  return [
    { categoria: 'electricidad' },
    { categoria: 'plomeria' },
    { categoria: 'gas' },
    { categoria: 'pintura' },
    { categoria: 'carpinteria' },
    { categoria: 'cerrajeria' },
    { categoria: 'aire' },
    { categoria: 'limpieza' },
  ]
}

export default function CategoriaLayout({ children }: { children: React.ReactNode }) {
  return children
}
