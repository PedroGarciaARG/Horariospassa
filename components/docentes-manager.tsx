'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Edit2, Plus, ChevronLeft } from 'lucide-react'
import { createDocente, updateDocente, deleteDocente } from '@/lib/api'
import type { Docente } from '@/types'

interface DocentesManagerProps {
  docentes: Docente[]
  onDocentesChange: (docentes: Docente[]) => void
  onBack: () => void
}

export function DocentesManager({ docentes, onDocentesChange, onBack }: DocentesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', apellido: '' })
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleAddNew = () => {
    setEditingId('new')
    setFormData({ nombre: '', apellido: '' })
    scrollToForm()
  }

  const handleEdit = (docente: Docente) => {
    setEditingId(docente.id)
    setFormData({ nombre: docente.nombre, apellido: docente.apellido })
    scrollToForm()
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ nombre: '', apellido: '' })
  }

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('Por favor completa nombre y apellido')
      return
    }

    setLoading(true)
    try {
      if (editingId === 'new') {
        const newDocente = await createDocente({
          nombre: formData.nombre,
          apellido: formData.apellido,
        })
        // Always update local state, even if backend call failed (offline/mock mode)
        const docenteToAdd = newDocente ?? {
          id: `d_${Date.now()}`,
          nombre: formData.nombre,
          apellido: formData.apellido,
        }
        onDocentesChange([...docentes, docenteToAdd])
      } else if (editingId) {
        const updated = await updateDocente(editingId, formData)
        // Always update local state with the form data regardless of backend response
        const docenteActualizado: Docente = updated ?? {
          id: editingId,
          nombre: formData.nombre,
          apellido: formData.apellido,
        }
        onDocentesChange(docentes.map(d => d.id === editingId ? docenteActualizado : d))
      }
      handleCancel()
    } catch (err) {
      console.error('Error saving docente:', err)
      alert('Error al guardar docente')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este docente?')) return

    setLoading(true)
    try {
      const success = await deleteDocente(id)
      if (success) {
        onDocentesChange(docentes.filter(d => d.id !== id))
      }
    } catch (err) {
      console.error('Error deleting docente:', err)
      alert('Error al eliminar docente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={formRef} className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Gestionar Docentes</h1>
        </div>
        <Button onClick={handleAddNew} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Docente
        </Button>
      </div>

      {/* Edit/Add Form */}
      {editingId && (
        <Card className="p-4 border border-border bg-muted/50">
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">
              {editingId === 'new' ? 'Nuevo Docente' : 'Editar Docente'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Nombre</label>
                <Input
                  type="text"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Apellido</label>
                <Input
                  type="text"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Docentes List */}
      <div className="grid gap-3">
        {docentes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border border-border">
            No hay docentes. Crea uno para comenzar.
          </Card>
        ) : (
          docentes.map((docente) => (
            <Card
              key={docente.id}
              className="p-4 border border-border flex items-center justify-between hover:bg-muted/50 transition"
            >
              <div>
                <p className="font-medium text-foreground">
                  {docente.nombre} {docente.apellido}
                </p>
                <p className="text-xs text-muted-foreground">ID: {docente.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(docente)}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(docente.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
