'use client'

import { useEffect, useState } from 'react'

/**
 * Hook para sincronizar la URL del Google Apps Script desde localStorage
 * a través de window.__googleScriptUrl
 */
export function useGoogleScriptUrl() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Carga la URL guardada desde localStorage
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('googleScriptUrl')
      if (savedUrl) {
        ;(window as any).__googleScriptUrl = savedUrl
        console.log('[v0] Loaded Google Script URL from localStorage:', savedUrl)
      }
      setIsReady(true)
    }
  }, [])

  return isReady
}

