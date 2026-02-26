'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface GoogleScriptSetupProps {
  onUrlConfigured: (url: string) => void
  currentUrl?: string
}

export function GoogleScriptSetup({ onUrlConfigured, currentUrl }: GoogleScriptSetupProps) {
  const [url, setUrl] = useState(currentUrl || '')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setError('Por favor ingresa una URL válida')
      return
    }

    setTesting(true)
    setError('')
    setSuccess(false)

    try {
      const testUrl = new URL(url)
      testUrl.searchParams.set('action', 'getDocentes')

      const res = await fetch(testUrl.toString(), {
        method: 'GET',
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      console.log('[v0] Connection test successful:', data)

      // Save to localStorage - Multiple times to ensure persistence
      localStorage.setItem('googleScriptUrl', url)
      localStorage.setItem('googleScriptUrlBackup', url)
      localStorage.setItem('googleScriptUrlTimestamp', new Date().toISOString())
      ;(window as any).__googleScriptUrl = url

      console.log('[v0] URL guardada permanentemente en localStorage')
      console.log('[v0] URL:', url)
      
      setSuccess(true)
      setError('')
      
      setTimeout(() => {
        onUrlConfigured(url)
      }, 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Fallo la conexión: ${message}`)
      console.error('[v0] Connection test failed:', err)
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem('googleScriptUrl', url)
    localStorage.setItem('googleScriptUrlBackup', url)
    localStorage.setItem('googleScriptUrlTimestamp', new Date().toISOString())
    ;(window as any).__googleScriptUrl = url
    console.log('[v0] URL guardada permanentemente:', url)
    onUrlConfigured(url)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 border border-border">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Configurar Google Apps Script
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresa la URL de tu Google Apps Script deployado para sincronizar datos con Google Drive.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              URL del Google Apps Script
            </label>
            <Input
              type="url"
              placeholder="https://script.google.com/macros/d/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError('')
                setSuccess(false)
              }}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Copia la URL de deployment de tu Google Apps Script aquí.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Conexión exitosa! Cargando datos...</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleTestConnection}
              disabled={testing || !url.trim()}
              className="flex-1"
              variant="default"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Probando...
                </>
              ) : (
                'Probar Conexión'
              )}
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              className="flex-1"
              disabled={!url.trim()}
            >
              Guardar
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Primeros pasos:
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Crea un Google Apps Script con las acciones necesarias</li>
              <li>Deploya como aplicación web con acceso para "Yo mismo"</li>
              <li>Copia la URL de deployment aquí</li>
              <li>Prueba la conexión</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}
