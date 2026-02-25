"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { X, AlertTriangle, ChevronLeft, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Docente, DocenteMateriaAsignacion, Materia, Curso, Modulo, BloqueHorario } from "@/types"
import { DIAS, CONDICION_COLORS, CONDICION_LABELS, MODULO_TIPO_LABELS, MODULO_TIPO_COLORS } from "@/types"
import { saveBloques, getDocenteCondicion } from "@/lib/api"

interface EditorHorariosProps {
  docentes: Docente[]
  docenteMateriaAsignaciones: DocenteMateriaAsignacion[]
  materias: Materia[]
  cursos: Curso[]
  modulos: Modulo[]
  initialBloques: BloqueHorario[]
  onBack: () => void
}

// ---- Draggable Cell Content ----
function DraggableBloque({
  bloque,
  materia,
  docente,
  condicion,
  onRemove,
}: {
  bloque: BloqueHorario
  materia: Materia | undefined
  docente: Docente | undefined
  condicion: "titular" | "suplente" | "provisional" | undefined
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: bloque.id,
    data: bloque,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group rounded-lg border bg-white shadow-sm p-2 cursor-grab active:cursor-grabbing text-left w-full h-full"
    >
      <p className="font-semibold text-xs leading-tight text-foreground truncate">
        {materia?.nombre ?? "—"}
      </p>
      <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
        {docente ? `${docente.apellido}, ${docente.nombre[0]}.` : "—"}
      </p>
      {bloque.grupo && (
        <span className="text-xs font-bold" style={{ color: "#0B6B2E" }}>
          Grupo {bloque.grupo}
        </span>
      )}
      {condicion && (
        <span
          className={`mt-1 inline-block text-xs font-medium px-1.5 py-0.5 rounded border ${CONDICION_COLORS[condicion]}`}
        >
          {CONDICION_LABELS[condicion]}
        </span>
      )}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-red-50 hover:bg-red-100 p-0.5"
      >
        <X className="h-3 w-3 text-red-500" />
      </button>
    </div>
  )
}

// ---- Droppable Cell ----
function DroppableCell({
  cellId,
  children,
  onClick,
  isRecreo,
}: {
  cellId: string
  children: React.ReactNode
  onClick: () => void
  isRecreo: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: cellId })

  if (isRecreo) {
    return (
      <td className="border-r border-border last:border-r-0 text-center py-1">
        <span className="text-xs font-semibold" style={{ color: "#D4AF37" }}>—</span>
      </td>
    )
  }

  return (
    <td
      ref={setNodeRef}
      className="border-r border-border last:border-r-0 p-1.5 align-top min-w-[120px] transition-colors cursor-pointer"
      style={{
        background: isOver ? "#E8F5EC" : "transparent",
        minHeight: "80px",
      }}
      onClick={onClick}
    >
      {children ?? (
        <div className="h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors flex items-center justify-center">
          <span className="text-xs text-muted-foreground/50">+</span>
        </div>
      )}
    </td>
  )
}

// ---- Main Editor ----
export function EditorHorarios({
  docentes,
  docenteMateriaAsignaciones,
  materias,
  cursos,
  modulos,
  initialBloques,
  onBack,
}: EditorHorariosProps) {
  const [selectedCursoId, setSelectedCursoId] = useState(cursos[0]?.id ?? "")
  const [bloques, setBloques] = useState<BloqueHorario[]>(initialBloques)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCell, setEditingCell] = useState<{ diaIndex: number; moduloId: string } | null>(null)
  const [formMateria, setFormMateria] = useState("")
  const [formDocente, setFormDocente] = useState("")
  const [formGrupo, setFormGrupo] = useState<"A" | "B" | "">("")
  const [dragConflict, setDragConflict] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeDragBloque, setActiveDragBloque] = useState<BloqueHorario | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const getBloque = useCallback(
    (diaIndex: number, moduloId: string) =>
      bloques.find(
        (b) => b.cursoId === selectedCursoId && b.diaIndex === diaIndex && b.moduloId === moduloId
      ) ?? null,
    [bloques, selectedCursoId]
  )

  function hasConflict(docenteId: string, diaIndex: number, moduloId: string, excludeId?: string) {
    return bloques.some(
      (b) =>
        b.id !== excludeId &&
        b.docenteId === docenteId &&
        b.diaIndex === diaIndex &&
        b.moduloId === moduloId
    )
  }

  function openDialog(diaIndex: number, moduloId: string) {
    const existing = getBloque(diaIndex, moduloId)
    setEditingCell({ diaIndex, moduloId })
    setFormMateria(existing?.materiaId ?? "")
    setFormDocente(existing?.docenteId ?? "")
    setFormGrupo(existing?.grupo ?? "")
    setDragConflict("")
    setDialogOpen(true)
  }

  function handleSaveCell() {
    if (!editingCell || !formMateria || !formDocente) return
    const { diaIndex, moduloId } = editingCell
    const existing = getBloque(diaIndex, moduloId)

    if (hasConflict(formDocente, diaIndex, moduloId, existing?.id)) {
      setDragConflict("El docente ya tiene asignada otra clase en este módulo y día.")
      return
    }

    const materia = materias.find((m) => m.id === formMateria)
    const newBloque: BloqueHorario = {
      id: existing?.id ?? `b${Date.now()}`,
      cursoId: selectedCursoId,
      diaIndex,
      moduloId,
      materiaId: formMateria,
      docenteId: formDocente,
      grupo: materia?.tieneSubgrupos && formGrupo ? (formGrupo as "A" | "B") : null,
    }

    setBloques((prev) => {
      const filtered = prev.filter((b) => b.id !== newBloque.id)
      return [...filtered, newBloque]
    })
    setDialogOpen(false)
  }

  function handleRemoveBloque(bloqueId: string) {
    setBloques((prev) => prev.filter((b) => b.id !== bloqueId))
  }

  function handleDragStart(event: DragStartEvent) {
    const bloque = bloques.find((b) => b.id === event.active.id)
    setActiveDragBloque(bloque ?? null)
    setDragConflict("")
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragBloque(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedBloque = bloques.find((b) => b.id === active.id)
    if (!draggedBloque) return

    // Parse cell id: "cell-{cursoId}-{diaIndex}-{moduloId}"
    const parts = String(over.id).split("-")
    if (parts.length < 4 || parts[0] !== "cell") return

    const diaIndex = parseInt(parts[2])
    const moduloId = parts.slice(3).join("-")

    const targetModulo = modulos.find((m) => m.id === moduloId)
    if (!targetModulo || targetModulo.tipo === "recreo") return

    if (hasConflict(draggedBloque.docenteId, diaIndex, moduloId, draggedBloque.id)) {
      setDragConflict(
        `Conflicto: ${docentes.find((d) => d.id === draggedBloque.docenteId)?.apellido} ya tiene clase en ese módulo.`
      )
      return
    }

    setBloques((prev) =>
      prev.map((b) =>
        b.id === draggedBloque.id ? { ...b, diaIndex, moduloId } : b
      )
    )
  }

  async function handleSaveAll() {
    setSaving(true)
    try {
      await saveBloques(bloques.filter((b) => b.cursoId === selectedCursoId))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const selectedMateria = materias.find((m) => m.id === formMateria)
  const filteredDocentes = formMateria
    ? docentes.filter((d) => 
        docenteMateriaAsignaciones.some(a => a.docenteId === d.id && a.materiaId === formMateria)
      )
    : docentes

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="h-5 w-px bg-border" />
          <h2 className="font-serif text-2xl font-bold">Editor de Horarios</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={saving}
            className="gap-1.5"
            style={{ background: "#0B6B2E", color: "#fff" }}
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
          </Button>
        </div>
      </div>

      {dragConflict && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{dragConflict}</AlertDescription>
        </Alert>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs">
        {(["titular", "suplente", "provisional"] as const).map((c) => (
          <span key={c} className={`px-2 py-0.5 rounded border font-medium ${CONDICION_COLORS[c]}`}>
            {CONDICION_LABELS[c]}
          </span>
        ))}
        <div className="w-px h-5 bg-border" />
        {(["teoria", "taller"] as const).map((tipo) => (
          <span key={tipo} className={`px-2 py-0.5 rounded border font-medium text-xs ${MODULO_TIPO_COLORS[tipo]}`}>
            {MODULO_TIPO_LABELS[tipo]}
          </span>
        ))}
        <span className="text-muted-foreground ml-2">Haga clic en una celda para asignar · Arrastre para mover</span>
      </div>

      {/* Grid */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ background: "#0B6B2E" }}>
                <th className="text-left px-4 py-3 text-white font-semibold text-xs w-32 rounded-tl-xl">
                  Módulo
                </th>
                {DIAS.map((dia, i) => (
                  <th key={i} className="px-3 py-3 text-white font-semibold text-xs text-center">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulos.map((modulo, rowIdx) => {
                const isRecreo = modulo.tipo === "recreo"
                return (
                  <tr
                    key={modulo.id}
                    className="border-t border-border"
                    style={isRecreo ? { background: "#FBF3D5" } : rowIdx % 2 === 0 ? {} : { background: "#FAFAFA" }}
                  >
                    {/* Time column */}
                    <td className="px-4 py-2 border-r border-border">
                      {isRecreo ? (
                        <span className="font-semibold text-xs" style={{ color: "#8B6914" }}>
                          {modulo.etiqueta ?? "Recreo"}
                          <span className="block font-normal text-muted-foreground">
                            {modulo.horaInicio} – {modulo.horaFin}
                          </span>
                        </span>
                      ) : (
                        <div>
                          <span className="font-bold text-xs text-foreground">
                            Mód. {modulo.numero}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {modulo.horaInicio} – {modulo.horaFin}
                          </span>
                          {(modulo.tipo === "teoria" || modulo.tipo === "taller") && (
                            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded border ${MODULO_TIPO_COLORS[modulo.tipo]}`}>
                              {MODULO_TIPO_LABELS[modulo.tipo]}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Day cells */}
                    {DIAS.map((_, diaIndex) => {
                      const cellId = `cell-${selectedCursoId}-${diaIndex}-${modulo.id}`
                      const bloque = getBloque(diaIndex, modulo.id)
                      const materia = materias.find((m) => m.id === bloque?.materiaId)
                      const docente = docentes.find((d) => d.id === bloque?.docenteId)

                      return (
                        <DroppableCell
                          key={diaIndex}
                          cellId={cellId}
                          isRecreo={isRecreo}
                          onClick={() => !isRecreo && openDialog(diaIndex, modulo.id)}
                        >
                          {bloque && (
                            <DraggableBloque
                              bloque={bloque}
                              materia={materia}
                              docente={docente}
                              condicion={getDocenteCondicion(bloque.docenteId, bloque.materiaId, docenteMateriaAsignaciones)}
                              onRemove={() => handleRemoveBloque(bloque.id)}
                            />
                          )}
                        </DroppableCell>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <DragOverlay>
          {activeDragBloque && (
            <div className="rounded-lg border bg-white shadow-xl p-2 w-28 opacity-95">
              <p className="font-semibold text-xs truncate">
                {materias.find((m) => m.id === activeDragBloque.materiaId)?.nombre}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {docentes.find((d) => d.id === activeDragBloque.docenteId)?.apellido}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              {editingCell
                ? `${DIAS[editingCell.diaIndex]} – ${modulos.find((m) => m.id === editingCell.moduloId)?.horaInicio}`
                : "Asignar clase"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Materia</Label>
              <Select
                value={formMateria}
                onValueChange={(v) => { setFormMateria(v); setFormDocente(""); setFormGrupo("") }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Docente</Label>
              <Select value={formDocente} onValueChange={setFormDocente} disabled={!formMateria}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDocentes.map((d) => {
                    const condicion = getDocenteCondicion(d.id, formMateria, docenteMateriaAsignaciones)
                    return (
                      <SelectItem key={d.id} value={d.id}>
                        {d.apellido}, {d.nombre}
                        {condicion && (
                          <span className={`ml-2 text-xs px-1 rounded ${CONDICION_COLORS[condicion]}`}>
                            {CONDICION_LABELS[condicion]}
                          </span>
                        )}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedMateria?.tieneSubgrupos && (
              <div className="flex flex-col gap-1.5">
                <Label>Subgrupo (Taller)</Label>
                <Select value={formGrupo} onValueChange={(v) => setFormGrupo(v as "A" | "B" | "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grupo A</SelectItem>
                    <SelectItem value="B">Grupo B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {dragConflict && (
              <p className="text-sm text-destructive font-medium">{dragConflict}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveCell}
              disabled={!formMateria || !formDocente}
              style={{ background: "#0B6B2E", color: "#fff" }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
