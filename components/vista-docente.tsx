"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Docente, DocenteMateriaAsignacion, Materia, Curso, Modulo, BloqueHorario } from "@/types"
import { DIAS, CONDICION_COLORS, CONDICION_LABELS } from "@/types"
import { getDocenteCondicion } from "@/lib/api"

interface VistaDocenteProps {
  docentes: Docente[]
  docenteMateriaAsignaciones: DocenteMateriaAsignacion[]
  materias: Materia[]
  cursos: Curso[]
  modulos: Modulo[]
  bloques: BloqueHorario[]
  onBack: () => void
}

export function VistaDocente({ 
  docentes, 
  docenteMateriaAsignaciones, 
  materias, 
  cursos, 
  modulos, 
  bloques, 
  onBack 
}: VistaDocenteProps) {
  const [selectedDocenteId, setSelectedDocenteId] = useState(docentes[0]?.id ?? "")

  const docenteBloques = useMemo(
    () => bloques.filter((b) => b.docenteId === selectedDocenteId),
    [bloques, selectedDocenteId]
  )

  const totalHoras = docenteBloques.length

  const horasPorMateria = useMemo(() => {
    const map: Record<string, number> = {}
    docenteBloques.forEach((b) => {
      map[b.materiaId] = (map[b.materiaId] ?? 0) + 1
    })
    return Object.entries(map).map(([materiaId, horas]) => ({
      materia: materias.find((m) => m.id === materiaId),
      horas,
    }))
  }, [docenteBloques, materias])

  const docente = docentes.find((d) => d.id === selectedDocenteId)

  function getBloque(diaIndex: number, moduloId: string) {
    return docenteBloques.find((b) => b.diaIndex === diaIndex && b.moduloId === moduloId) ?? null
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="h-5 w-px bg-border" />
          <h2 className="font-serif text-2xl font-bold">Vista por Docente</h2>
        </div>
        <div className="w-56">
          <Select value={selectedDocenteId} onValueChange={setSelectedDocenteId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Seleccionar docente" />
            </SelectTrigger>
            <SelectContent>
              {docentes.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.apellido}, {d.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {docente && (
        <>
          {/* Docente card */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col sm:flex-row sm:items-start gap-4">
            <div
              className="rounded-full w-14 h-14 flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ background: "#0B6B2E" }}
            >
              {docente.apellido[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-bold">
                {docente.apellido}, {docente.nombre}
              </h3>
              {/* Show condiciones for each materia */}
              <div className="flex flex-wrap gap-2 mt-2">
                {docenteMateriaAsignaciones
                  .filter(a => a.docenteId === docente.id)
                  .map(asig => {
                    const materia = materias.find(m => m.id === asig.materiaId)
                    return (
                      <div key={asig.id} className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground">{materia?.nombre}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${CONDICION_COLORS[asig.condicion]}`}>
                          {CONDICION_LABELS[asig.condicion]}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <Clock className="h-5 w-5" style={{ color: "#0B6B2E" }} />
                <span className="text-2xl font-bold font-serif" style={{ color: "#0B6B2E" }}>
                  {totalHoras}
                </span>
                <span className="text-xs text-muted-foreground">horas/semana</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <BookOpen className="h-5 w-5" style={{ color: "#D4AF37" }} />
                <span className="text-2xl font-bold font-serif" style={{ color: "#D4AF37" }}>
                  {horasPorMateria.length}
                </span>
                <span className="text-xs text-muted-foreground">materias</span>
              </div>
            </div>
          </div>

          {/* Hours breakdown */}
          {horasPorMateria.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-sm p-5">
              <h4 className="font-semibold text-sm mb-4 text-foreground">Distribución de horas por materia</h4>
              <div className="flex flex-col gap-3">
                {horasPorMateria.map(({ materia, horas }) => (
                  <div key={materia?.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-44 truncate text-foreground">
                      {materia?.nombre ?? "—"}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: `${(horas / totalHoras) * 100}%`,
                          background: "#0B6B2E",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right" style={{ color: "#0B6B2E" }}>
                      {horas}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly grid */}
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
                      <td className="px-4 py-2 border-r border-border">
                        {isRecreo ? (
                          <span className="font-semibold text-xs" style={{ color: "#8B6914" }}>
                            {modulo.etiqueta ?? "Recreo"}
                          </span>
                        ) : (
                          <div>
                            <span className="font-bold text-xs text-foreground">Mód. {modulo.numero}</span>
                            <span className="block text-xs text-muted-foreground">
                              {modulo.horaInicio} – {modulo.horaFin}
                            </span>
                          </div>
                        )}
                      </td>
                      {DIAS.map((_, diaIndex) => {
                        if (isRecreo) {
                          return (
                            <td key={diaIndex} className="border-r border-border last:border-r-0 text-center py-1">
                              <span className="text-xs" style={{ color: "#D4AF37" }}>—</span>
                            </td>
                          )
                        }
                        const bloque = getBloque(diaIndex, modulo.id)
                        const materia = materias.find((m) => m.id === bloque?.materiaId)
                        const curso = cursos.find((c) => c.id === bloque?.cursoId)
                        return (
                          <td
                            key={diaIndex}
                            className="border-r border-border last:border-r-0 p-1.5 align-top min-w-[120px]"
                          >
                            {bloque && materia ? (
                              <div className="rounded-lg border bg-white shadow-sm p-2">
                                <p className="font-semibold text-xs leading-tight text-foreground">
                                  {materia.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {curso?.nombre}
                                </p>
                                {bloque.grupo && (
                                  <span className="text-xs font-bold" style={{ color: "#0B6B2E" }}>
                                    Grupo {bloque.grupo}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="h-12 rounded-lg border border-dashed border-border/50" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
