# Guía de Resolución de Problemas

## Error: "Cannot read properties of undefined (reading 'parameter')"

Este error ocurre cuando tu Google Apps Script no está configurado correctamente. Aquí están los pasos para solucionarlo:

### Paso 1: Usa el Script Simplificado

1. Abre tu Google Apps Script en [script.google.com](https://script.google.com)
2. Copia TODO el contenido del archivo `GOOGLE_APPS_SCRIPT_SIMPLE.gs` incluido en este proyecto
3. Reemplaza TODO el código en tu Google Apps Script con este contenido simplificado
4. **Guarda** el proyecto

### Paso 2: Verifica tu Google Sheets

Asegúrate de que tu Google Sheets tiene estas pestañas (hojas):

1. **Docentes** (columnas: id, nombre, apellido)
2. **Materias** (columnas: id, nombre, tieneSubgrupos, docenteIds)
3. **Cursos** (columnas: id, nombre, division)
4. **Módulos** (columnas: id, numero, horaInicio, horaFin, tipo, etiqueta)
5. **Bloques** (columnas: id, cursoId, diaIndex, moduloId, materiaId, docenteId, grupo)
6. **DocenteMateriaAsignaciones** (columnas: id, docenteId, materiaId, condicion)

**Si falta alguna pestaña, el script la creará automáticamente.**

### Paso 3: Deploy Como Web App

1. En Google Apps Script, haz clic en **Deploy** (arriba a la derecha)
2. Selecciona **New Deployment**
3. Haz clic en el ícono de engranaje y selecciona **Web app**
4. Completa los campos:
   - **Execute as**: Tu cuenta de Google (la que creó el script)
   - **Who has access**: **Anyone** (IMPORTANTE)
5. Haz clic en **Deploy**
6. Copia la URL que aparece (será algo como: `https://script.google.com/macros/s/AKfycbz.../usercontent`)

### Paso 4: Prueba la URL

Abre esta URL en el navegador (reemplaza con tu URL real):

```
https://script.google.com/macros/s/AKfycbz.../usercontent?action=test
```

**Deberías ver una respuesta JSON como:**
```json
{
  "success": true,
  "message": "Google Apps Script is working!",
  "timestamp": "2024-02-25T..."
}
```

Si ves un error, revisa la consola del Google Apps Script (Ctrl+Enter).

### Paso 5: Configura la App

1. Abre tu aplicación web
2. Ingresa la URL completa (sin los parámetros ?action=test)
3. Haz clic en "Probar Conexión"
4. Si todo funciona, haz clic en "Guardar"

---

## Error: "Conexión OK pero datos vacíos"

Si la conexión funciona pero no ves datos:

1. Abre tu Google Sheets
2. Ve a la pestaña **Docentes**
3. Agrega algunos docentes de prueba:
   - Fila 1: Encabezados (id, nombre, apellido)
   - Fila 2: d_1, Juan, Pérez
   - Fila 3: d_2, María, González
4. Vuelve a la app y haz clic en "Probar Conexión"

---

## Error: "Los cambios no se guardan"

Si creas datos en la app pero no aparecen en Google Sheets:

1. Abre la consola del navegador (F12 o Cmd+Option+I)
2. Ve a la pestaña "Console"
3. Intenta crear un nuevo docente
4. Busca mensajes de error en la consola
5. Si ves errores CORS, verifica que tu script está deployado con "Anyone" access

---

## Verificar que el Script está Deployado Correctamente

1. Ve a tu Google Apps Script
2. Haz clic en **Deployments** (a la izquierda)
3. Deberías ver tu deployment con un icono verde y la URL
4. Haz clic en la URL para ver los detalles
5. Asegúrate que dice "Active" y que "Who has access" sea "Anyone"

---

## Reset Completo (si todo falla)

1. Crea un NUEVO Google Sheets desde cero
2. Crea un NUEVO Google Apps Script desde cero
3. Copia el contenido de `GOOGLE_APPS_SCRIPT_SIMPLE.gs`
4. Deploy como Web app
5. Copia la URL
6. En la app, borra localStorage:
   - Abre la consola (F12)
   - Escribe: `localStorage.clear()`
   - Recarga la página (F5)
7. Ingresa la nueva URL
8. Prueba de nuevo

---

## Contacto

Si el problema persiste, revisa:

1. Los logs en Google Apps Script (Ctrl+Enter)
2. La consola del navegador (F12)
3. Que el Google Apps Script esté público ("Anyone" access)
4. Que las URLs sean correctas (sin parámetros al ingresar la URL)
