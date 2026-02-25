'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ConfigGoogleSheets() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [testing, setTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'success' | 'error' | null>(null)

  // Load saved URL on mount
  useEffect(() => {
    const saved = localStorage.getItem('googleScriptUrl')
    if (saved) setUrl(saved)
  }, [])

  const testConnection = async () => {
    if (!url.trim()) {
      setTestStatus('error')
      return
    }
    setTesting(true)
    setTestStatus(null)
    try {
      const testUrl = new URL(url)
      testUrl.searchParams.set('action', 'getModulos')
      const res = await fetch(testUrl.toString())
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setTestStatus('success')
        } else {
          setTestStatus('error')
        }
      } else {
        setTestStatus('error')
      }
    } catch (err) {
      setTestStatus('error')
    } finally {
      setTesting(false)
    }
  }

  const saveAndClose = () => {
    if (url.trim()) {
      localStorage.setItem('googleScriptUrl', url)
      // Actualiza window también para que se use inmediatamente
      ;(window as any).__googleScriptUrl = url
      console.log('[v0] Saved Google Script URL:', url)
      setOpen(false)
      // Fuerza recarga para que cargue los nuevos datos
      window.location.reload()
    }
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setOpen(true)}
        className='text-white/80 hover:text-white hover:bg-white/10 gap-2'
      >
        <Settings className='h-4 w-4' />
        <span className='hidden sm:inline text-sm'>Configurar</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Google Apps Script</DialogTitle>
            <DialogDescription>
              Configura tu Google Apps Script para guardar y cargar datos
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Input */}
            <div>
              <label className='block text-sm font-medium mb-2'>
                URL de Deploy del Apps Script
              </label>
              <input
                type='url'
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setTestStatus(null)
                }}
                placeholder='https://script.google.com/macros/d/...'
                className='w-full px-3 py-2 border rounded-md text-sm font-mono'
              />
              <p className='text-xs text-gray-500 mt-2'>
                {url ? 'URL guardada en tu navegador' : 'No configurado'}
              </p>
            </div>

            {/* Test button */}
            <div className='flex gap-2'>
              <Button
                onClick={testConnection}
                disabled={!url.trim() || testing}
                size='sm'
                variant='outline'
                className='flex-1'
              >
                {testing ? 'Probando...' : 'Probar Conexión'}
              </Button>
              {testStatus === 'success' && (
                <div className='flex items-center gap-1 text-green-600 text-sm'>
                  <Check className='h-4 w-4' />
                  OK
                </div>
              )}
              {testStatus === 'error' && (
                <div className='flex items-center gap-1 text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4' />
                  Error
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className='bg-blue-50 border border-blue-200 rounded-md p-3 text-xs space-y-2'>
              <p className='font-semibold text-blue-900'>Pasos:</p>
              <ol className='list-decimal list-inside space-y-1 text-blue-800'>
                <li>Crea un Google Sheet nuevo</li>
                <li>Abre el Apps Script editor (Extensiones → Apps Script)</li>
                <li>Copia el código que se proporciona</li>
                <li>Haz Deploy como App Web (nuevo deployment)</li>
                <li>Copia la URL y pégala aquí</li>
              </ol>
            </div>

            {/* Buttons */}
            <div className='flex gap-2'>
              <Button
                onClick={saveAndClose}
                disabled={!url.trim()}
                className='flex-1'
              >
                Guardar
              </Button>
              <Button
                onClick={() => setOpen(false)}
                variant='outline'
                className='flex-1'
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
