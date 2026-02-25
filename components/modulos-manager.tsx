'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Edit2, Plus, ChevronLeft } from 'lucide-react'
import { createModulo, updateModulo, deleteModulo } from '@/lib/api'
import { MODULO_TIPO_LABELS, MODULO_TIPO_COLORS } from '@/types'
import type { Modulo } from '@/types'

interface ModulosManagerProps {
  modulos: Modulo[]
  onModulosChange: (modulos: Modulo[]) => void
  onBack: () => void
}

export function ModulosManager({ modulos, onModulosChange, onBack }: ModulosManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    numero: 1,
    horaInicio: '',
    horaFin: '',
    tipo: 'clase' as const,
    etiqueta: '',
  })
  const [loading, setLoading] = useState(false)

  const handleAddNew = () => {
    setEditingId('new')
    setFormData({
      numero: Math.max(...modulos.map(m => m.numero), 0) + 1,
      horaInicio: '',
      horaFin: '',
      tipo: 'clase',
      etiqueta: '',
    })
  }

  const handleEdit = (modulo: Modulo) => {
    setEditingId(modulo.id)
    setFormData({
      numero: modulo.numero,
      horaInicio: modulo.horaInicio,
      horaFin: modulo.horaFin,
      tipo: modulo.tipo,
      etiqueta: modulo.etiqueta || '',
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      numero: 1,
      horaInicio: '',
      horaFin: '',
      tipo: 'clase',
      etiqueta: '',
    })
  }

  const handleSave = async () => {
    if (!formData.horaInicio || !formData.horaFin) {
      alert('Por favor completa las horas de inicio y fin')
      return
    }

    setLoading(true)
    try {
      const data = {
        numero: formData.numero,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        tipo: formData.tipo,
        ...(formData.etiqueta && { etiqueta: formData.etiqueta }),
      }

      if (editingId === 'new') {
        const newModulo = await createModulo(data)
        if (newModulo) {
          const sorted = [...modulos, newModulo].sort((a, b) => a.numero - b.numero)
          onModulosChange(sorted)
        }
      } else if (editingId) {
        const updated = await updateModulo(editingId, data)
        if (updated) {
          const sorted = modulos.map(m => m.id === editingId ? updated : m).sort((a, b) => a.numero - b.numero)
          onModulosChange(sorted)
        }
      }
      handleCancel()
    } catch (err) {
      console.error('Error saving modulo:', err)
      alert('Error al guardar módulo')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este módulo?')) return

    setLoading(true)
    try {
      const success = await deleteModulo(id)
      if (success) {
        onModulosChange(modulos.filter(m => m.id !== id))
      }
    } catch (err) {
      console.error('Error deleting modulo:', err)
      alert('Error al eliminar módulo')
    } finally {
      setLoading(false)
    }
  }

  const sortedModulos = [...modulos].sort((a, b) => a.numero - b.numero)

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Gestionar Módulos/Recreos</h1>
        </div>
        <Button onClick={handleAddNew} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Módulo
        </Button>
      </div>

      {/* Edit/Add Form */}
      {editingId && (
        <Card className="p-4 border border-border bg-muted/50">
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">
              {editingId === 'new' ? 'Nuevo Módulo' : 'Editar Módulo'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Número</label>
                <Input
                  type="number"
                  placeholder="Número"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
                >
                  <option value="clase">Clase</option>
                  <option value="recreo">Recreo</option>
                  <option value="teoria">Teoría</option>
                  <option value="taller">Taller</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Hora Inicio</label>
                <Input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Hora Fin</label>
                <Input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                />
              </div>
              {formData.tipo === 'recreo' && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground block mb-1">Etiqueta (opcional)</label>
                  <Input
                    type="text"
                    placeholder="Ej: Recreo, Descanso"
                    value={formData.etiqueta}
                    onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                  />
                </div>
              )}
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

      {/* Módulos List */}
      <div className="grid gap-3">
        {sortedModulos.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border border-border">
            No hay módulos. Crea uno para comenzar.
          </Card>
        ) : (
          sortedModulos.map((modulo) => (
            <Card
              key={modulo.id}
              className={`p-4 border flex items-center justify-between ${MODULO_TIPO_COLORS[modulo.tipo]}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="bg-current/20 rounded px-3 py-1 font-semibold">
                    {modulo.numero}
                  </div>
                  <div>
                    <p className="font-medium">
                      {modulo.horaInicio} - {modulo.horaFin}
                    </p>
                    <p className="text-sm opacity-75">
                      {MODULO_TIPO_LABELS[modulo.tipo]}
                      {modulo.etiqueta && ` • ${modulo.etiqueta}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(modulo)}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(modulo.id)}
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
