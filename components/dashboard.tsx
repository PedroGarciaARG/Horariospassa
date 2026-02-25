"use client"

import { useState } from "react"
import {
  Users,
  BookOpen,
  GraduationCap,
  Clock,
  CalendarDays,
  BarChart3,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Docente, Materia, Curso, Modulo } from "@/types"

type View = "dashboard" | "editor" | "docente" | "estadisticas" | "excel" | "imprimible" | "docentes-manager" | "materias-manager" | "modulos-manager" | "cursos-manager"

interface DashboardProps {
  docentes: Docente[]
  materias: Materia[]
  cursos: Curso[]
  modulos: Modulo[]
  onNavigate: (view: View) => void
}

export function Dashboard({ docentes, materias, cursos, modulos, onNavigate }: DashboardProps) {
  const [testMessage, setTestMessage] = useState("")
  const modulosClase = modulos.filter((m) => m.tipo === "clase")

  const handleTestWrite = async () => {
    setTestMessage("Probando conexión...")
    try {
      const url = typeof window !== 'undefined' ? localStorage.getItem('googleScriptUrl') : null
      if (!url) {
        setTestMessage("Error: No hay URL de Google Apps Script configurada")
        return
      }

      console.log("[v0] TEST: Probando conexión a", url)
      // Usa GET para evitar problemas de CORS
      const response = await fetch(url + "?action=getDocentes")
      
      if (!response.ok) {
        setTestMessage(`Error HTTP ${response.status}. Verifica que el Google Apps Script esté deployado como Web app (anyone can access)`)
        return
      }

      const data = await response.json()
      console.log("[v0] TEST: Respuesta recibida:", data)

      if (Array.isArray(data)) {
        if (data.length > 0) {
          setTestMessage(`✓ Conexión OK. Se encontraron ${data.length} docentes en Google Sheet`)
        } else {
          setTestMessage(`✓ Conexión establecida pero la hoja 'Docentes' está vacía. Agrega datos al Google Sheet`)
        }
      } else if (data.error) {
        setTestMessage("Error en Google Apps Script: " + data.error)
      } else {
        setTestMessage("Respuesta inesperada del servidor. Verifica el Apps Script")
      }
    } catch (err: any) {
      console.error("[v0] TEST: Error de conexión:", err)
      setTestMessage(`No se puede conectar. Verifica: 1) URL correcta, 2) Apps Script deployado, 3) Datos en Google Sheet`)
    }
  }

  const stats = [
    {
      label: "Docentes",
      value: docentes.length,
      icon: Users,
      color: "#0B6B2E",
      bg: "#E8F5EC",
    },
    {
      label: "Materias",
      value: materias.length,
      icon: BookOpen,
      color: "#0E8A3A",
      bg: "#E8F5EC",
    },
    {
      label: "Cursos",
      value: cursos.length,
      icon: GraduationCap,
      color: "#0B6B2E",
      bg: "#E8F5EC",
    },
    {
      label: "Módulos por día",
      value: modulosClase.length,
      icon: Clock,
      color: "#8B6914",
      bg: "#FBF3D5",
    },
  ]

  const actions = [
    {
      id: "editor" as View,
      title: "Editor de Horarios",
      description: "Editar y asignar clases en la grilla semanal por curso",
      icon: CalendarDays,
      color: "#0B6B2E",
      featured: true,
    },
    {
      id: "docente" as View,
      title: "Vista por Docente",
      description: "Consultar el horario semanal individual de cada docente",
      icon: Users,
      color: "#0B6B2E",
      featured: false,
    },
    {
      id: "estadisticas" as View,
      title: "Estadísticas",
      description: "Horas totales por docente, curso y materia con gráficos",
      icon: BarChart3,
      color: "#0B6B2E",
      featured: false,
    },
    {
      id: "excel" as View,
      title: "Exportar a Excel",
      description: "Descargar planilla completa de horarios en formato .xlsx",
      icon: FileSpreadsheet,
      color: "#8B6914",
      featured: false,
    },
    {
      id: "imprimible" as View,
      title: "Vista Imprimible",
      description: "Generar hoja lista para imprimir con el horario oficial",
      icon: Printer,
      color: "#8B6914",
      featured: false,
    },
  ]

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full" style={{ background: "#D4AF37" }} />
          <h2 className="font-serif text-3xl font-bold text-foreground">Panel Principal</h2>
        </div>
        <p className="text-muted-foreground ml-4 text-sm">
          Gestión integral del sistema de horarios institucional
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card shadow-sm p-5 flex items-center gap-4"
            >
              <div
                className="rounded-lg p-3 flex-shrink-0"
                style={{ background: stat.bg }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-3xl font-bold font-serif" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Test connection */}
      {testMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">{testMessage}</p>
          </div>
        </div>
      )}

      <Button 
        onClick={handleTestWrite}
        className="w-full"
        variant="outline"
      >
        Probar conexión con Google Sheets
      </Button>

      {/* Administration Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-1 rounded-full" style={{ background: "#D4AF37" }} />
          <h3 className="font-serif text-lg font-bold text-foreground">Administración</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("docentes-manager" as any)}
            className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/50 transition"
          >
            <Users className="h-5 w-5 text-blue-600 mb-2" />
            <p className="font-medium text-foreground text-sm">Gestionar Docentes</p>
            <p className="text-xs text-muted-foreground">{docentes.length} docentes</p>
          </button>
          <button
            onClick={() => onNavigate("materias-manager" as any)}
            className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/50 transition"
          >
            <BookOpen className="h-5 w-5 text-green-600 mb-2" />
            <p className="font-medium text-foreground text-sm">Gestionar Materias</p>
            <p className="text-xs text-muted-foreground">{materias.length} materias</p>
          </button>
          <button
            onClick={() => onNavigate("cursos-manager" as any)}
            className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/50 transition"
          >
            <GraduationCap className="h-5 w-5 text-purple-600 mb-2" />
            <p className="font-medium text-foreground text-sm">Gestionar Cursos</p>
            <p className="text-xs text-muted-foreground">{cursos.length} cursos</p>
          </button>
          <button
            onClick={() => onNavigate("modulos-manager" as any)}
            className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/50 transition"
          >
            <Clock className="h-5 w-5 text-amber-600 mb-2" />
            <p className="font-medium text-foreground text-sm">Gestionar Módulos</p>
            <p className="text-xs text-muted-foreground">{modulos.length} módulos</p>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: "#D4AF37", opacity: 0.4 }} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Módulos del sistema
        </span>
        <div className="h-px flex-1" style={{ background: "#D4AF37", opacity: 0.4 }} />
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className={`group text-left rounded-xl border shadow-sm bg-card p-6 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                action.featured ? "md:col-span-2 lg:col-span-1" : ""
              }`}
              style={action.featured ? { borderColor: "#0B6B2E", borderWidth: "2px" } : {}}
            >
              <div className="flex items-start justify-between">
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: action.color === "#0B6B2E" ? "#E8F5EC" : "#FBF3D5",
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: action.color }} />
                </div>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">{action.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {action.description}
                </p>
              </div>
              {action.featured && (
                <span
                  className="self-start text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "#E8F5EC", color: "#0B6B2E" }}
                >
                  Acceso principal
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
