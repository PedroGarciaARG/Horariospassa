export type Condicion = "titular" | "titular_interino" | "suplente" | "provisional"

export interface DocenteAsignacion {
  docenteId: string
  condicion: Condicion
}

export interface Docente {
  id: string
  nombre: string
  apellido: string
  // Nota: la condición ahora se define en DocenteMateriaAsignacion, no aquí
}

export interface DocenteMateriaAsignacion {
  id: string
  docenteId: string
  materiaId: string
  condicion: Condicion
}

export interface Materia {
  id: string
  nombre: string
  tieneSubgrupos?: boolean
  docenteIds: string[] // ids de docentes (para referencia rápida)
}

export interface Curso {
  id: string
  nombre: string // Ej: "1°1°", "2°2°"
  division: string
}

export interface Modulo {
  id: string
  numero: number
  horaInicio: string
  horaFin: string
  tipo: "clase" | "recreo" | "teoria" | "taller"
  etiqueta?: string
}

export interface BloqueHorario {
  id: string
  cursoId: string
  diaIndex: number // 0=Lunes, 4=Viernes
  moduloId: string
  materiaId: string
  docenteId: string // Titular (for backward compatibility)
  docentes?: DocenteAsignacion[] // Array of docentes (titular + up to 2 suplentes)
  grupo?: "A" | "B" | null
  condicion?: Condicion // Titular, Suplente, Provisional (legacy)
}

export interface HorarioCompleto {
  [cursoId: string]: {
    [diaIndex: number]: {
      [moduloId: string]: BloqueHorario | null
    }
  }
}

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

export const CONDICION_LABELS: Record<Condicion, string> = {
  titular: "Titular",
  titular_interino: "Titular Interino",
  suplente: "Suplente",
  provisional: "Provisional",
}

export const CONDICION_COLORS: Record<Condicion, string> = {
  titular: "bg-blue-100 text-blue-800 border-blue-200",
  titular_interino: "bg-amber-100 text-amber-800 border-amber-200",
  suplente: "bg-green-100 text-green-800 border-green-200",
  provisional: "bg-red-100 text-red-800 border-red-200",
}

export const MODULO_TIPO_LABELS: Record<string, string> = {
  clase: "Clase",
  recreo: "Recreo",
  teoria: "Teoría",
  taller: "Taller",
}

export const MODULO_TIPO_COLORS: Record<string, string> = {
  clase: "bg-blue-50 border-blue-200 text-blue-900",
  recreo: "bg-gray-50 border-gray-200 text-gray-900",
  teoria: "bg-emerald-50 border-emerald-300 text-emerald-900",
  taller: "bg-orange-50 border-orange-300 text-orange-900",
}
