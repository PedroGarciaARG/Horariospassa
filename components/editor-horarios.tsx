"use client"

import { useState, useCallback } from "react"
import { formatHora } from "@/lib/utils"
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
  DialogDescription,
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
import type { Docente, DocenteMateriaAsignacion, Materia, Curso, Modulo, BloqueHorario, DocenteAsignacion } from "@/types"
import { DIAS, CONDICION_COLORS, CONDICION_LABELS, MODULO_TIPO_LABELS, MODULO_TIPO_COLORS } from "@/types"
import { saveBloquesForDay, getDocenteCondicion } from "@/lib/api"

interface EditorHorariosProps {
  docentes: Docente[]
  docenteMateriaAsignaciones: DocenteMateriaAsignacion[]
  materias: Materia[]
  cursos: Curso[]
  modulos: Modulo[]
  initialBloques: BloqueHorario[]
  onBack: () => void
  onBloquesSaved?: () => void | Promise<void>
}

// ---- Draggable Cell Content ----
function DraggableBloque({
  bloque,
  materia,
  onRemove,
  allDocentes,
  docenteMateriaAsignaciones,
}: {
  bloque: BloqueHorario
  materia: Materia | undefined
  onRemove: () => void
  allDocentes: Docente[]
  docenteMateriaAsignaciones: DocenteMateriaAsignacion[]
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: bloque.id,
    data: bloque,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  // Build the full list of docentes with their condicion from the bloque
  const docenteEntries: { docente: Docente; condicion: "titular" | "suplente" | "provisional" }[] = []
  if (bloque.docentes && bloque.docentes.length > 0) {
    for (const da of bloque.docentes) {
      const d = allDocentes.find((doc) => doc.id === da.docenteId)
      if (d) docenteEntries.push({ docente: d, condicion: da.condicion })
    }
  } else if (bloque.docenteId) {
    // Legacy fallback: single docenteId
    const d = allDocentes.find((doc) => doc.id === bloque.docenteId)
    if (d) {
      const cond = bloque.condicion || getDocenteCondicion(bloque.docenteId, bloque.materiaId, docenteMateriaAsignaciones) || "titular"
      docenteEntries.push({ docente: d, condicion: cond })
    }
  }

  // Condicion color mapping for the left border
  const BORDER_COLORS: Record<string, string> = {
    titular: "#3b82f6",    // blue
    suplente: "#22c55e",   // green
    provisional: "#ef4444", // red
  }

  const TEXT_COLORS: Record<string, string> = {
    titular: "#1e40af",    // blue-800
    suplente: "#166534",   // green-800
    provisional: "#991b1b", // red-800
  }

  const BG_COLORS: Record<string, string> = {
    titular: "#dbeafe",    // blue-100
    suplente: "#dcfce7",   // green-100
    provisional: "#fee2e2", // red-100
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group rounded-lg border bg-white shadow-sm p-2 cursor-grab active:cursor-grabbing text-left w-full h-full"
    >
      {/* Materia nombre con tipo */}
      <div className="flex items-baseline gap-1">
        <p className="font-semibold text-xs leading-tight text-foreground truncate flex-1">
          {materia?.nombre ?? "---"}
        </p>
        {materia?.tieneSubgrupos && (
          <span className="text-xs font-medium px-1 py-0.5 rounded-sm" style={{ background: "#FFF3CD", color: "#856404" }}>
            Taller
          </span>
        )}
        {!materia?.tieneSubgrupos && materia && (
          <span className="text-xs font-medium px-1 py-0.5 rounded-sm" style={{ background: "#D1ECF1", color: "#0C5460" }}>
            {"Teor\u00eda"}
          </span>
        )}
      </div>

      {/* Docentes list with colored badges */}
      <div className="mt-1 flex flex-col gap-0.5">
        {docenteEntries.map(({ docente, condicion }, i) => (
          <div
            key={docente.id + i}
            className="flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium"
            style={{
              borderLeft: `3px solid ${BORDER_COLORS[condicion]}`,
              backgroundColor: BG_COLORS[condicion],
              color: TEXT_COLORS[condicion],
            }}
          >
            <span className="truncate">{docente.apellido}, {docente.nombre?.[0] ?? ""}.</span>
            <span className="ml-auto text-[10px] opacity-70 shrink-0">
              {condicion === "titular" ? "Tit" : condicion === "suplente" ? "Sup" : "Prov"}
            </span>
          </div>
        ))}
        {docenteEntries.length === 0 && (
          <p className="text-xs text-muted-foreground">---</p>
        )}
      </div>

      {/* Grupo */}
      {bloque.grupo && (
        <span className="mt-1 inline-block text-xs font-bold" style={{ color: "#0B6B2E" }}>
          Grupo {bloque.grupo}
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
  onBloquesSaved,
}: EditorHorariosProps) {
  const [selectedCursoId, setSelectedCursoId] = useState(cursos[0]?.id ?? "")
  const [bloques, setBloques] = useState<BloqueHorario[]>(Array.isArray(initialBloques) ? initialBloques : [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCell, setEditingCell] = useState<{ diaIndex: number; moduloId: string } | null>(null)
  const [formMateria, setFormMateria] = useState("")
  const [formTitular, setFormTitular] = useState("") // Profesor principal
  const [formTitularCondicion, setFormTitularCondicion] = useState<"titular" | "provisional">("titular")
  const [formSuplentes, setFormSuplentes] = useState<string[]>(["", ""]) // Up to 2 suplentes
  const [formGrupo, setFormGrupo] = useState<"A" | "B" | "">("")
  const [dragConflict, setDragConflict] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeDragBloque, setActiveDragBloque] = useState<BloqueHorario | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  /** Compare moduloIds tolerating whitespace differences and prefix-only matches
   *  that could come from legacy data in Drive. */
  const moduloIdsMatch = useCallback((a: string, b: string) => {
    if (a === b) return true
    const na = String(a).trim()
    const nb = String(b).trim()
    if (na === nb) return true
    // If one is a bare id like "mod2" and the other is "mod2 Extra Text", match on the first token only when it looks like a structured id (starts with "mod")
    const ta = na.split(/\s+/)[0]
    const tb = nb.split(/\s+/)[0]
    if (ta === tb && /^mod/i.test(ta)) return true
    return false
  }, [])

  /** Returns ALL bloques for a cell (may be 2 for taller Grupo A + Grupo B) */
  const getBloquesForCell = useCallback(
    (diaIndex: number, moduloId: string): BloqueHorario[] => {
      const cursoStr = String(selectedCursoId)
      return bloques.filter(
        (b) =>
          String(b.cursoId) === cursoStr &&
          b.diaIndex === diaIndex &&
          moduloIdsMatch(b.moduloId, moduloId)
      )
    },
    [bloques, selectedCursoId, moduloIdsMatch]
  )

  /** Backwards-compatible helper: returns the first bloque (or the one without grupo / matching grupo) */
  const getBloque = useCallback(
    (diaIndex: number, moduloId: string): BloqueHorario | null => {
      const all = getBloquesForCell(diaIndex, moduloId)
      return all[0] ?? null
    },
    [getBloquesForCell]
  )

  function hasConflict(docenteId: string, diaIndex: number, moduloId: string, excludeId?: string) {
    return bloques.some(
      (b) =>
        b.id !== excludeId &&
        b.docenteId === docenteId &&
        b.diaIndex === diaIndex &&
        moduloIdsMatch(b.moduloId, moduloId)
    )
  }

  function openDialog(diaIndex: number, moduloId: string, preselectedGrupo?: "A" | "B" | "") {
    const cellBloques = getBloquesForCell(diaIndex, moduloId)
    setEditingCell({ diaIndex, moduloId })

    // If a grupo was preselected (e.g. clicking "Grupo A" in a taller cell), load that bloque
    const targetGrupo = preselectedGrupo ?? ""
    const existing = targetGrupo
      ? cellBloques.find(b => b.grupo === targetGrupo) ?? null
      : cellBloques[0] ?? null

    setFormMateria(existing?.materiaId ?? "")
    
    // Load existing docentes
    const docentesList = existing?.docentes || []
    const titularEntry = docentesList.find(d => d.condicion === "titular" || d.condicion === "provisional")
    const titular = titularEntry?.docenteId ?? existing?.docenteId ?? ""
    const titularCond = titularEntry?.condicion === "provisional" ? "provisional" : "titular"
    const suplentes = docentesList.filter(d => d.condicion === "suplente").map(d => d.docenteId)
    
    setFormTitular(titular)
    setFormTitularCondicion(titularCond)
    setFormSuplentes([suplentes[0] ?? "", suplentes[1] ?? ""])
    setFormGrupo(targetGrupo || existing?.grupo || "")
    setDragConflict("")
    setDialogOpen(true)
  }

  function handleSaveCell() {
    if (!editingCell || !formMateria || !formTitular) return
    const materia = materias.find((m) => m.id === formMateria)
    if (materia?.tieneSubgrupos && !formGrupo) return
    let { diaIndex, moduloId } = editingCell
    moduloId = moduloId.trim()
    const isTaller = materia?.tieneSubgrupos && formGrupo
    const grupoValue = isTaller ? (formGrupo as "A" | "B") : null

    // Find existing bloque for this specific grupo (or any bloque in cell if not taller)
    const cellBloques = getBloquesForCell(diaIndex, moduloId)
    const existing = isTaller
      ? cellBloques.find(b => b.grupo === grupoValue) ?? null
      : cellBloques[0] ?? null

    if (hasConflict(formTitular, diaIndex, moduloId, existing?.id)) {
      setDragConflict("El profesor titular ya tiene asignada otra clase en este modulo y dia.")
      return
    }

    // Build docentes array (1 titular/provisional + up to 2 suplentes)
    const docentesList: DocenteAsignacion[] = [
      { docenteId: formTitular, condicion: formTitularCondicion }
    ]
    formSuplentes.forEach(id => {
      if (id) docentesList.push({ docenteId: id, condicion: "suplente" })
    })

    const newBloque: BloqueHorario = {
      id: existing?.id ?? `b${Date.now()}`,
      cursoId: selectedCursoId,
      diaIndex,
      moduloId,
      materiaId: formMateria,
      docenteId: formTitular,
      docentes: docentesList,
      grupo: grupoValue,
    }

    setBloques((prev) => {
      // Only remove the bloque being replaced (same id), keep other grupo bloques
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
      // Send ALL bloques for the selected course so the backend replaces the full
      // week at once and does not lose data from days other than Monday.
      const bloquesToSave = bloques.filter(
        (b) => String(b.cursoId) === String(selectedCursoId)
      )
      const result = await saveBloquesForDay(selectedCursoId, 0, bloquesToSave)
      if (result) {
        setSaved(true)
        if (onBloquesSaved) await onBloquesSaved()
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
    } finally {
      setSaving(false)
    }
  }

  const selectedMateria = materias.find((m) => m.id === formMateria)
  // Show all teachers sorted alphabetically - condition varies by course, not by subject
  const filteredDocentes = [...docentes].sort((a, b) => (a.apellido ?? '').localeCompare(b.apellido ?? '', 'es') || (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'))



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
              {modulos
                .sort((a, b) => formatHora(a.horaInicio).localeCompare(formatHora(b.horaInicio)))
                .map((modulo, rowIdx) => {
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
                            {formatHora(modulo.horaInicio)} – {formatHora(modulo.horaFin)}
                          </span>
                        </span>
                      ) : (
                        <div>
                          <span className="font-bold text-xs text-foreground">
                            Mód. {modulo.numero}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {formatHora(modulo.horaInicio)} – {formatHora(modulo.horaFin)}
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
                      const cellBloques = getBloquesForCell(diaIndex, modulo.id)
                      const grupoA = cellBloques.find(b => b.grupo === "A")
                      const grupoB = cellBloques.find(b => b.grupo === "B")
                      const hasTallerGroups = grupoA || grupoB

                      return (
                        <DroppableCell
                          key={diaIndex}
                          cellId={cellId}
                          isRecreo={isRecreo}
                          onClick={() => !isRecreo && !hasTallerGroups && openDialog(diaIndex, modulo.id)}
                        >
                          {hasTallerGroups ? (
                            /* Taller: show Grupo A and Grupo B side by side */
                            <div className="flex flex-col gap-1 w-full h-full">
                              {(["A", "B"] as const).map((grupo) => {
                                const bloque = grupo === "A" ? grupoA : grupoB
                                const materia = bloque ? materias.find(m => m.id === bloque.materiaId) : undefined
                                return bloque ? (
                                  <div
                                    key={grupo}
                                    className="relative group cursor-pointer"
                                    onClick={() => openDialog(diaIndex, modulo.id, grupo)}
                                  >
                                    <div
                                      className="rounded border p-1.5 text-left"
                                      style={{
                                        borderLeftWidth: "3px",
                                        borderLeftColor: grupo === "A" ? "#f59e0b" : "#8b5cf6",
                                        backgroundColor: grupo === "A" ? "#fffbeb" : "#f5f3ff",
                                      }}
                                    >
                                      <div className="flex items-center gap-1">
                                        <span
                                          className="text-[10px] font-bold px-1 rounded"
                                          style={{
                                            backgroundColor: grupo === "A" ? "#fde68a" : "#ddd6fe",
                                            color: grupo === "A" ? "#92400e" : "#5b21b6",
                                          }}
                                        >
                                          {grupo}
                                        </span>
                                        <span className="text-xs font-semibold truncate">{materia?.nombre ?? "---"}</span>
                                      </div>
                                      {/* Show docentes */}
                                      {bloque.docentes?.map((da, i) => {
                                        const d = docentes.find(doc => doc.id === da.docenteId)
                                        return d ? (
                                          <p key={d.id + i} className="text-[10px] leading-tight mt-0.5 truncate" style={{
                                            color: da.condicion === "titular" ? "#1e40af" : da.condicion === "suplente" ? "#166534" : "#991b1b"
                                          }}>
                                            {d.apellido}, {d.nombre?.[0]}.
                                          </p>
                                        ) : null
                                      })}
                                    </div>
                                    <button
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => { e.stopPropagation(); handleRemoveBloque(bloque.id) }}
                                      className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-red-50 hover:bg-red-100 p-0.5"
                                    >
                                      <X className="h-2.5 w-2.5 text-red-500" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    key={grupo}
                                    className="rounded border-2 border-dashed flex items-center justify-center p-1 cursor-pointer hover:border-primary/40 transition-colors"
                                    style={{ borderColor: grupo === "A" ? "#fde68a" : "#ddd6fe" }}
                                    onClick={() => openDialog(diaIndex, modulo.id, grupo)}
                                  >
                                    <span className="text-[10px] text-muted-foreground">+ Grupo {grupo}</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : cellBloques[0] ? (
                            <DraggableBloque
                              bloque={cellBloques[0]}
                              materia={materias.find(m => m.id === cellBloques[0].materiaId)}
                              allDocentes={docentes}
                              docenteMateriaAsignaciones={docenteMateriaAsignaciones}
                              onRemove={() => handleRemoveBloque(cellBloques[0].id)}
                            />
                          ) : null}
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
  ? `${DIAS[editingCell.diaIndex]} – ${formatHora(modulos.find((m) => m.id === editingCell.moduloId)?.horaInicio ?? '')}`
  : "Asignar clase"}
  </DialogTitle>
  <DialogDescription>
  Selecciona la materia y docentes para asignar a este módulo. Puedes designar un profesor titular y hasta 2 suplentes.
  </DialogDescription>
  </DialogHeader>
  
  <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Materia</Label>
              <Select
                value={formMateria}
                onValueChange={(v) => { setFormMateria(v); setFormTitular(""); setFormTitularCondicion("titular"); setFormSuplentes(["", ""]); setFormGrupo("") }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {[...materias].sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold" style={{ color: formTitularCondicion === "provisional" ? "#991b1b" : "#1e40af" }}>
                {formTitularCondicion === "provisional" ? "Profesor Provisional *" : "Profesor Titular *"}
              </Label>
              <Select value={formTitular} onValueChange={setFormTitular} disabled={!formMateria}>
                <SelectTrigger style={{ borderColor: formTitularCondicion === "provisional" ? "#fca5a5" : "#93c5fd" }}>
                  <SelectValue placeholder="Seleccionar profesor" />
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
              <div className="flex items-center gap-2 mt-1">
                <Label className="text-xs text-muted-foreground shrink-0">{"Condici\u00f3n:"}</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setFormTitularCondicion("titular")}
                    className="text-xs font-medium px-2 py-1 rounded border transition-colors"
                    style={formTitularCondicion === "titular"
                      ? { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#93c5fd" }
                      : { backgroundColor: "transparent", color: "#6b7280", borderColor: "#d1d5db" }
                    }
                  >
                    Titular
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTitularCondicion("provisional")}
                    className="text-xs font-medium px-2 py-1 rounded border transition-colors"
                    style={formTitularCondicion === "provisional"
                      ? { backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" }
                      : { backgroundColor: "transparent", color: "#6b7280", borderColor: "#d1d5db" }
                    }
                  >
                    Provisional
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t pt-2">
              <Label className="text-sm text-muted-foreground">Profesores Suplentes (opcional, máximo 2)</Label>
              {[0, 1].map((index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Label className="text-xs">Suplente {index + 1}</Label>
                  <Select 
                    value={formSuplentes[index] || "-"} 
                    onValueChange={(v) => {
                      const newSuplentes = [...formSuplentes]
                      newSuplentes[index] = v === "-" ? "" : v
                      setFormSuplentes(newSuplentes)
                    }} 
                    disabled={!formMateria || !formTitular}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin suplente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">Sin suplente</SelectItem>
                      {filteredDocentes.filter(d => d.id !== formTitular && !formSuplentes.filter(s => s !== "").includes(d.id)).map((d) => {
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
              ))}
            </div>

            {selectedMateria?.tieneSubgrupos && (
              <div className="flex flex-col gap-1.5 border rounded-lg p-3" style={{ borderColor: "#f59e0b", backgroundColor: "#fffbeb" }}>
                <Label className="font-semibold" style={{ color: "#92400e" }}>Grupo (Taller) *</Label>
                <div className="flex gap-2">
                  {(["A", "B"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormGrupo(g)}
                      className="flex-1 text-sm font-bold py-2 rounded border-2 transition-colors"
                      style={formGrupo === g
                        ? { backgroundColor: g === "A" ? "#fde68a" : "#ddd6fe", borderColor: g === "A" ? "#f59e0b" : "#8b5cf6", color: g === "A" ? "#92400e" : "#5b21b6" }
                        : { backgroundColor: "white", borderColor: "#d1d5db", color: "#6b7280" }
                      }
                    >
                      Grupo {g}
                    </button>
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#92400e" }}>
                  Los talleres requieren asignar Grupo A y Grupo B por separado, cada uno con su docente.
                </p>
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
              disabled={!formMateria || !formTitular || (selectedMateria?.tieneSubgrupos && !formGrupo)}
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
