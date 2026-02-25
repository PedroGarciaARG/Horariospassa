import type { Docente, DocenteMateriaAsignacion, Materia, Curso, Modulo, BloqueHorario } from "@/types"

// Get Google Script URL from window.__googleScriptUrl or localStorage
function getGoogleScriptUrl() {
  // Primero intenta desde window (que se setea en el hook)
  if (typeof window !== 'undefined') {
    const fromWindow = (window as any).__googleScriptUrl
    if (fromWindow) {
      console.log('[v0] Using Google Script URL from window:', fromWindow)
      return fromWindow
    }
    
    // Si no, intenta directamente desde localStorage
    const saved = localStorage.getItem('googleScriptUrl')
    if (saved) {
      console.log('[v0] Using Google Script URL from localStorage:', saved)
      return saved
    }
  }
  
  // Por último, env var
  const envUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL
  if (envUrl) {
    console.log('[v0] Using Google Script URL from env')
    return envUrl
  }
  
  console.log('[v0] No Google Script URL configured, will use mock data')
  return ""
}

// ---- Mock data for development / when no Google Script URL is set ----

export const MOCK_MODULOS: Modulo[] = [
  { id: "m1", numero: 1, horaInicio: "07:30", horaFin: "08:15", tipo: "clase" },
  { id: "m2", numero: 2, horaInicio: "08:15", horaFin: "09:00", tipo: "clase" },
  { id: "m3", numero: 3, horaInicio: "09:00", horaFin: "09:45", tipo: "teoria" },
  { id: "recreo1", numero: 0, horaInicio: "09:45", horaFin: "10:00", tipo: "recreo", etiqueta: "Recreo" },
  { id: "m4", numero: 4, horaInicio: "10:00", horaFin: "10:45", tipo: "taller" },
  { id: "m5", numero: 5, horaInicio: "10:45", horaFin: "11:30", tipo: "clase" },
  { id: "m6", numero: 6, horaInicio: "11:30", horaFin: "12:15", tipo: "teoria" },
  { id: "recreo2", numero: 0, horaInicio: "12:15", horaFin: "12:30", tipo: "recreo", etiqueta: "Recreo" },
  { id: "m7", numero: 7, horaInicio: "12:30", horaFin: "13:15", tipo: "taller" },
  { id: "m8", numero: 8, horaInicio: "13:15", horaFin: "14:00", tipo: "clase" },
]

export const MOCK_MATERIAS: Materia[] = [
  { id: "mat1", nombre: "Matemática", docenteIds: ["d1", "d2"] },
  { id: "mat2", nombre: "Lengua y Literatura", docenteIds: ["d3"] },
  { id: "mat3", nombre: "Física", docenteIds: ["d1", "d4"] },
  { id: "mat4", nombre: "Química", docenteIds: ["d4"] },
  { id: "mat5", nombre: "Historia", docenteIds: ["d5"] },
  { id: "mat6", nombre: "Inglés", docenteIds: ["d6"] },
  { id: "mat7", nombre: "Ed. Física", docenteIds: ["d7"] },
  { id: "mat8", nombre: "Tecnología", docenteIds: ["d2", "d8"], tieneSubgrupos: true },
  { id: "mat9", nombre: "Informática", docenteIds: ["d8"], tieneSubgrupos: true },
  { id: "mat10", nombre: "Dibujo Técnico", docenteIds: ["d9"] },
]

export const MOCK_DOCENTES: Docente[] = [
  { id: "d1", nombre: "Carlos", apellido: "García" },
  { id: "d2", nombre: "Laura", apellido: "Martínez" },
  { id: "d3", nombre: "Sofía", apellido: "López" },
  { id: "d4", nombre: "Marcos", apellido: "Rodríguez" },
  { id: "d5", nombre: "Ana", apellido: "Fernández" },
  { id: "d6", nombre: "Jorge", apellido: "Sánchez" },
  { id: "d7", nombre: "Patricia", apellido: "González" },
  { id: "d8", nombre: "Diego", apellido: "Pérez" },
  { id: "d9", nombre: "Valeria", apellido: "Torres" },
]

// Condiciones por docente-materia: un docente puede ser titular en una materia y suplente en otra
export const MOCK_DOCENTE_MATERIA_ASIGNACIONES: DocenteMateriaAsignacion[] = [
  { id: "dma1", docenteId: "d1", materiaId: "mat1", condicion: "titular" },
  { id: "dma2", docenteId: "d1", materiaId: "mat3", condicion: "suplente" }, // Carlos es suplente en Física
  { id: "dma3", docenteId: "d2", materiaId: "mat1", condicion: "suplente" },
  { id: "dma4", docenteId: "d2", materiaId: "mat8", condicion: "titular" },
  { id: "dma5", docenteId: "d3", materiaId: "mat2", condicion: "suplente" },
  { id: "dma6", docenteId: "d4", materiaId: "mat3", condicion: "titular" },
  { id: "dma7", docenteId: "d4", materiaId: "mat4", condicion: "provisional" }, // Marcos es provisional en Química
  { id: "dma8", docenteId: "d5", materiaId: "mat5", condicion: "provisional" },
  { id: "dma9", docenteId: "d6", materiaId: "mat6", condicion: "titular" },
  { id: "dma10", docenteId: "d7", materiaId: "mat7", condicion: "suplente" },
  { id: "dma11", docenteId: "d8", materiaId: "mat8", condicion: "titular" },
  { id: "dma12", docenteId: "d8", materiaId: "mat9", condicion: "suplente" }, // Diego es suplente en Informática
  { id: "dma13", docenteId: "d9", materiaId: "mat10", condicion: "provisional" },
]

export const MOCK_CURSOS: Curso[] = [
  { id: "c1", nombre: "1° 1°", division: "Primera" },
  { id: "c2", nombre: "1° 2°", division: "Segunda" },
  { id: "c3", nombre: "2° 1°", division: "Primera" },
  { id: "c4", nombre: "2° 2°", division: "Segunda" },
  { id: "c5", nombre: "3° 1°", division: "Primera" },
  { id: "c6", nombre: "3° 2°", division: "Segunda" },
  { id: "c7", nombre: "4° 1°", division: "Primera" },
  { id: "c8", nombre: "5° 1°", division: "Primera" },
  { id: "c9", nombre: "6° 1°", division: "Primera" },
]

// Initial mock schedule data
export const MOCK_BLOQUES: BloqueHorario[] = [
  { id: "b1", cursoId: "c1", diaIndex: 0, moduloId: "m1", materiaId: "mat1", docenteId: "d1" },
  { id: "b2", cursoId: "c1", diaIndex: 0, moduloId: "m2", materiaId: "mat2", docenteId: "d3" },
  { id: "b3", cursoId: "c1", diaIndex: 1, moduloId: "m1", materiaId: "mat3", docenteId: "d4" },
  { id: "b4", cursoId: "c1", diaIndex: 1, moduloId: "m2", materiaId: "mat4", docenteId: "d4" },
  { id: "b5", cursoId: "c1", diaIndex: 2, moduloId: "m1", materiaId: "mat5", docenteId: "d5" },
  { id: "b6", cursoId: "c1", diaIndex: 2, moduloId: "m4", materiaId: "mat6", docenteId: "d6" },
  { id: "b7", cursoId: "c1", diaIndex: 3, moduloId: "m1", materiaId: "mat7", docenteId: "d7" },
  { id: "b8", cursoId: "c1", diaIndex: 4, moduloId: "m1", materiaId: "mat8", docenteId: "d8", grupo: "A" },
  { id: "b9", cursoId: "c1", diaIndex: 4, moduloId: "m2", materiaId: "mat9", docenteId: "d8" },
]

// ---- API helpers ----

async function apiFetch(action: string, params: Record<string, unknown> = {}) {
  const url = getGoogleScriptUrl()
  if (!url) {
    console.log("[v0] No Google Script URL configured, using mock data")
    return null
  }
  
  const apiUrl = new URL(url)
  apiUrl.searchParams.set("action", action)
  Object.entries(params).forEach(([k, v]) => apiUrl.searchParams.set(k, String(v)))
  
  console.log("[v0] Fetching from Google Apps Script:", action, apiUrl.toString())
  
  try {
    const res = await fetch(apiUrl.toString())
    if (!res.ok) {
      console.log("[v0] API error:", res.status, res.statusText)
      return null
    }
    const data = await res.json()
    console.log("[v0] Received from", action, ":", data)
    return data
  } catch (err) {
    console.error("[v0] Fetch error:", err)
    return null
  }
}

async function apiPost(action: string, body: unknown) {
  const url = getGoogleScriptUrl()
  if (!url) {
    console.log("[v0] No Google Script URL configured")
    return null
  }
  
  console.log("[v0] POST to Google Apps Script:", action, body)
  
  try {
    // Google Apps Script requires form-urlencoded content type for CORS to work
    // Convert the body to form data
    const formData = new URLSearchParams()
    formData.append("action", action)
    formData.append("body", JSON.stringify(body))
    
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      console.log("[v0] API error:", res.status, res.statusText)
      return null
    }
    const data = await res.json()
    console.log("[v0] POST response:", data)
    return data
  } catch (err) {
    console.error("[v0] POST error:", err)
    return null
  }
}

export async function fetchModulos(): Promise<Modulo[]> {
  const data = await apiFetch("getModulos")
  return data ?? MOCK_MODULOS
}

export async function fetchMaterias(): Promise<Materia[]> {
  const data = await apiFetch("getMaterias")
  return data ?? MOCK_MATERIAS
}

export async function fetchDocentes(): Promise<Docente[]> {
  const data = await apiFetch("getDocentes")
  return data ?? MOCK_DOCENTES
}

export async function fetchDocenteMateriaAsignaciones(): Promise<DocenteMateriaAsignacion[]> {
  const data = await apiFetch("getDocenteMateriaAsignaciones")
  return data ?? MOCK_DOCENTE_MATERIA_ASIGNACIONES
}

export async function fetchCursos(): Promise<Curso[]> {
  const data = await apiFetch("getCursos")
  return data ?? MOCK_CURSOS
}

export async function fetchBloques(cursoId: string): Promise<BloqueHorario[]> {
  const data = await apiFetch("getBloques", { cursoId })
  return data ?? MOCK_BLOQUES.filter((b) => b.cursoId === cursoId)
}

export async function saveBloques(bloques: BloqueHorario[]): Promise<void> {
  await apiPost("saveBloques", { bloques })
}

export async function deleteBloque(bloqueId: string): Promise<void> {
  await apiPost("deleteBloque", { bloqueId })
}

// Helper to get condición for a docente-materia pair
export function getDocenteCondicion(
  docenteId: string,
  materiaId: string,
  asignaciones: DocenteMateriaAsignacion[]
): "titular" | "suplente" | "provisional" | undefined {
  return asignaciones.find(a => a.docenteId === docenteId && a.materiaId === materiaId)?.condicion
}

// ---- CRUD Operations ----

export async function createDocente(docente: Omit<Docente, 'id'>): Promise<Docente | null> {
  const id = `d_${Date.now()}`
  const newDocente = { ...docente, id }
  const result = await apiPost('createDocente', newDocente)
  return result ?? newDocente
}

export async function updateDocente(id: string, updates: Partial<Omit<Docente, 'id'>>): Promise<Docente | null> {
  const result = await apiPost('updateDocente', { id, ...updates })
  return result
}

export async function deleteDocente(id: string): Promise<boolean> {
  const result = await apiPost('deleteDocente', { id })
  return !!result
}

export async function createMateria(materia: Omit<Materia, 'id'>): Promise<Materia | null> {
  const id = `mat_${Date.now()}`
  const newMateria = { ...materia, id }
  const result = await apiPost('createMateria', newMateria)
  return result ?? newMateria
}

export async function updateMateria(id: string, updates: Partial<Omit<Materia, 'id'>>): Promise<Materia | null> {
  const result = await apiPost('updateMateria', { id, ...updates })
  return result
}

export async function deleteMateria(id: string): Promise<boolean> {
  const result = await apiPost('deleteMateria', { id })
  return !!result
}

export async function createModulo(modulo: Omit<Modulo, 'id'>): Promise<Modulo | null> {
  const id = `mod_${Date.now()}`
  const newModulo = { ...modulo, id }
  const result = await apiPost('createModulo', newModulo)
  return result ?? newModulo
}

export async function updateModulo(id: string, updates: Partial<Omit<Modulo, 'id'>>): Promise<Modulo | null> {
  const result = await apiPost('updateModulo', { id, ...updates })
  return result
}

export async function deleteModulo(id: string): Promise<boolean> {
  const result = await apiPost('deleteModulo', { id })
  return !!result
}

export async function createCurso(curso: Omit<Curso, 'id'>): Promise<Curso | null> {
  const id = `c_${Date.now()}`
  const newCurso = { ...curso, id }
  const result = await apiPost('createCurso', newCurso)
  return result ?? newCurso
}

export async function updateCurso(id: string, updates: Partial<Omit<Curso, 'id'>>): Promise<Curso | null> {
  const result = await apiPost('updateCurso', { id, ...updates })
  return result
}

export async function deleteCurso(id: string): Promise<boolean> {
  const result = await apiPost('deleteCurso', { id })
  return !!result
}

export async function createDocenteMateriaAsignacion(
  asignacion: Omit<DocenteMateriaAsignacion, 'id'>
): Promise<DocenteMateriaAsignacion | null> {
  const id = `dma_${Date.now()}`
  const newAsignacion = { ...asignacion, id }
  const result = await apiPost('createDocenteMateriaAsignacion', newAsignacion)
  return result ?? newAsignacion
}

export async function updateDocenteMateriaAsignacion(
  id: string,
  updates: Partial<Omit<DocenteMateriaAsignacion, 'id'>>
): Promise<DocenteMateriaAsignacion | null> {
  const result = await apiPost('updateDocenteMateriaAsignacion', { id, ...updates })
  return result
}

export async function deleteDocenteMateriaAsignacion(id: string): Promise<boolean> {
  const result = await apiPost('deleteDocenteMateriaAsignacion', { id })
  return !!result
}
