"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatHora } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Docente, Materia, Curso, Modulo, BloqueHorario } from "@/types"
import { DIAS } from "@/types"

interface VistaImprimibleProps {
  docentes: Docente[]
  materias: Materia[]
  cursos: Curso[]
  modulos: Modulo[]
  bloques: BloqueHorario[]
  onBack: () => void
}

export function VistaImprimible({
  docentes,
  materias,
  cursos,
  modulos,
  bloques,
  onBack,
}: VistaImprimibleProps) {
  const [selectedCursoId, setSelectedCursoId] = useState(cursos[0]?.id ?? "")
  const selectedCurso = cursos.find((c) => c.id === selectedCursoId)

  function getBloquesForCell(diaIndex: number, moduloId: string) {
    return bloques.filter(
      (b) => b.cursoId === selectedCursoId && b.diaIndex === diaIndex && b.moduloId === moduloId
    )
  }
  function getBloque(diaIndex: number, moduloId: string) {
    return getBloquesForCell(diaIndex, moduloId)[0] ?? null
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Controls - hidden on print */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="h-5 w-px bg-border" />
          <h2 className="font-serif text-2xl font-bold">Vista Imprimible</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => window.print()}
            className="gap-2 h-9"
            style={{ background: "#0B6B2E", color: "#fff" }}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Printable area */}
      <div
        id="print-area"
        className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
        style={{ fontFamily: "serif" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-4 border-b-2"
          style={{ borderColor: "#D4AF37" }}>
          <Image
            src="/logo.png"
            alt="Escudo E.E.S.T. N° 6"
            width={72}
            height={72}
            className="object-contain"
            loading="eager"
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: "#0B6B2E" }}>
              E.E.S.T. N° 6 – Banfield
            </h1>
            <p className="text-sm font-medium text-gray-600">
              Sistema de Horarios Oficiales
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: "#D4AF37" }} />
              <span className="text-base font-bold" style={{ color: "#0B6B2E" }}>
                Horario – Curso {selectedCurso?.nombre}
              </span>
              <div className="h-px flex-1" style={{ background: "#D4AF37" }} />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto px-4 py-4">
          <table className="w-full border-collapse text-sm" style={{ borderColor: "#D4AF37" }}>
            <thead>
              <tr style={{ background: "#0B6B2E" }}>
                <th className="border border-gray-300 px-3 py-2 text-white font-semibold text-xs text-left w-28">
                  Módulo
                </th>
                {DIAS.map((dia, i) => (
                  <th key={i} className="border border-gray-300 px-3 py-2 text-white font-semibold text-xs text-center">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulos.map((modulo) => {
                const isRecreo = modulo.tipo === "recreo"
                return (
                  <tr key={modulo.id}
                    style={isRecreo ? { background: "#FBF3D5" } : {}}>
                    <td className="border border-gray-200 px-3 py-2">
                      {isRecreo ? (
                        <span className="font-semibold text-xs" style={{ color: "#8B6914" }}>
                          {modulo.etiqueta ?? "Recreo"}
                          <span className="block font-normal text-gray-500">
                            {formatHora(modulo.horaInicio)} – {formatHora(modulo.horaFin)}
                          </span>
                        </span>
                      ) : (
                        <div>
                          <span className="font-bold text-xs">Mód. {modulo.numero}</span>
                          <span className="block text-xs text-gray-500">
                            {formatHora(modulo.horaInicio)} – {formatHora(modulo.horaFin)}
                          </span>
                        </div>
                      )}
                    </td>
                    {DIAS.map((_, diaIndex) => {
                      if (isRecreo) {
                        return (
                          <td key={diaIndex} className="border border-gray-200 px-2 py-1 text-center">
                            <span className="text-xs" style={{ color: "#D4AF37" }}>—</span>
                          </td>
                        )
                      }
                      const cellBloques = getBloquesForCell(diaIndex, modulo.id)
                      const printColors: Record<string, string> = { titular: "#1e40af", titular_interino: "#92400e", suplente: "#166534", provisional: "#991b1b" }
                      const printLabels: Record<string, string> = { titular: "T", titular_interino: "T.I", suplente: "S", provisional: "P" }

                      function renderBloqueContent(bloque: typeof cellBloques[0]) {
                        const mat = materias.find(m => m.id === bloque.materiaId)
                        const entries: { docente: typeof docentes[0]; condicion: string }[] = []
                        if (bloque.docentes && bloque.docentes.length > 0) {
                          for (const da of bloque.docentes) {
                            const d = docentes.find(doc => doc.id === da.docenteId)
                            if (d) entries.push({ docente: d, condicion: da.condicion })
                          }
                        } else if (bloque.docenteId) {
                          const d = docentes.find(doc => doc.id === bloque.docenteId)
                          if (d) entries.push({ docente: d, condicion: bloque.condicion || "titular" })
                        }
                        return (
                          <div>
                            <p className="font-semibold text-xs leading-tight">
                              {mat?.nombre ?? "---"}
                              {bloque.grupo && <span className="ml-1 font-bold" style={{ color: bloque.grupo === "A" ? "#92400e" : "#5b21b6" }}>(Gr. {bloque.grupo})</span>}
                            </p>
                            {entries.map(({ docente: d, condicion }, i) => (
                              <p key={d.id + i} className="text-xs leading-tight mt-0.5 font-medium" style={{ color: printColors[condicion] || "#374151" }}>
                                {`${d.apellido}, ${d.nombre?.[0] ?? ""}.`}
                                <span className="ml-1 text-[10px] opacity-70">({printLabels[condicion] || condicion})</span>
                              </p>
                            ))}
                          </div>
                        )
                      }

                      return (
                        <td key={diaIndex} className="border border-gray-200 px-2 py-1.5 align-top min-w-[110px]">
                          {cellBloques.length > 1 ? (
                            <div className="flex flex-col gap-1 divide-y divide-gray-200">
                              {cellBloques.map(b => <div key={b.id}>{renderBloqueContent(b)}</div>)}
                            </div>
                          ) : cellBloques.length === 1 ? (
                            renderBloqueContent(cellBloques[0])
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Dirección General de Cultura y Educación – Prov. de Buenos Aires</span>
          <span>Año {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
