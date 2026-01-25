import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enermax.com.ar'

  // Static pages
  const staticPages = [
    '',
    '/ayuda',
    '/contacto',
    '/terminos',
    '/privacidad',
    '/login',
    '/registro',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic professional pages
  let professionalPages: MetadataRoute.Sitemap = []

  try {
    const supabase = createServerClient()
    const { data: profesionales } = await supabase
      .from('profesionales')
      .select('id, updated_at')
      .eq('activo', true)

    if (profesionales) {
      professionalPages = profesionales.map((pro) => ({
        url: `${baseUrl}/profesional/${pro.id}`,
        lastModified: new Date(pro.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }))
    }
  } catch (error) {
    console.error('Error fetching professionals for sitemap:', error)
  }

  return [...staticPages, ...professionalPages]
}
