# Guía de Testing - Sistema de Gestión de Horarios

## Antes de Usar en Producción

Prueba estos pasos para asegurar que todo está funcionando correctamente.

---

## Test 1: Verificar Google Apps Script

### Paso 1: Deploy correctamente

1. Abre tu Google Apps Script
2. Haz clic en **Deploy** → **New Deployment**
3. Tipo: **Web app**
4. Execute as: Tu cuenta
5. Who has access: **Anyone** (IMPORTANTE)
6. Haz clic en Deploy
7. Copia la URL (algo como: `https://script.google.com/macros/s/AKfycbz...`)

### Paso 2: Test en el navegador

Abre esta URL en una pestaña nueva (reemplaza con tu URL):

```
https://script.google.com/macros/s/AKfycbz...?action=test
```

Deberías ver:
```json
{
  "success": true,
  "message": "Google Apps Script is working!",
  "timestamp": "2024-02-25T..."
}
```

Si ves un error, revisa la consola de Google Apps Script (Ctrl+Enter en el editor).

### Paso 3: Test GET de datos

Prueba cada endpoint:

```
# Docentes
https://script.google.com/macros/s/AKfycbz...?action=getDocentes

# Materias
https://script.google.com/macros/s/AKfycbz...?action=getMaterias

# Cursos
https://script.google.com/macros/s/AKfycbz...?action=getCursos

# Módulos
https://script.google.com/macros/s/AKfycbz...?action=getModulos

# Asignaciones
https://script.google.com/macros/s/AKfycbz...?action=getDocenteMateriaAsignaciones
```

Si tu Google Sheets está vacío, verás:
```json
[]
```

Esto es correcto.

---

## Test 2: Configurar la App

### Paso 1: Borrar datos guardados

Abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.clear()
```

Recarga la página (F5).

### Paso 2: Ingresar URL

1. Deberías ver la pantalla "Configurar Google Apps Script"
2. Pega la URL (sin parámetros, solo la URL base)
3. Haz clic en "Probar Conexión"
4. Deberías ver "Conexión exitosa" en verde
5. Haz clic en "Guardar"

### Paso 3: Ver Dashboard

Deberías ver el Dashboard con:
- Administración (4 botones de managers)
- Módulos del sistema (5 botones)

---

## Test 3: Crear Datos de Prueba

### Paso 1: Crear Docentes

1. Haz clic en "Gestionar Docentes"
2. Haz clic en "Agregar Docente"
3. Ingresa: Nombre = "Juan", Apellido = "Pérez"
4. Haz clic en "Guardar"
5. Deberías ver el docente en la lista

**Verifica en Google Sheets:**
- Abre tu Google Sheets
- Ve a la pestaña "Docentes"
- Deberías ver la fila nueva con los datos

### Paso 2: Crear Materias

1. Vuelve al Dashboard
2. Haz clic en "Gestionar Materias"
3. Haz clic en "Agregar Materia"
4. Ingresa: Nombre = "Matemática"
5. Haz clic en "Guardar"
6. Deberías ver la materia en la lista

### Paso 3: Asignar Docente a Materia

1. En el manager de Materias, busca la materia que creaste
2. Haz clic en "Editar" o el botón de asignación
3. Asigna el docente con rol "Titular"
4. Haz clic en "Guardar"

**Verifica en Google Sheets:**
- Ve a la pestaña "DocenteMateriaAsignaciones"
- Deberías ver la asignación nueva

### Paso 4: Crear Cursos

1. Vuelve al Dashboard
2. Haz clic en "Gestionar Cursos"
3. Haz clic en "Agregar Curso"
4. Ingresa: Nombre = "1°A", División = "1"
5. Haz clic en "Guardar"

### Paso 5: Crear Módulos

1. Vuelve al Dashboard
2. Haz clic en "Gestionar Módulos"
3. Haz clic en "Agregar Módulo"
4. Ingresa: Número = "1", Hora Inicio = "08:00", Hora Fin = "08:45", Tipo = "Clase"
5. Haz clic en "Guardar"
6. Crea al menos 5 módulos con diferentes horas

---

## Test 4: Editor de Horarios

### Paso 1: Abrir Editor

1. Vuelve al Dashboard
2. Haz clic en "Editor de Horarios"
3. Deberías ver una cuadrícula con módulos y días

### Paso 2: Crear un Bloque

1. Haz clic en una celda vacía
2. Se abrirá un modal para crear un bloque
3. Asigna: Curso, Materia, Docente, Módulo, Día
4. Haz clic en "Guardar"
5. El bloque aparecerá en la cuadrícula

**Verifica en Google Sheets:**
- Ve a la pestaña "Bloques"
- Deberías ver el bloque nuevo

### Paso 3: Verificar Vista por Docente

1. Vuelve al Dashboard
2. Haz clic en "Vista por Docente"
3. Selecciona el docente que asignaste
4. Deberías ver el horario del docente con el bloque que creaste

---

## Test 5: Exportar y Imprimir

### Paso 1: Exportar Excel

1. Vuelve al Dashboard
2. Haz clic en "Exportar Excel"
3. Deberías poder descargar un archivo .xlsx
4. Abre el archivo con Excel o Google Sheets

### Paso 2: Vista Imprimible

1. Vuelve al Dashboard
2. Haz clic en "Vista Imprimible"
3. Presiona Ctrl+P (Cmd+P en Mac)
4. Previsualiza el documento
5. Deberías ver el horario formateado para imprimir

---

## Checklist Final

Antes de entregar a usuarios, verifica:

- [ ] Google Apps Script deployado y accesible
- [ ] Docentes creados correctamente
- [ ] Materias creadas correctamente
- [ ] Asignaciones Docente-Materia guardadas
- [ ] Cursos creados correctamente
- [ ] Módulos creados correctamente
- [ ] Bloques creados en el editor
- [ ] Datos guardados en Google Sheets automáticamente
- [ ] Vista por docente muestra datos correctos
- [ ] Exportación a Excel funciona
- [ ] Vista imprimible se ve correctamente

---

## Debugging

Si algo no funciona:

1. **Abre la consola:** F12 → Console
2. **Busca errores rojos** (errores JavaScript)
3. **Revisa los logs:** Si hay errores, cópialos
4. **Verifica Google Sheets:** Accede manualmente y verifica que los datos estén
5. **Verifica Google Apps Script:** Abre el editor y haz Ctrl+Enter para ver los logs
6. **Lee TROUBLESHOOTING.md** para soluciones específicas

---

## Agregar Más Datos

Para un test más realista, crea:

- 5-10 docentes con diferentes nombres
- 10-15 materias
- 6 cursos (1° a 6°)
- 8-10 módulos (clase de 45 min, recreo de 15 min, etc.)

Luego crea 20-30 bloques distribuidos en la semana.
