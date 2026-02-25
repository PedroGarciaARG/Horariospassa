# Google Apps Script Setup Guide

## El Problema

El Google Apps Script estaba usando `SHEET_ID = "YOUR_GOOGLE_SHEET_ID"` (un placeholder no reemplazado), por eso **no encontraba el Google Sheet y retornaba arrays vacíos**.

## La Solución

Ya actualicé el script para que **detecte automáticamente el ID del sheet** sin necesidad de copiarlo manualmente.

## Pasos para Actualizar Tu Google Apps Script

### 1. Abre tu Google Sheet
- Ve al Google Sheet que uses con esta app

### 2. Abre Google Apps Script
- Haz clic en **Extensiones → Apps Script**

### 3. Copia el código actualizado
- Abre el archivo `/public/google-apps-script.js` en tu proyecto v0
- Selecciona TODO el contenido (Ctrl+A)
- **Cópialo**

### 4. Reemplaza en Google Apps Script
- En Google Apps Script, selecciona TODO el código (Ctrl+A)
- **Bórralo**
- **Pega el código nuevo** que copiaste

### 5. Guarda y despliega
- Haz clic en **Guardar** (Ctrl+S)
- Haz clic en **Deploy → New deployment**
- Selecciona **"Web app"** en el desplegable "Select type"
- Asegúrate de:
  - **Execute as**: Tu cuenta
  - **Who has access**: Anyone
- Haz clic en **Deploy**
- **Copia la URL de deployment** que aparece

### 6. Actualiza tu app
- En tu app, en la sección de configuración del Google Script
- **Pega la nueva URL de deployment**

### 7. Recarga la app
- Haz clic en **Recargar** o presiona F5
- Los datos deberían cargarse automáticamente

## ¿Qué cambió en el script?

- ✅ Detecta automáticamente el Sheet ID (no necesita `YOUR_GOOGLE_SHEET_ID`)
- ✅ Auto-inicializa datos de ejemplo si las hojas están vacías
- ✅ Crea automáticamente las 6 hojas necesarias (Docentes, Materias, Módulos, etc.)
- ✅ Implementa CRUD completo (Create, Read, Update, Delete) para todas las entidades

## Si aún ves "Conexión establecida pero la hoja 'Docentes' está vacía"

1. Abre tu Google Sheet
2. Verifica que tenga 6 hojas: Docentes, Materias, Módulos, Cursos, DocenteMateriaAsignaciones, Bloques
3. Si no tienen encabezados, haz lo siguiente:
   - Fila 1 de cada hoja debe tener: `id` | `nombre` | `apellido` (o según la hoja)
4. Luego recarga la app

## Notas Importantes

- El script DEBE ser desplegado como **Web app** (no como librería)
- El script DEBE tener acceso "Anyone" para que funcione desde la app
- El script DEBE estar en la carpeta de **Google Apps Script vinculada al Sheet** (no uno aparte)

¡Debería funcionar ahora! 🚀
