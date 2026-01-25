'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocalización no soportada en este navegador',
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        })
      },
      (error) => {
        let errorMessage = 'Error obteniendo ubicación'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible'
            break
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado'
            break
        }
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    )
  }, [])

  return state
}
