'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Edit2, Plus, ChevronLeft } from 'lucide-react'
import { createCurso, updateCurso, deleteCurso } from '@/lib/api'
import type { Curso } from '@/types'

interface CursosManagerProps {
  cursos: Curso[]
  onCursosChange: (cursos: Curso[]) => void
  onBack: () => void
}

export function CursosManager({ cursos, onCursosChange, onBack }: CursosManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', division: '' })
  const [loading, setLoading] = useState(false)

  const handleAddNew = () => {
    setEditingId('new')
    setFormData({ nombre: '', division: '' })
  }

  const handleEdit = (curso: Curso) => {
    setEditingId(curso.id)
    setFormData({ nombre: curso.nombre, division: curso.division })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ nombre: '', division: '' })
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert('Por favor ingresa el nombre del curso')
      return
    }

    setLoading(true)
    try {
      if (editingId === 'new') {
        const newCurso = await createCurso({
          nombre: formData.nombre,
          division: formData.division,
        })
        if (newCurso) {
          onCursosChange([...cursos, newCurso])
        }
      } else if (editingId) {
        const updated = await updateCurso(editingId, formData)
        if (updated) {
          onCursosChange(cursos.map(c => c.id === editingId ? updated : c))
        }
      }
      handleCancel()
    } catch (err) {
      console.error('Error saving curso:', err)
      alert('Error al guardar curso')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Se perderán todos los horarios asociados.')) return

    setLoading(true)
    try {
      const success = await deleteCurso(id)
      if (success) {
        onCursosChange(cursos.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Error deleting curso:', err)
      alert('Error al eliminar curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Gestionar Cursos/Divisiones</h1>
        </div>
        <Button onClick={handleAddNew} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {/* Edit/Add Form */}
      {editingId && (
        <Card className="p-4 border border-border bg-muted/50">
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">
              {editingId === 'new' ? 'Nuevo Curso' : 'Editar Curso'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Nombre (Ej: 1°1°, 2°2°)</label>
                <Input
                  type="text"
                  placeholder="1°1°"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">División</label>
                <Input
                  type="text"
                  placeholder="Ej: Primera, Segunda"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
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

      {/* Cursos List */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cursos.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border border-border col-span-full">
            No hay cursos. Crea uno para comenzar.
          </Card>
        ) : (
          cursos.map((curso) => (
            <Card
              key={curso.id}
              className="p-4 border border-border flex flex-col justify-between hover:bg-muted/50 transition"
            >
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {curso.nombre}
                </p>
                <p className="text-sm text-muted-foreground">
                  {curso.division || 'Sin división'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">ID: {curso.id}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleEdit(curso)}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(curso.id)}
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
