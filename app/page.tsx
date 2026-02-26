"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useGoogleScriptUrl } from "@/hooks/use-google-script-url"
import { Login } from "@/components/login"
import { AppHeader } from "@/components/app-header"
import { Dashboard } from "@/components/dashboard"
import { EditorHorarios } from "@/components/editor-horarios"
import { VistaDocente } from "@/components/vista-docente"
import { Estadisticas } from "@/components/estadisticas"
import { ExportarExcel } from "@/components/exportar-excel"
import { VistaImprimible } from "@/components/vista-imprimible"
import {
  fetchDocentes,
  fetchMaterias,
  fetchCursos,
  fetchModulos,
  fetchAllBloques,
  fetchDocenteMateriaAsignaciones,
  MOCK_DOCENTES,
  MOCK_MATERIAS,
  MOCK_CURSOS,
  MOCK_MODULOS,
  MOCK_BLOQUES,
  MOCK_DOCENTE_MATERIA_ASIGNACIONES,
} from "@/lib/api"
import { GoogleScriptSetup } from "@/components/google-script-setup"
import { DocentesManager } from "@/components/docentes-manager"
import { MateriasManager } from "@/components/materias-manager"
import { ModulosManager } from "@/components/modulos-manager"
import { CursosManager } from "@/components/cursos-manager"
import type { Docente, DocenteMateriaAsignacion, Materia, Curso, Modulo, BloqueHorario } from "@/types"

type View = "dashboard" | "editor" | "docente" | "estadisticas" | "excel" | "imprimible" | "docentes-manager" | "materias-manager" | "modulos-manager" | "cursos-manager" | "config"

export default function Home() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()
  const urlReady = useGoogleScriptUrl() // Load Google Script URL from localStorage
  const [view, setView] = useState<View>("config")
  const [googleScriptConfigured, setGoogleScriptConfigured] = useState(false)

  // Data state
  const [docentes, setDocentes] = useState<Docente[]>(MOCK_DOCENTES)
  const [docenteMateriaAsignaciones, setDocenteMateriaAsignaciones] = useState<DocenteMateriaAsignacion[]>(
    MOCK_DOCENTE_MATERIA_ASIGNACIONES
  )
  const [materias, setMaterias] = useState<Materia[]>(MOCK_MATERIAS)
  const [cursos, setCursos] = useState<Curso[]>(MOCK_CURSOS)
  const [modulos, setModulos] = useState<Modulo[]>(MOCK_MODULOS)
  const [bloques, setBloques] = useState<BloqueHorario[]>(MOCK_BLOQUES)
  const [dataLoading, setDataLoading] = useState(false)

  // Function to refresh bloques from Google Drive
  const refreshBloques = async () => {
    console.log('[v0] Refreshing bloques from Google Drive...')
    try {
      const b = await fetchAllBloques()
      if (b && b.length > 0) {
        console.log('[v0] Bloques refreshed from Google Drive:', b)
        setBloques(b)
      }
    } catch (err) {
      console.error('[v0] Error refreshing bloques:', err)
    }
  }

  useEffect(() => {
    // Check if Google Script URL is configured
    if (typeof window !== 'undefined') {
      const url = localStorage.getItem('googleScriptUrl') || (window as any).__googleScriptUrl
      setGoogleScriptConfigured(!!url)
      if (url && view === 'config') {
        setView('dashboard')
      }
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !urlReady) return
    setDataLoading(true)
    console.log('[v0] Loading data from Google Apps Script...')
    Promise.all([
      fetchDocentes(),
      fetchDocenteMateriaAsignaciones(),
      fetchMaterias(),
      fetchCursos(),
      fetchModulos(),
      fetchAllBloques(),
    ])
      .then(([d, dma, m, c, mod, b]) => {
        console.log('[v0] Data loaded: docentes=', d?.length, 'bloques=', b?.length)
        if (d && d.length > 0) {
          console.log('[v0] Loaded data from Google Apps Script')
          setDocentes(d)
          setDocenteMateriaAsignaciones(dma || [])
          setMaterias(m || [])
          setCursos(c || [])
          setModulos(mod || [])
          setBloques(b || [])
        } else {
          console.log('[v0] No data from Google Apps Script, using mock data')
          setBloques(MOCK_BLOQUES)
        }
      })
      .catch((err) => {
        console.error('[v0] Error loading data:', err)
        // fallback to mock data already set
      })
      .finally(() => setDataLoading(false))
  }, [isAuthenticated, urlReady])

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B6B2E" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  const sharedProps = {
    docentes,
    docenteMateriaAsignaciones,
    materias,
    cursos,
    modulos,
    bloques,
    onBack: () => setView("dashboard"),
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader onLogout={() => { logout(); setView("dashboard") }} />

      <main className="flex-1 py-6 px-4">
        {view === "config" && (
          <div className="flex items-center justify-center min-h-screen">
            <GoogleScriptSetup
              currentUrl={typeof window !== 'undefined' ? localStorage.getItem('googleScriptUrl') || '' : ''}
              onUrlConfigured={(url) => {
                setGoogleScriptConfigured(true)
                setView('dashboard')
              }}
            />
          </div>
        )}

        {view !== "config" && (
          <>
            {dataLoading && view === "dashboard" && (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {view === "dashboard" && !dataLoading && (
              <Dashboard
                docentes={docentes}
                materias={materias}
                cursos={cursos}
                modulos={modulos}
                onNavigate={setView}
              />
            )}

            {view === "docentes-manager" && (
              <DocentesManager
                docentes={docentes}
                onDocentesChange={setDocentes}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === "materias-manager" && (
              <MateriasManager
                materias={materias}
                docentes={docentes}
                asignaciones={docenteMateriaAsignaciones}
                onMateriasChange={setMaterias}
                onAsignacionesChange={setDocenteMateriaAsignaciones}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === "modulos-manager" && (
              <ModulosManager
                modulos={modulos}
                onModulosChange={setModulos}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === "cursos-manager" && (
              <CursosManager
                cursos={cursos}
                onCursosChange={setCursos}
                onBack={() => setView('dashboard')}
              />
            )}

            {view === "editor" && (
              <EditorHorarios
                {...sharedProps}
                initialBloques={bloques}
                onBloquesSaved={refreshBloques}
              />
            )}

            {view === "docente" && (
              <VistaDocente {...sharedProps} />
            )}

            {view === "estadisticas" && (
              <Estadisticas {...sharedProps} />
            )}

            {view === "excel" && (
              <ExportarExcel {...sharedProps} />
            )}

            {view === "imprimible" && (
              <VistaImprimible {...sharedProps} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      {view === "dashboard" && (
        <footer className="no-print border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
          E.E.S.T. N° 6 – Banfield · Sistema de Gestión de Horarios · Dirección General de Cultura y Educación
        </footer>
      )}
    </div>
  )
}
