import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza un valor de hora que puede venir de Google Sheets como:
 * - ISO string: "1899-12-30T15:40:00.000Z"  (Google Apps Script serializa con UTC)
 * - Hora simple: "07:40" o "7:40:00"
 * Devuelve siempre "HH:MM"
 *
 * Google Apps Script convierte las celdas de hora a objetos Date y los serializa en UTC.
 * El timezone configurado en el proyecto de Apps Script determina el offset.
 * Basado en los datos observados (7:40 en Sheets → 15:40 UTC en la ISO string),
 * el offset del proyecto Apps Script es UTC-8 (-480 minutos).
 * Esta constante debe coincidir con el timezone del proyecto en Google Apps Script.
 */
const APPS_SCRIPT_UTC_OFFSET_MINUTES = -480 // UTC-8: 7:40 local = 15:40 UTC

export function formatHora(value: string): string {
  if (!value) return ''
  // Si es un ISO string con fecha (ej: "1899-12-30T15:40:00.000Z")
  if (value.includes('T')) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      // Obtener minutos totales desde medianoche UTC
      const utcTotalMinutes = date.getUTCHours() * 60 + date.getUTCMinutes()
      // Aplicar el offset del timezone del proyecto Apps Script
      let localTotalMinutes = utcTotalMinutes + APPS_SCRIPT_UTC_OFFSET_MINUTES
      // Normalizar al rango 0–1439 (manejo de días negativos/overflow)
      localTotalMinutes = ((localTotalMinutes % 1440) + 1440) % 1440
      const hh = String(Math.floor(localTotalMinutes / 60)).padStart(2, '0')
      const mm = String(localTotalMinutes % 60).padStart(2, '0')
      return `${hh}:${mm}`
    }
  }
  // Si es "HH:MM:SS" o "H:MM:SS" o "HH:MM"
  const parts = value.split(':')
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0')
    const mm = parts[1].padStart(2, '0')
    return `${hh}:${mm}`
  }
  return value
}
