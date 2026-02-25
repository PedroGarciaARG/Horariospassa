# Guía de Configuración - Sistema de Gestión de Horarios

## Inicio Rápido

### 1. Primeros Pasos

Al abrir la aplicación por primera vez, verás la pantalla de **Configurar Google Apps Script**. Aquí necesitas ingresar la URL de tu Google Apps Script deployado.

### 2. Crear tu Google Apps Script

#### **IMPORTANTE: Usa el archivo simplificado**

Este proyecto incluye un archivo `GOOGLE_APPS_SCRIPT_SIMPLE.gs` que ya tiene TODO el código necesario y está probado. **Te recomendamos usar este archivo en lugar de copiar el código manualmente.**

#### Opción A: Crear desde cero en Google Drive (RECOMENDADO - Usa el archivo simplificado)

1. Ve a [Google Drive](https://drive.google.com)
2. Haz clic en **Nuevo** → **Más** → **Google Apps Script**
3. Copia TODO el contenido del archivo `GOOGLE_APPS_SCRIPT_SIMPLE.gs` de este proyecto
4. Pégalo en tu Google Apps Script (reemplaza TODO)
5. **Guarda** el proyecto

Si prefieres escribir manualmente, aquí está el template completo:

```javascript
// apps-script-template.gs
function doGet(e) {
  try {
    // Validar que e y e.parameter existan
    if (!e || !e.parameter) {
      return ContentService.createTextOutput(JSON.stringify({error: 'No parameters provided'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action;
    
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({error: 'No action specified'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    switch(action) {
      case 'getDocentes':
        return ContentService.createTextOutput(JSON.stringify(getDocentes()))
          .setMimeType(ContentService.MimeType.JSON);
      case 'getMaterias':
        return ContentService.createTextOutput(JSON.stringify(getMaterias()))
          .setMimeType(ContentService.MimeType.JSON);
      case 'getCursos':
        return ContentService.createTextOutput(JSON.stringify(getCursos()))
          .setMimeType(ContentService.MimeType.JSON);
      case 'getModulos':
        return ContentService.createTextOutput(JSON.stringify(getModulos()))
          .setMimeType(ContentService.MimeType.JSON);
      case 'getBloques':
        return ContentService.createTextOutput(JSON.stringify(getBloques(e.parameter.cursoId)))
          .setMimeType(ContentService.MimeType.JSON);
      case 'getDocenteMateriaAsignaciones':
        return ContentService.createTextOutput(JSON.stringify(getDocenteMateriaAsignaciones()))
          .setMimeType(ContentService.MimeType.JSON);
      default:
        return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action: ' + action}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Validar que e y postData existan
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({error: 'No post data provided'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (!action) {
      return ContentService.createTextOutput(JSON.stringify({error: 'No action specified'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    switch(action) {
      case 'createDocente':
        return saveDocente(data);
      case 'updateDocente':
        return updateDocenteRow(data);
      case 'deleteDocente':
        return deleteDocenteRow(data.id);
      case 'createMateria':
        return saveMateria(data);
      case 'updateMateria':
        return updateMateriaRow(data);
      case 'deleteMateria':
        return deleteMateriaRow(data.id);
      case 'createModulo':
        return saveModulo(data);
      case 'updateModulo':
        return updateModuloRow(data);
      case 'deleteModulo':
        return deleteModuloRow(data.id);
      case 'createCurso':
        return saveCurso(data);
      case 'updateCurso':
        return updateCursoRow(data);
      case 'deleteCurso':
        return deleteCursoRow(data.id);
      case 'createDocenteMateriaAsignacion':
        return saveAsignacion(data);
      case 'updateDocenteMateriaAsignacion':
        return updateAsignacionRow(data);
      case 'deleteDocenteMateriaAsignacion':
        return deleteAsignacionRow(data.id);
      case 'saveBloques':
        return saveBloques(data.bloques);
      default:
        return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action: ' + action}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(error) {
    Logger.log('doPost error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Funciones GET
function getDocentes() {
  const sheet = SpreadsheetApp.getActiveSheet().getSheetByName('Docentes');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const docentes = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    docentes.push({
      id: data[i][0],
      nombre: data[i][1],
      apellido: data[i][2]
    });
  }
  return docentes;
}

function getMaterias() {
  const sheet = SpreadsheetApp.getActiveSheet().getSheetByName('Materias');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const materias = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    materias.push({
      id: data[i][0],
      nombre: data[i][1],
      tieneSubgrupos: data[i][2] === true,
      docenteIds: (data[i][3] || '').split(',').filter(x => x)
    });
  }
  return materias;
}

function getCursos() {
  const sheet = SpreadsheetApp.getActiveSheet().getSheetByName('Cursos');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const cursos = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    cursos.push({
      id: data[i][0],
      nombre: data[i][1],
      division: data[i][2]
    });
  }
  return cursos;
}

function getModulos() {
  const sheet = SpreadsheetApp.getActiveSheet().getSheetByName('Modulos');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const modulos = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    modulos.push({
      id: data[i][0],
      numero: parseInt(data[i][1]),
      horaInicio: data[i][2],
      horaFin: data[i][3],
      tipo: data[i][4],
      etiqueta: data[i][5]
    });
  }
  return modulos;
}

function getBloques(cursoId) {
  const sheet = SpreadsheetApp.getActiveSheet().getSheetByName('Bloques');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const bloques = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    if (data[i][1] !== cursoId) continue;
    
    bloques.push({
      id: data[i][0],
      cursoId: data[i][1],
      diaIndex: parseInt(data[i][2]),
      moduloId: data[i][3],
      materiaId: data[i][4],
      docenteId: data[i][5],
      grupo: data[i][6] || null
    });
  }
  return bloques;
}

function getDocenteMateriaAsignaciones() {
  const sheet = SpreadsheetApp.getActiveSheet().getSheetByName('DocenteMateriaAsignaciones');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const asignaciones = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    asignaciones.push({
      id: data[i][0],
      docenteId: data[i][1],
      materiaId: data[i][2],
      condicion: data[i][3]
    });
  }
  return asignaciones;
}

// Funciones POST - Docentes
function saveDocente(data) {
  try {
    const sheet = getOrCreateSheet('Docentes', ['id', 'nombre', 'apellido']);
    sheet.appendRow([data.id, data.nombre, data.apellido]);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: data.id}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    Logger.log('Error in saveDocente: ' + e);
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateDocenteRow(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Docentes');
    if (!sheet) throw new Error('Docentes sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        sheet.getRange(i + 1, 2).setValue(data.nombre);
        sheet.getRange(i + 1, 3).setValue(data.apellido);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Docente not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteDocenteRow(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Docentes');
    if (!sheet) throw new Error('Docentes sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Docente not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Funciones POST - Materias
function saveMateria(data) {
  try {
    const sheet = getOrCreateSheet('Materias', ['id', 'nombre', 'tieneSubgrupos', 'docenteIds']);
    sheet.appendRow([data.id, data.nombre, data.tieneSubgrupos || false, '']);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: data.id}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateMateriaRow(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materias');
    if (!sheet) throw new Error('Materias sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        sheet.getRange(i + 1, 2).setValue(data.nombre);
        sheet.getRange(i + 1, 3).setValue(data.tieneSubgrupos || false);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Materia not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteMateriaRow(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materias');
    if (!sheet) throw new Error('Materias sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Materia not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Funciones POST - Módulos
function saveModulo(data) {
  try {
    const sheet = getOrCreateSheet('Modulos', ['id', 'numero', 'horaInicio', 'horaFin', 'tipo', 'etiqueta']);
    sheet.appendRow([data.id, data.numero, data.horaInicio, data.horaFin, data.tipo, data.etiqueta]);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: data.id}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateModuloRow(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Modulos');
    if (!sheet) throw new Error('Modulos sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        sheet.getRange(i + 1, 2).setValue(data.numero);
        sheet.getRange(i + 1, 3).setValue(data.horaInicio);
        sheet.getRange(i + 1, 4).setValue(data.horaFin);
        sheet.getRange(i + 1, 5).setValue(data.tipo);
        sheet.getRange(i + 1, 6).setValue(data.etiqueta);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Modulo not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteModuloRow(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Modulos');
    if (!sheet) throw new Error('Modulos sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Modulo not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Funciones POST - Cursos
function saveCurso(data) {
  try {
    const sheet = getOrCreateSheet('Cursos', ['id', 'nombre', 'division']);
    sheet.appendRow([data.id, data.nombre, data.division]);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: data.id}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateCursoRow(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cursos');
    if (!sheet) throw new Error('Cursos sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        sheet.getRange(i + 1, 2).setValue(data.nombre);
        sheet.getRange(i + 1, 3).setValue(data.division);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Curso not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteCursoRow(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cursos');
    if (!sheet) throw new Error('Cursos sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Curso not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Funciones POST - Asignaciones
function saveAsignacion(data) {
  try {
    const sheet = getOrCreateSheet('DocenteMateriaAsignaciones', ['id', 'docenteId', 'materiaId', 'condicion']);
    sheet.appendRow([data.id, data.docenteId, data.materiaId, data.condicion]);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: data.id}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateAsignacionRow(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DocenteMateriaAsignaciones');
    if (!sheet) throw new Error('DocenteMateriaAsignaciones sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        sheet.getRange(i + 1, 4).setValue(data.condicion);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Asignacion not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function deleteAsignacionRow(id) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DocenteMateriaAsignaciones');
    if (!sheet) throw new Error('DocenteMateriaAsignaciones sheet not found');
    
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    throw new Error('Asignacion not found');
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función auxiliar
function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
  }
  
  return sheet;
}

// Bloques
function saveBloques(bloques) {
  try {
    const sheet = getOrCreateSheet('Bloques', ['id', 'cursoId', 'diaIndex', 'moduloId', 'materiaId', 'docenteId', 'grupo']);
    
    // Limpiar filas existentes (excepto encabezado)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
    
    // Agregar nuevos bloques
    bloques.forEach(bloque => {
      sheet.appendRow([
        bloque.id,
        bloque.cursoId,
        bloque.diaIndex,
        bloque.moduloId,
        bloque.materiaId,
        bloque.docenteId,
        bloque.grupo || ''
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({success: true, count: bloques.length}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    Logger.log('Error in saveBloques: ' + e);
    return ContentService.createTextOutput(JSON.stringify({error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### Pasos para desplegar:

1. En Google Apps Script, haz clic en **Deploy** → **New Deployment**
2. Selecciona **Type**: Web app
3. Selecciona **Execute as**: Tu cuenta
4. Selecciona **Who has access**: Anyone
5. Haz clic en **Deploy**
6. Copia la **Deployment URL**

### 3. Configurar la App

1. En la pantalla de inicio, pega la URL que copiaste
2. Haz clic en **Probar Conexión**
3. Si todo funciona, haz clic en **Guardar**

## Estructura de Google Sheets

Tu Google Sheets debe tener las siguientes pestañas (sheets):

### 1. Docentes
Columnas: `id`, `nombre`, `apellido`

### 2. Materias
Columnas: `id`, `nombre`, `tieneSubgrupos`, `docenteIds` (separados por coma)

### 3. Cursos
Columnas: `id`, `nombre`, `division`

### 4. Módulos
Columnas: `id`, `numero`, `horaInicio`, `horaFin`, `tipo`, `etiqueta`

### 5. Bloques
Columnas: `id`, `cursoId`, `diaIndex`, `moduloId`, `materiaId`, `docenteId`, `grupo`

### 6. DocenteMateriaAsignaciones
Columnas: `id`, `docenteId`, `materiaId`, `condicion`

## Módulos de la Aplicación

### Administración (Primeros pasos)
- **Gestionar Docentes**: Crear, editar y eliminar docentes
- **Gestionar Materias**: Crear materias y asignar docentes (titular/suplente/provisional)
- **Gestionar Cursos**: Crear cursos/divisiones
- **Gestionar Módulos**: Crear módulos de clase y recreos

### Sistema
- **Editor de Horarios**: Interfaz drag-and-drop para crear horarios
- **Vista por Docente**: Ver horario individual de cada docente
- **Estadísticas**: Gráficos y análisis de horas por docente/materia/curso
- **Exportar Excel**: Descargar horarios en formato .xlsx
- **Vista Imprimible**: Genera un documento listo para imprimir

## Test Rápido Después de Deployar

Antes de configurar la app, prueba tu Google Apps Script directamente:

1. Copia tu URL deployada: `https://script.google.com/macros/s/AKfycbz...`
2. Abre en una pestaña nueva: `https://script.google.com/macros/s/AKfycbz...?action=test`
3. Deberías ver una respuesta JSON confirmando que funciona

Si ves un error aquí, el problema está en tu Google Apps Script. Revisa `TROUBLESHOOTING.md`.

---

## Resolución de Problemas

Para ayuda completa con errores, revisa **TROUBLESHOOTING.md**

Errores comunes:

### "Error: Cannot read properties of undefined"
- Usa el archivo `GOOGLE_APPS_SCRIPT_SIMPLE.gs` en lugar de escribir manualmente
- Verifica que Google Apps Script esté deployado como "Web app"
- Asegúrate que seleccionaste "Anyone" en los permisos

### "Conexión OK pero datos vacíos"
- Agrega datos de prueba a tu Google Sheets manualmente
- O usa los módulos de administración en la app para crear datos

### "Los cambios no se guardan"
- Verifica que tu URL de Google Apps Script es correcta
- Abre la consola del navegador (F12) para ver errores
- Revisa los logs en Google Apps Script (Ctrl+Enter)

---

## Tips

1. Empieza creando todos los docentes, materias y cursos desde los módulos de administración
2. Luego configura los módulos (clase, recreo, teoría, etc.)
3. Finalmente crea los horarios en el editor
4. Haz backup regular de tu Google Sheets

¡Listo! La aplicación sincronizará todos tus datos con Google Drive.
