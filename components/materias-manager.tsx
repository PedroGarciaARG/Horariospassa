'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Trash2, Edit2, Plus, ChevronLeft } from 'lucide-react'
import { createMateria, updateMateria, deleteMateria, createDocenteMateriaAsignacion, deleteDocenteMateriaAsignacion } from '@/lib/api'
import { CONDICION_LABELS, CONDICION_COLORS } from '@/types'
import type { Materia, Docente, DocenteMateriaAsignacion, Condicion } from '@/types'

interface MateriasManagerProps {
  materias: Materia[]
  docentes: Docente[]
  asignaciones: DocenteMateriaAsignacion[]
  onMateriasChange: (materias: Materia[]) => void
  onAsignacionesChange: (asignaciones: DocenteMateriaAsignacion[]) => void
  onBack: () => void
}

export function MateriasManager({
  materias,
  docentes,
  asignaciones,
  onMateriasChange,
  onAsignacionesChange,
  onBack,
}: MateriasManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', tieneSubgrupos: false })
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddNew = () => {
    setEditingId('new')
    setFormData({ nombre: '', tieneSubgrupos: false })
  }

  const handleEdit = (materia: Materia) => {
    setEditingId(materia.id)
    setFormData({ nombre: materia.nombre, tieneSubgrupos: materia.tieneSubgrupos || false })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ nombre: '', tieneSubgrupos: false })
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert('Por favor ingresa el nombre de la materia')
      return
    }

    setLoading(true)
    try {
      if (editingId === 'new') {
        const newMateria = await createMateria({
          nombre: formData.nombre,
          tieneSubgrupos: formData.tieneSubgrupos,
          docenteIds: [],
        })
        if (newMateria) {
          onMateriasChange([...materias, newMateria])
        }
      } else if (editingId) {
        const updated = await updateMateria(editingId, formData)
        if (updated) {
          onMateriasChange(materias.map(m => m.id === editingId ? updated : m))
        }
      }
      handleCancel()
    } catch (err) {
      console.error('Error saving materia:', err)
      alert('Error al guardar materia')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro? Se eliminarán todas las asignaciones de docentes.')) return

    setLoading(true)
    try {
      const success = await deleteMateria(id)
      if (success) {
        onMateriasChange(materias.filter(m => m.id !== id))
        setSelectedMateria(null)
      }
    } catch (err) {
      console.error('Error deleting materia:', err)
      alert('Error al eliminar materia')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDocente = async (materiaId: string, docenteId: string, condicion: Condicion) => {
    setLoading(true)
    try {
      const newAsignacion = await createDocenteMateriaAsignacion({
        docenteId,
        materiaId,
        condicion,
      })
      if (newAsignacion) {
        onAsignacionesChange([...asignaciones, newAsignacion])
      }
    } catch (err) {
      console.error('Error adding docente:', err)
      alert('Error al asignar docente')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDocente = async (asignacionId: string) => {
    setLoading(true)
    try {
      const success = await deleteDocenteMateriaAsignacion(asignacionId)
      if (success) {
        onAsignacionesChange(asignaciones.filter(a => a.id !== asignacionId))
      }
    } catch (err) {
      console.error('Error removing docente:', err)
      alert('Error al desasignar docente')
    } finally {
      setLoading(false)
    }
  }

  const selectedMateriaData = selectedMateria ? materias.find(m => m.id === selectedMateria) : null
  const materiasAsignaciones = selectedMateria ? asignaciones.filter(a => a.materiaId === selectedMateria) : []
  const docentesAsignados = materiasAsignaciones.map(a => a.docenteId)
  const docentesDisponibles = docentes.filter(d => !docentesAsignados.includes(d.id))

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Gestionar Materias</h1>
        </div>
        <Button onClick={handleAddNew} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      {/* Edit/Add Form */}
      {editingId && (
        <Card className="p-4 border border-border bg-muted/50">
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">
              {editingId === 'new' ? 'Nueva Materia' : 'Editar Materia'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Nombre</label>
                <Input
                  type="text"
                  placeholder="Nombre de la materia"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: formData.tieneSubgrupos ? "#f59e0b" : "#e5e7eb", backgroundColor: formData.tieneSubgrupos ? "#fffbeb" : "transparent" }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tieneSubgrupos}
                    onChange={(e) => setFormData({ ...formData, tieneSubgrupos: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-foreground">Es materia tipo Taller</span>
                </label>
                {formData.tieneSubgrupos && (
                  <p className="text-xs mt-1.5 ml-6" style={{ color: "#92400e" }}>
                    Esta materia se dividira en Grupo A y Grupo B, cada uno con su propio docente y horario.
                  </p>
                )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Materias List */}
        <Card className="p-4 border border-border lg:col-span-1">
          <h2 className="font-semibold text-foreground mb-3">Materias</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {materias.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay materias</p>
            ) : (
              materias.map((materia) => (
                <div
                  key={materia.id}
                  className={`p-2 rounded border cursor-pointer transition ${
                    selectedMateria === materia.id
                      ? 'bg-primary/10 border-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedMateria(materia.id)}
                >
                  <p className="text-sm font-medium text-foreground">{materia.nombre}</p>
                  {materia.tieneSubgrupos && (
                    <p className="text-xs text-muted-foreground">Con subgrupos</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Docente Assignments */}
        {selectedMateriaData && (
          <Card className="p-4 border border-border lg:col-span-2">
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground">
                Docentes en {selectedMateriaData.nombre}
              </h2>

              {/* Current Assignments */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Asignados:</h3>
                {materiasAsignaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin docentes asignados</p>
                ) : (
                  <div className="space-y-2">
                    {materiasAsignaciones.map((asignacion) => {
                      const docente = docentes.find(d => d.id === asignacion.docenteId)
                      return (
                        <div
                          key={asignacion.id}
                          className="flex items-center justify-between p-2 rounded border border-border bg-muted/50"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {docente?.nombre} {docente?.apellido}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${CONDICION_COLORS[asignacion.condicion]}`}>
                              {CONDICION_LABELS[asignacion.condicion]}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleRemoveDocente(asignacion.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Add New Docente */}
              {docentesDisponibles.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-2">Asignar docente:</h3>
                  <div className="space-y-2">
                    {docentesDisponibles.map((docente) => (
                      <div key={docente.id} className="flex items-center gap-2 p-2 rounded border border-border bg-muted/30">
                        <span className="flex-1 text-sm font-medium text-foreground">
                          {docente.nombre} {docente.apellido}
                        </span>
                        <select
                          className="text-xs px-2 py-1 rounded border border-border bg-background"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddDocente(selectedMateria, docente.id, e.target.value as Condicion)
                              e.target.value = ''
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">Seleccionar rol...</option>
                          <option value="titular">Titular</option>
                          <option value="suplente">Suplente</option>
                          <option value="provisional">Provisional</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit/Delete Materia */}
              <div className="pt-4 border-t border-border flex gap-2">
                <Button
                  onClick={() => handleEdit(selectedMateriaData)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={loading}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(selectedMateria)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
