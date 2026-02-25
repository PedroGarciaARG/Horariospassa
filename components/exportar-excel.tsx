"use client"

import { useState } from "react"
import { ChevronLeft, FileSpreadsheet, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Docente, Materia, Curso, Modulo, BloqueHorario } from "@/types"
import { DIAS } from "@/types"

interface ExportarExcelProps {
  docentes: Docente[]
  materias: Materia[]
  cursos: Curso[]
  modulos: Modulo[]
  bloques: BloqueHorario[]
  onBack: () => void
}

export function ExportarExcel({ docentes, materias, cursos, modulos, bloques, onBack }: ExportarExcelProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()

      // Sheet per Curso
      cursos.forEach((curso) => {
        const claseMods = modulos.filter((m) => m.tipo === "clase")
        const header = ["Módulo", "Horario", ...DIAS]
        const rows = claseMods.map((mod) => {
          const row: (string | number)[] = [
            `Mód. ${mod.numero}`,
            `${mod.horaInicio} – ${mod.horaFin}`,
          ]
          DIAS.forEach((_, diaIndex) => {
            const bloque = bloques.find(
              (b) => b.cursoId === curso.id && b.diaIndex === diaIndex && b.moduloId === mod.id
            )
            if (bloque) {
              const materia = materias.find((m) => m.id === bloque.materiaId)
              const docente = docentes.find((d) => d.id === bloque.docenteId)
              const texto = `${materia?.nombre ?? "—"}\n${docente?.apellido ?? "—"}, ${docente?.nombre[0] ?? ""}${bloque.grupo ? `\nGrupo ${bloque.grupo}` : ""}`
              row.push(texto)
            } else {
              row.push("")
            }
          })
          return row
        })

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
        ws["!cols"] = [{ wch: 10 }, { wch: 14 }, ...DIAS.map(() => ({ wch: 22 }))]
        XLSX.utils.book_append_sheet(wb, ws, curso.nombre.replace(/°/g, ""))
      })

      // Sheet per Docente
      docentes.forEach((docente) => {
        const claseMods = modulos.filter((m) => m.tipo === "clase")
        const header = ["Módulo", "Horario", ...DIAS]
        const rows = claseMods.map((mod) => {
          const row: (string | number)[] = [
            `Mód. ${mod.numero}`,
            `${mod.horaInicio} – ${mod.horaFin}`,
          ]
          DIAS.forEach((_, diaIndex) => {
            const bloque = bloques.find(
              (b) => b.docenteId === docente.id && b.diaIndex === diaIndex && b.moduloId === mod.id
            )
            if (bloque) {
              const materia = materias.find((m) => m.id === bloque.materiaId)
              const curso = cursos.find((c) => c.id === bloque.cursoId)
              row.push(`${materia?.nombre ?? "—"}\n${curso?.nombre ?? "—"}`)
            } else {
              row.push("")
            }
          })
          return row
        })

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
        ws["!cols"] = [{ wch: 10 }, { wch: 14 }, ...DIAS.map(() => ({ wch: 20 }))]
        const sheetName = `${docente.apellido}`.slice(0, 31)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      })

      XLSX.writeFile(wb, "Horarios_EEST6.xlsx")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Button>
        <div className="h-5 w-px bg-border" />
        <h2 className="font-serif text-2xl font-bold">Exportar a Excel</h2>
      </div>

      <div className="max-w-lg flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-card shadow-sm p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#E8F5EC" }}>
            <FileSpreadsheet className="h-9 w-9" style={{ color: "#0B6B2E" }} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              Planilla de Horarios Completa
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Genera un archivo <strong>.xlsx</strong> con una hoja por cada curso y una hoja por
              cada docente, con los horarios completos formateados.
            </p>
          </div>
          <div className="w-full rounded-lg border border-border bg-muted/30 p-4 text-left flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              El archivo incluirá:
            </p>
            <ul className="text-sm text-muted-foreground flex flex-col gap-1">
              <li>• {cursos.length} hojas de cursos ({cursos.map((c) => c.nombre).join(", ")})</li>
              <li>• {docentes.length} hojas de docentes</li>
              <li>• Nombre del archivo: <code className="text-xs bg-muted px-1 rounded">Horarios_EEST6.xlsx</code></li>
            </ul>
          </div>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="w-full h-11 font-semibold gap-2 shadow-md"
            style={{ background: "#0B6B2E", color: "#fff" }}
          >
            <Download className="h-5 w-5" />
            {loading ? "Generando archivo..." : "Descargar Horarios_EEST6.xlsx"}
          </Button>
        </div>
      </div>
    </div>
  )
}
