# Changelog – Actualización a v2.0

## Cambios Implementados

### 1. Logo Institucional
✅ Reemplazado con el escudo real de E.E.S.T. N° 6 Banfield (verde y dorado)

### 2. Tipos de Módulos: Teoría y Taller
✅ **types/index.ts**
  - Añadido: `tipo: "clase" | "recreo" | "teoria" | "taller"` a interface `Modulo`
  - Nuevas constantes:
    - `MODULO_TIPO_LABELS` - Etiquetas en español
    - `MODULO_TIPO_COLORS` - Colores visuales (verde para teoría, naranja para taller)

✅ **components/editor-horarios.tsx**
  - Mostrar badge de tipo en cada módulo
  - Leyenda visual con código de colores
  - Drag & drop mantiene el tipo de módulo

✅ **lib/api.ts**
  - Mock data actualizado con 3 módulos de tipo "teoria" y 2 de tipo "taller"

### 3. Integración Google Sheets
✅ **lib/api.ts**
  - Función `getGoogleScriptUrl()` que lee de localStorage en runtime
  - Fallback a mock data si no hay URL configurada
  - Actualizado `apiFetch` y `apiPost` para usar URL dinámica

✅ **components/config-google-sheets.tsx** (NUEVO)
  - Modal para pegar URL del Google Apps Script
  - Guarda en localStorage del navegador
  - Botón "Probar Conexión" para validar
  - Instrucciones paso a paso integradas

✅ **components/app-header.tsx**
  - Botón "Configurar" (engranaje) en esquina superior derecha
  - Abre modal de configuración Google Sheets

✅ **hooks/use-google-script-url.ts** (NUEVO)
  - Hook que inyecta URL desde localStorage
  - Se ejecuta al cargar la app

✅ **app/page.tsx**
  - Llama `useGoogleScriptUrl()` para cargar configuración

### 4. Google Apps Script Template
✅ **public/google-apps-script.js** (NUEVO)
  - Código listo para copiar a Google Apps Script
  - Maneja todas las acciones: getModulos, getMaterias, etc.
  - Syncronización bidireccional de datos
  - Instrucciones en comentarios

### 5. Documentación Completa
✅ **GOOGLE_SHEETS_SETUP.md** (NUEVO)
  - Guía paso a paso en español
  - Estructura de cada hoja del Google Sheet
  - Ejemplos de datos
  - Troubleshooting

✅ **README.md** (MEJORADO)
  - Descripción general del sistema
  - Instrucciones de instalación
  - Guía de características
  - Estructura del proyecto

## Archivos Modificados

1. `/types/index.ts` - Tipos actualizados
2. `/lib/api.ts` - Integración dinámica de Google Sheets
3. `/components/app-header.tsx` - Botón configurar
4. `/components/editor-horarios.tsx` - Visualización de tipos
5. `/app/page.tsx` - Hook de Google Script
6. `/app/globals.css` - Sin cambios (tema ya listo)
7. `/public/logo.png` - Reemplazado con logo real

## Archivos Nuevos

1. `/components/config-google-sheets.tsx` - Modal de configuración
2. `/hooks/use-google-script-url.ts` - Hook de configuración
3. `/public/google-apps-script.js` - Plantilla de Apps Script
4. `/GOOGLE_SHEETS_SETUP.md` - Guía de instalación
5. `/README.md` - Documentación principal

## Cómo Usar

### Para Usuarios Finales

1. Leer `GOOGLE_SHEETS_SETUP.md`
2. Crear Google Sheet y Apps Script
3. Pegar URL en modal "Configurar"
4. ¡Listo! Los datos se guardan automáticamente

### Para Desarrollo

```bash
# Los datos de mock funcionan sin Google Sheets
pnpm dev

# Con Google Sheets (opcional)
# Pega URL en modal de configuración
```

## Compatibilidad

- ✅ Funciona sin Google Sheets (usa mock data)
- ✅ Funciona con Google Sheets (al configurar)
- ✅ Datos se guardan en localStorage + Google Sheets
- ✅ Exportación a Excel (sin cambios)
- ✅ Vistas por docente (sin cambios)

## Próximas Mejoras (opcionales)

- Autenticación por Google Sheets
- Backup automático
- Validación de horarios
- Conflictos de aulas
- Historial de cambios
- Notificaciones en tiempo real

---

**Versión:** 2.0  
**Fecha:** Febrero 2026  
**Estado:** ✅ Lista para producción
