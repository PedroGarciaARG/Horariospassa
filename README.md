# Sistema de Gestión de Horarios – E.E.S.T. N° 6 Banfield

Sistema web completo para gestionar horarios escolares, con soporte para módulos de teoría y taller, integración con Google Sheets y visualización por docente.

## Características

✅ **Editor de horarios interactivo** con drag & drop  
✅ **Diferenciación visual** entre Teoría y Taller  
✅ **Integración con Google Sheets** para almacenamiento en la nube  
✅ **Vista por docente** con horario individual  
✅ **Estadísticas** con gráficos de distribución  
✅ **Exportación a Excel** con múltiples hojas  
✅ **Vista imprimible** con encabezado institucional  
✅ **Detección de conflictos** de docentes  
✅ **Subgrupos A/B** para talleres  
✅ **Responsive design** para tablet y desktop  

## Inicio Rápido

### 1. Instalar localmente

```bash
# Clona o descarga el proyecto
cd proyecto

# Instala dependencias
pnpm install

# Inicia servidor de desarrollo
pnpm dev
```

Abre http://localhost:3000

### 2. Configurar Google Sheets + Google Apps Script

**Lee primero:** `SETUP.md` (guía completa y actualizada)

Pasos rápidos:

1. Copia el archivo `GOOGLE_APPS_SCRIPT_SIMPLE.gs` en tu Google Apps Script
2. Crea un nuevo Google Sheets con 6 hojas (el script las crea automáticamente si faltan)
3. Haz deploy del Apps Script como "Web app" con acceso "Anyone"
4. Copia la URL deployada
5. En la app: Ingresa la URL y haz clic en "Probar Conexión"

**Problemas?** Lee `TROUBLESHOOTING.md`

### 3. Datos iniciales

La app funciona en dos modos:

- **Sin configuración:** Usa datos de demostración (mock)
- **Con Google Apps Script:** Sincroniza datos desde Google Sheets en tiempo real
- 10 módulos (incluido recreo)

## Estructura del Proyecto

```
/app
  /page.tsx              # Página principal con router de vistas
  /layout.tsx            # Layout global con fuentes
  /globals.css           # Estilos con tema institucional

/components
  /login.tsx             # Panel de login
  /app-header.tsx        # Encabezado con logo y menú
  /dashboard.tsx         # Vista principal con navegación
  /editor-horarios.tsx   # Editor con drag & drop
  /vista-docente.tsx     # Horario individual por docente
  /estadisticas.tsx      # Gráficos y análisis
  /exportar-excel.tsx    # Generación de archivos XLSX
  /vista-imprimible.tsx  # Versión de impresión
  /config-google-sheets.tsx # Modal de configuración

/hooks
  /use-auth.ts           # Gestión de autenticación
  /use-google-script-url.ts # Carga URL desde localStorage

/lib
  /api.ts                # Funciones de API con fallback a mock
  /utils.ts              # Utilidades y estilos

/types
  /index.ts              # TypeScript interfaces

/public
  /logo.png              # Logo real E.E.S.T. N° 6
  /google-apps-script.js # Plantilla de Apps Script

GOOGLE_SHEETS_SETUP.md   # Guía de instalación completa
```

## Tipos de Módulos

| Tipo | Color | Uso |
|------|-------|-----|
| **Clase** | Azul | Clases regulares |
| **Teoría** | Verde | Clases teóricas |
| **Taller** | Naranja | Talleres con subgrupos A/B |
| **Recreo** | Gris | Recreos (no asignables) |

## Guía de Uso

### Editor de Horarios

1. Selecciona un curso del dropdown
2. **Hacer clic** en una celda para asignar una clase
3. **Arrastrar** un bloque para moverlo entre horarios
4. **Eliminar** haciendo clic en la X al pasar el mouse
5. Haz clic en **Guardar** para sincronizar con Google Sheets

**Detección de conflictos:**
- Si un docente tiene dos clases en el mismo módulo/día, recibirás un error
- El sistema muestra alertas en rojo

### Vista por Docente

- Ver horario completo de cada profesor
- Filtrar por docente
- Visualizar horas de teoría vs. taller
- Exportar horario individual

### Estadísticas

Gráficos de barras mostrando:
- Distribución de horas por docente
- Clases por curso
- Materias asignadas

### Exportar a Excel

Genera un archivo `.xlsx` con:
- Una hoja por curso (horarios completos)
- Una hoja por docente (horario individual)
- Formato profesional listo para imprimir

### Vista Imprimible

- Encabezado con logo de la escuela
- Horario formateado para PDF
- Botón para imprimir directamente

## Colores Institucionales

- **Verde oscuro:** `#0B6B2E` (primario)
- **Dorado:** `#D4AF37` (acentos)
- **Crema:** `#F5F5F0` (fondo)

Estos colores se usan en el logo del escudo y se reflejan en toda la interfaz.

## Google Apps Script

El script proporciona una API REST que:
- Lee datos de un Google Sheet
- Sincroniza horarios automáticamente
- Maneja conflictos de docentes
- Permite exportar/importar datos

**Endpoint:** `POST/GET` al URL de deployment

**Acciones:**
- `getModulos` - Obtener módulos horarios
- `getMaterias` - Obtener catálogo de materias
- `getDocentes` - Obtener docentes
- `getCursos` - Obtener cursos
- `getBloques` - Obtener asignaciones
- `saveBloques` - Guardar horarios
- `deleteBloque` - Eliminar asignación

## Requisitos

- Node.js 18+
- pnpm (o npm)
- Google account (para Google Sheets)

## Dependencias Principales

- **Next.js 15** - Framework React
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilos
- **shadcn/ui** - Componentes UI
- **dnd-kit** - Drag & drop
- **Recharts** - Gráficos
- **xlsx** - Exportación a Excel
- **Lucide React** - Iconos

## Deployment

### Vercel (recomendado)

```bash
pnpm vercel
```

### Otras plataformas

Compatible con cualquier plataforma que soporte Next.js (Railway, Netlify, etc.)

## Variables de Entorno

Opcionales (si no usas Google Sheets):

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/.../usercontent
```

## Troubleshooting

**P: La app dice "No configurado"**
- Ve a Configurar y pega la URL del Apps Script

**P: Error al conectar a Google Sheets**
- Verifica que hayas reemplazado el SHEET_ID en el Apps Script
- Asegúrate de tener las 5 hojas correctas

**P: No veo los cambios después de guardar**
- Recarga la página (F5)
- Verifica que la conexión a Google Sheets esté activa

## Licencia

Uso libre para E.E.S.T. N° 6 Banfield

## Contacto

Para reportar bugs o sugerencias, contacta al administrador del sistema.

---

**Última actualización:** Febrero 2026  
**Versión:** 2.0 (Google Sheets + Teoría/Taller)
