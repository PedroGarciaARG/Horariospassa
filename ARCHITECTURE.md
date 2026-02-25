# 📊 Flujo de Datos del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO (Directivo/Docente)                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │   App Web (Next.js)    │
          │  - Editor visual       │
          │  - Drag & Drop         │
          │  - Exportación Excel   │
          │  - Vistas por Docente  │
          └────────────┬───────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
   ┌────────────────┐      ┌──────────────────────┐
   │   Mock Data    │      │ Google Apps Script   │
   │  (datos demo)  │      │ + Google Sheets      │
   └────────────────┘      └──────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Google Drive       │
                         │  (almacenamiento     │
                         │   persistente)       │
                         └──────────────────────┘
```

## 🔄 Flujo de Guardado

### Sin Google Sheets (Demo)
```
Usuario edita en app
       ↓
Datos en memoria (useState)
       ↓
Recarga página = datos desaparecen ⚠️
```

### Con Google Sheets (Producción)
```
Usuario edita en app
       ↓
Click en "Guardar"
       ↓
Envía JSON a Google Apps Script
       ↓
Apps Script actualiza Google Sheets
       ↓
Guardado permanentemente en Google Drive ✅
```

## 🌐 Arquitectura de la App

```
NEXT.JS (Frontend + Backend)
│
├─ /app
│  ├─ page.tsx (Router de vistas)
│  ├─ layout.tsx (Estructura global)
│  └─ globals.css (Estilos institucionales)
│
├─ /components
│  ├─ login.tsx (Autenticación)
│  ├─ app-header.tsx (Menú + Botón Configurar)
│  ├─ dashboard.tsx (Pantalla principal)
│  ├─ editor-horarios.tsx (Drag & drop)
│  ├─ config-google-sheets.tsx (Modal)
│  ├─ vista-docente.tsx
│  ├─ estadisticas.tsx
│  ├─ exportar-excel.tsx
│  └─ vista-imprimible.tsx
│
├─ /lib
│  ├─ api.ts (Fetch con fallback a mock)
│  └─ utils.ts
│
├─ /types
│  └─ index.ts (Interfaces TypeScript)
│
├─ /hooks
│  ├─ use-auth.ts
│  └─ use-google-script-url.ts
│
└─ /public
   ├─ logo.png (Escudo E.E.S.T.)
   └─ google-apps-script.js (Plantilla)
```

## 📱 Vistas de la App

```
┌─ LOGIN ──────────────────────┐
│  Logo + Contraseña           │
└──────────────────────────────┘
           ↓
┌─ DASHBOARD ──────────────────┐
│ • Editor de Horarios         │
│ • Vista por Docente          │
│ • Estadísticas               │
│ • Exportar a Excel           │
│ • Vista Imprimible           │
│ • [Configurar]               │
└──────────────────────────────┘
     ↓         ↓         ↓
   Editor    Docente  Estadísticas
```

## 🔌 Integración Google Sheets

### Setup (Una sola vez)

```
1. Google Sheet
   ├── Hoja: Modulos
   ├── Hoja: Materias
   ├── Hoja: Docentes
   ├── Hoja: Cursos
   └── Hoja: Bloques

2. Google Apps Script (en tu cuenta)
   └─ Copia código de google-apps-script.js
   
3. Deploy como Web App
   └─ Copia URL

4. Pega URL en modal "Configurar"
   └─ ¡Listo!
```

### Uso (Automático)

```
Usuario edita horario
       ↓
Hace click en "Guardar"
       ↓
saveBloques() envía JSON
       ↓
Google Apps Script recibe
       ↓
Actualiza Google Sheet
       ↓
¡Guardado! ✅

Próxima sesión:
       ↓
App carga fetchBloques()
       ↓
Lee desde Google Sheet
       ↓
Muestra datos actualizados ✅
```

## 🎨 Tipos de Módulos

```
┌─ Módulo 1 (07:30-08:15) - Teoría ─────┐
│ ┌────────────────────────────────────┐ │
│ │ Lunes: Matemática - D. García      │ │
│ │ Martes: Matemática - D. García     │ │
│ └────────────────────────────────────┘ │
│           (Color: Verde)              │
└────────────────────────────────────────┘

┌─ Módulo 2 (08:15-09:00) - Taller ─────┐
│ ┌────────────────────────────────────┐ │
│ │ Lunes: Tecnología A - D. Diego     │ │
│ │ Martes: Tecnología B - D. Diego    │ │
│ └────────────────────────────────────┘ │
│           (Color: Naranja)             │
└────────────────────────────────────────┘

┌─ Recreo (09:45-10:00) ────────────────┐
│ ┌────────────────────────────────────┐ │
│ │ No se asigna nada (no seleccionable)│ │
│ └────────────────────────────────────┘ │
│            (Color: Gris)               │
└────────────────────────────────────────┘
```

## 🎯 Funcionalidades por Tabla

### Modulos
```
id    | numero | horaInicio | horaFin | tipo  | etiqueta
────────────────────────────────────────────────────────
m1    | 1      | 07:30      | 08:15   | clase | 
m2    | 2      | 08:15      | 09:00   | teoria| Teoría
m3    | 3      | 09:00      | 09:45   | taller| Taller
rec1  | 0      | 09:45      | 10:00   | recreo| Recreo
```

### Bloques (Se actualiza automáticamente)
```
id  | cursoId | diaIndex | moduloId | materiaId | docenteId | grupo
─────────────────────────────────────────────────────────────────────
b1  | c1      | 0        | m1       | mat1      | d1        | null
b2  | c1      | 0        | m2       | mat8      | d2        | A
b3  | c1      | 0        | m3       | mat8      | d2        | B
b4  | c1      | 4        | m1       | mat5      | d5        | null
```

## 🚀 Deploy a Producción

### Opción 1: Vercel (Recomendado)
```bash
$ pnpm vercel
✅ Deployed
URL: https://tu-horarios-app.vercel.app
```

### Opción 2: Cualquier hosting Node.js
```bash
$ npm run build
$ npm start
```

### Opción 3: Docker
```bash
$ docker build -t horarios-app .
$ docker run -p 3000:3000 horarios-app
```

## 📈 Crecimiento Futuro

### Fase 1 (Actual) ✅
- Editor básico + Google Sheets
- Teoría/Taller
- Exportación Excel

### Fase 2 (Próxima)
- 🔐 Autenticación con Google
- 📊 Reportes avanzados
- ⚠️ Validación de conflictos de aulas
- 🔔 Notificaciones

### Fase 3
- 📱 App móvil (React Native)
- 🌍 Multi-idioma
- 🎯 Analytics
- ☁️ Backup automático

---

## 🎓 Resumen para Usuarios

```
1. Abre la app
   ↓
2. Login: Passabanfield
   ↓
3. Click "Configurar" (engranaje)
   ↓
4. Pega URL de Google Apps Script
   ↓
5. Comienza a editar horarios
   ↓
6. Click "Guardar" = se guarda en Google Sheets
   ↓
7. ¡Los cambios persisten para siempre!
```

---

**Arquitectura simple, escalable y basada en Google (sin servidor propio).**
