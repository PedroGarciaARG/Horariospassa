"use client"

import { useMemo } from "react"
import { ChevronLeft } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts"
import { Button } from "@/components/ui/button"
import type { Docente, Materia, Curso, BloqueHorario } from "@/types"

interface EstadisticasProps {
  docentes: Docente[]
  materias: Materia[]
  cursos: Curso[]
  bloques: BloqueHorario[]
  onBack: () => void
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="h-4 w-1 rounded-full" style={{ background: "#D4AF37" }} />
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function Estadisticas({ docentes, materias, cursos, bloques, onBack }: EstadisticasProps) {
  const horasPorDocente = useMemo(() => {
    const map: Record<string, number> = {}
    bloques.forEach((b) => { map[b.docenteId] = (map[b.docenteId] ?? 0) + 1 })
    return docentes
      .map((d) => ({ nombre: d.apellido, horas: map[d.id] ?? 0 }))
      .filter((d) => d.horas > 0)
      .sort((a, b) => b.horas - a.horas)
  }, [bloques, docentes])

  const horasPorCurso = useMemo(() => {
    const map: Record<string, number> = {}
    bloques.forEach((b) => { map[b.cursoId] = (map[b.cursoId] ?? 0) + 1 })
    return cursos
      .map((c) => ({ nombre: c.nombre, horas: map[c.id] ?? 0 }))
      .filter((c) => c.horas > 0)
      .sort((a, b) => b.horas - a.horas)
  }, [bloques, cursos])

  const horasPorMateria = useMemo(() => {
    const map: Record<string, number> = {}
    bloques.forEach((b) => { map[b.materiaId] = (map[b.materiaId] ?? 0) + 1 })
    return materias
      .map((m) => ({ nombre: m.nombre, horas: map[m.id] ?? 0 }))
      .filter((m) => m.horas > 0)
      .sort((a, b) => b.horas - a.horas)
  }, [bloques, materias])

  const totalBloques = bloques.length
  const primaryColor = "#0B6B2E"
  const goldColor = "#D4AF37"

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Button>
        <div className="h-5 w-px bg-border" />
        <h2 className="font-serif text-2xl font-bold">Estadísticas</h2>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total módulos asignados", value: totalBloques, color: primaryColor },
          { label: "Docentes activos", value: horasPorDocente.length, color: primaryColor },
          { label: "Cursos con clases", value: horasPorCurso.length, color: goldColor },
          { label: "Materias en grilla", value: horasPorMateria.length, color: goldColor },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card shadow-sm p-4 flex flex-col gap-1">
            <span className="text-2xl font-bold font-serif" style={{ color: s.color }}>{s.value}</span>
            <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard title="Horas por Docente">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={horasPorDocente} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [`${v} horas`, "Horas"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                {horasPorDocente.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? primaryColor : "#0E8A3A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        <StatCard title="Horas por Curso">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={horasPorCurso} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [`${v} horas`, "Horas"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                {horasPorCurso.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? goldColor : "#B8942A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        <StatCard title="Horas por Materia">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              layout="vertical"
              data={horasPorMateria}
              margin={{ top: 4, right: 8, bottom: 4, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={(v) => [`${v} horas`, "Horas"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="horas" radius={[0, 4, 4, 0]}>
                {horasPorMateria.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? primaryColor : "#0E8A3A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Table breakdown */}
        <StatCard title="Detalle por Docente">
          <div className="overflow-auto max-h-60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-semibold text-muted-foreground">Docente</th>
                  <th className="text-right py-2 text-xs font-semibold text-muted-foreground">Horas</th>
                  <th className="text-right py-2 text-xs font-semibold text-muted-foreground">% del total</th>
                </tr>
              </thead>
              <tbody>
                {horasPorDocente.map((d) => (
                  <tr key={d.nombre} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 font-medium text-foreground">{d.nombre}</td>
                    <td className="py-1.5 text-right font-bold" style={{ color: primaryColor }}>
                      {d.horas}
                    </td>
                    <td className="py-1.5 text-right text-muted-foreground text-xs">
                      {totalBloques > 0 ? ((d.horas / totalBloques) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StatCard>
      </div>
    </div>
  )
}
