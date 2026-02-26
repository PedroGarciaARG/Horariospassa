// Versión simplificada para probar
// Copia este código completo en tu Google Apps Script

function doGet(e) {
  Logger.log('doGet called with params: ' + JSON.stringify(e.parameter));
  
  try {
    if (!e || !e.parameter) {
      return createJsonResponse({error: 'No parameters provided', test: true});
    }
    
    const action = e.parameter.action;
    Logger.log('Action requested: ' + action);
    
    // Los parámetros del query string sirven tanto para lectura como escritura
    var p = e.parameter;

    switch(action) {
      case 'test':
        return createJsonResponse({
          success: true,
          message: 'Google Apps Script is working!',
          timestamp: new Date().toISOString()
        });
        
      // ---- Lectura ----
      case 'getDocentes':
        return createJsonResponse(getDocentes());
      case 'getMaterias':
        return createJsonResponse(getMaterias());
      case 'getCursos':
        return createJsonResponse(getCursos());
      case 'getModulos':
        return createJsonResponse(getModulos());
      case 'getDocenteMateriaAsignaciones':
        return createJsonResponse(getDocenteMateriaAsignaciones());
      case 'getBloques':
        return createJsonResponse(getBloques(p.cursoId));
      case 'getAllBloques':
        return createJsonResponse(getAllBloques());

      // ---- Bloques ----
  case 'saveBloques':
  try {
  Logger.log('saveBloques received p.bloques length: ' + (p.bloques || '').length);
  var bloques = JSON.parse(p.bloques || "[]");
  Logger.log('saveBloques parsed ' + bloques.length + ' bloques');
  return saveBloques(bloques);
  } catch(parseErr) {
  Logger.log('saveBloques parse error: ' + parseErr + ' raw: ' + (p.bloques || '').substring(0, 200));
  return createJsonResponse({error: 'Invalid JSON for bloques: ' + parseErr.toString()});
  }
      case 'deleteBloque':
        return deleteBloque(p.bloqueId || p.id);

      // ---- Docentes CRUD ----
      case 'createDocente':
        return createDocente(p);
      case 'updateDocente':
        return updateDocente(p.id, p);
      case 'deleteDocente':
        return deleteDocente(p.id);

      // ---- Materias CRUD ----
      case 'createMateria':
        return createMateria(p);
      case 'updateMateria':
        return updateMateria(p.id, p);
      case 'deleteMateria':
        return deleteMateria(p.id);

      // ---- Modulos CRUD ----
      case 'createModulo':
        return createModulo(p);
      case 'updateModulo':
        return updateModulo(p.id, p);
      case 'deleteModulo':
        return deleteModulo(p.id);

      // ---- Cursos CRUD ----
      case 'createCurso':
        return createCurso(p);
      case 'updateCurso':
        return updateCurso(p.id, p);
      case 'deleteCurso':
        return deleteCurso(p.id);

      // ---- Asignaciones CRUD ----
      case 'createDocenteMateriaAsignacion':
        return createDocenteMateriaAsignacion(p);
      case 'updateDocenteMateriaAsignacion':
        return updateDocenteMateriaAsignacion(p.id, p);
      case 'deleteDocenteMateriaAsignacion':
        return deleteDocenteMateriaAsignacion(p.id);

      default:
        return createJsonResponse({error: 'Unknown action: ' + action});
    }
  } catch(error) {
    Logger.log('Error in doGet: ' + error);
    return createJsonResponse({error: error.toString(), details: error.stack});
  }
}

function doPost(e) {
  Logger.log('doPost called');
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({error: 'No post data provided'});
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('POST Action: ' + action + ', Data: ' + JSON.stringify(data));
    
    switch(action) {
      case 'saveBloques':
        return saveBloques(data.bloques);
        
      case 'createDocente':
        return createDocente(data);
        
      case 'createMateria':
        return createMateria(data);
        
      case 'createModulo':
        return createModulo(data);
        
      case 'createCurso':
        return createCurso(data);
        
      case 'saveBloques':
        return saveBloques(data.bloques);
        
      default:
        return createJsonResponse({error: 'Unknown action: ' + action});
    }
  } catch(error) {
    Logger.log('Error in doPost: ' + error);
    return createJsonResponse({error: error.toString()});
  }
}

// UTILIDADES
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// GETTERS
function getDocentes() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Docentes');
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      result.push({
        id: values[i][0],
        nombre: values[i][1] || '',
        apellido: values[i][2] || ''
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getDocentes: ' + error);
    return [];
  }
}

function getMaterias() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materias');
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      result.push({
        id: values[i][0],
        nombre: values[i][1] || '',
        tieneSubgrupos: values[i][2] === true,
        docenteIds: (values[i][3] || '').split(',').filter(x => x.trim())
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getMaterias: ' + error);
    return [];
  }
}

function getCursos() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cursos');
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      result.push({
        id: values[i][0],
        nombre: values[i][1] || '',
        division: values[i][2] || ''
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getCursos: ' + error);
    return [];
  }
}

function getModulos() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Modulos');
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      
      // Normalize tipo: handle uppercase, missing, or embedded in etiqueta/id
      var rawTipo = String(values[i][4] || '').toLowerCase().trim();
      var etiqueta = String(values[i][5] || '').trim();
      var idStr = String(values[i][0] || '').toLowerCase();
      
      // Detect recreo from various sources
      if (rawTipo.indexOf('recreo') !== -1 || etiqueta.toLowerCase().indexOf('recreo') !== -1 || idStr.indexOf('recreo') !== -1) {
        rawTipo = 'recreo';
        if (!etiqueta) etiqueta = 'RECREO';
      } else if (rawTipo === 'teoria' || rawTipo === 'teoría' || rawTipo === 'teória') {
        rawTipo = 'teoria';
      } else if (rawTipo.indexOf('taller') !== -1) {
        rawTipo = 'taller';
      } else if (rawTipo !== 'clase' && rawTipo !== 'recreo' && rawTipo !== 'teoria' && rawTipo !== 'taller') {
        rawTipo = 'clase'; // default
      }
      
      result.push({
        id: values[i][0],
        numero: parseInt(values[i][1]) || 0,
        horaInicio: values[i][2] || '',
        horaFin: values[i][3] || '',
        tipo: rawTipo,
        etiqueta: etiqueta
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getModulos: ' + error);
    return [];
  }
}

function getBloques(cursoId) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bloques');
    if (!sheet) return [];
    
    var values = sheet.getDataRange().getValues();
    var result = [];
    
    for (var i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      if (cursoId && values[i][1] !== cursoId) continue;
      
      // Parse docentes JSON from column 8 (index 7)
      var docentesArr = [];
      var docentesRaw = values[i][7] || '';
      if (docentesRaw) {
        try { docentesArr = JSON.parse(docentesRaw); } catch(e) { docentesArr = []; }
      }
      // Fallback: if no docentes array, build from docenteId column
      if (docentesArr.length === 0 && values[i][5]) {
        docentesArr = [{ docenteId: values[i][5], condicion: 'titular' }];
      }
      
      result.push({
        id: values[i][0],
        cursoId: values[i][1],
        diaIndex: parseInt(values[i][2]) || 0,
        moduloId: values[i][3] || '',
        materiaId: values[i][4] || '',
        docenteId: values[i][5] || '',
        docentes: docentesArr,
        grupo: values[i][6] || null
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getBloques: ' + error);
    return [];
  }
}

// Fetch ALL bloques without filtering by course
function getAllBloques() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bloques');
    if (!sheet) return [];
    
    var values = sheet.getDataRange().getValues();
    var result = [];
    
    for (var i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      
      // Parse docentes JSON from column 8 (index 7)
      var docentesArr = [];
      var docentesRaw = values[i][7] || '';
      if (docentesRaw) {
        try { docentesArr = JSON.parse(docentesRaw); } catch(e) { docentesArr = []; }
      }
      if (docentesArr.length === 0 && values[i][5]) {
        docentesArr = [{ docenteId: values[i][5], condicion: 'titular' }];
      }
      
      result.push({
        id: values[i][0],
        cursoId: values[i][1],
        diaIndex: parseInt(values[i][2]) || 0,
        moduloId: values[i][3] || '',
        materiaId: values[i][4] || '',
        docenteId: values[i][5] || '',
        docentes: docentesArr,
        grupo: values[i][6] || null
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getAllBloques: ' + error);
    return [];
  }
}

function getDocenteMateriaAsignaciones() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DocenteMateriaAsignaciones');
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      result.push({
        id: values[i][0],
        docenteId: values[i][1],
        materiaId: values[i][2],
        condicion: values[i][3] || 'titular'
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getDocenteMateriaAsignaciones: ' + error);
    return [];
  }
}

// CREATORS/SETTERS
function createDocente(data) {
  try {
    const sheet = getOrCreateSheet('Docentes', ['id', 'nombre', 'apellido']);
    sheet.appendRow([data.id, data.nombre || '', data.apellido || '']);
    return createJsonResponse({success: true, id: data.id});
  } catch(error) {
    Logger.log('Error in createDocente: ' + error);
    return createJsonResponse({error: error.toString()});
  }
}

function createMateria(data) {
  try {
    const sheet = getOrCreateSheet('Materias', ['id', 'nombre', 'tieneSubgrupos', 'docenteIds']);
    sheet.appendRow([data.id, data.nombre || '', data.tieneSubgrupos ? 'TRUE' : 'FALSE', '']);
    return createJsonResponse({success: true, id: data.id});
  } catch(error) {
    Logger.log('Error in createMateria: ' + error);
    return createJsonResponse({error: error.toString()});
  }
}

function createModulo(data) {
  try {
    const sheet = getOrCreateSheet('Modulos', ['id', 'numero', 'horaInicio', 'horaFin', 'tipo', 'etiqueta']);
    sheet.appendRow([data.id, data.numero || 0, data.horaInicio || '', data.horaFin || '', data.tipo || 'clase', data.etiqueta || '']);
    return createJsonResponse({success: true, id: data.id});
  } catch(error) {
    Logger.log('Error in createModulo: ' + error);
    return createJsonResponse({error: error.toString()});
  }
}

function createCurso(data) {
  try {
    const sheet = getOrCreateSheet('Cursos', ['id', 'nombre', 'division']);
    sheet.appendRow([data.id, data.nombre || '', data.division || '']);
    return createJsonResponse({success: true, id: data.id});
  } catch(error) {
    Logger.log('Error in createCurso: ' + error);
    return createJsonResponse({error: error.toString()});
  }
}

function saveBloques(bloques) {
  try {
    var sheet = getOrCreateSheet('Bloques', ['id', 'cursoId', 'diaIndex', 'moduloId', 'materiaId', 'docenteId', 'grupo', 'docentes']);
    
    if (!Array.isArray(bloques) || bloques.length === 0) {
      return createJsonResponse({success: true, saved: 0});
    }
    
    // Determine which cursoId(s) are being saved so we only delete those rows
    var cursoIds = {};
    bloques.forEach(function(b) { if (b.cursoId) cursoIds[b.cursoId] = true; });
    
    // Delete only the rows belonging to these cursoIds (iterate from bottom to top)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var allData = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      for (var r = allData.length - 1; r >= 0; r--) {
        if (cursoIds[allData[r][1]]) {
          sheet.deleteRow(r + 2); // +2 because row 1 is header and array is 0-based
        }
      }
    }
    
    // Append the new bloques
    bloques.forEach(function(bloque) {
      // Serialize the docentes array as JSON string for storage
      var docentesJson = '';
      if (bloque.docentes && Array.isArray(bloque.docentes) && bloque.docentes.length > 0) {
        docentesJson = JSON.stringify(bloque.docentes);
      }
      
      sheet.appendRow([
        (bloque.id || '').toString().trim(),
        (bloque.cursoId || '').toString().trim(),
        parseInt(bloque.diaIndex) || 0,
        (bloque.moduloId || '').toString().trim(),
        (bloque.materiaId || '').toString().trim(),
        (bloque.docenteId || '').toString().trim(),
        (bloque.grupo || '').toString().trim(),
        docentesJson
      ]);
    });
    
    Logger.log('saveBloques: Saved ' + (bloques ? bloques.length : 0) + ' bloques');
    return createJsonResponse({success: true, count: bloques ? bloques.length : 0});
  } catch(error) {
    Logger.log('Error in saveBloques: ' + error);
    return createJsonResponse({error: error.toString()});
  }
}

// ---- UPDATE / DELETE ----

function updateDocente(id, p) {
  try {
    var sheet = getOrCreateSheet('Docentes', ['id', 'nombre', 'apellido']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (p.nombre !== undefined) sheet.getRange(i + 1, 2).setValue(p.nombre);
        if (p.apellido !== undefined) sheet.getRange(i + 1, 3).setValue(p.apellido);
        return createJsonResponse({success: true, id: id, nombre: p.nombre || data[i][1], apellido: p.apellido || data[i][2]});
      }
    }
    return createJsonResponse({error: 'Docente not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function deleteDocente(id) {
  try {
    var sheet = getOrCreateSheet('Docentes', ['id', 'nombre', 'apellido']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({success: true});
      }
    }
    return createJsonResponse({error: 'Docente not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function deleteBloque(bloqueId) {
  try {
    var sheet = getOrCreateSheet('Bloques', ['id', 'cursoId', 'diaIndex', 'moduloId', 'materiaId', 'docenteId', 'grupo']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(bloqueId)) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({success: true});
      }
    }
    return createJsonResponse({error: 'Bloque not found: ' + bloqueId});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function updateMateria(id, p) {
  try {
    var sheet = getOrCreateSheet('Materias', ['id', 'nombre', 'tieneSubgrupos', 'docenteIds']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (p.nombre !== undefined) sheet.getRange(i + 1, 2).setValue(p.nombre);
        if (p.tieneSubgrupos !== undefined) sheet.getRange(i + 1, 3).setValue(p.tieneSubgrupos === 'TRUE' || p.tieneSubgrupos === true ? 'TRUE' : 'FALSE');
        if (p.docenteIds !== undefined) sheet.getRange(i + 1, 4).setValue(typeof p.docenteIds === 'string' ? p.docenteIds : (Array.isArray(JSON.parse(p.docenteIds || '[]')) ? JSON.parse(p.docenteIds || '[]').join(',') : ''));
        return createJsonResponse({success: true, id: id});
      }
    }
    return createJsonResponse({error: 'Materia not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function deleteMateria(id) {
  try {
    var sheet = getOrCreateSheet('Materias', ['id', 'nombre', 'tieneSubgrupos', 'docenteIds']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({success: true});
      }
    }
    return createJsonResponse({error: 'Materia not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function updateModulo(id, p) {
  try {
    var sheet = getOrCreateSheet('Modulos', ['id', 'numero', 'horaInicio', 'horaFin', 'tipo', 'etiqueta']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (p.numero !== undefined) sheet.getRange(i + 1, 2).setValue(parseInt(p.numero) || 0);
        if (p.horaInicio !== undefined) sheet.getRange(i + 1, 3).setValue(p.horaInicio);
        if (p.horaFin !== undefined) sheet.getRange(i + 1, 4).setValue(p.horaFin);
        if (p.tipo !== undefined) sheet.getRange(i + 1, 5).setValue(p.tipo);
        if (p.etiqueta !== undefined) sheet.getRange(i + 1, 6).setValue(p.etiqueta);
        return createJsonResponse({success: true, id: id});
      }
    }
    return createJsonResponse({error: 'Modulo not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function deleteModulo(id) {
  try {
    var sheet = getOrCreateSheet('Modulos', ['id', 'numero', 'horaInicio', 'horaFin', 'tipo', 'etiqueta']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({success: true});
      }
    }
    return createJsonResponse({error: 'Modulo not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function updateCurso(id, p) {
  try {
    var sheet = getOrCreateSheet('Cursos', ['id', 'nombre', 'division']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (p.nombre !== undefined) sheet.getRange(i + 1, 2).setValue(p.nombre);
        if (p.division !== undefined) sheet.getRange(i + 1, 3).setValue(p.division);
        return createJsonResponse({success: true, id: id});
      }
    }
    return createJsonResponse({error: 'Curso not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function deleteCurso(id) {
  try {
    var sheet = getOrCreateSheet('Cursos', ['id', 'nombre', 'division']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({success: true});
      }
    }
    return createJsonResponse({error: 'Curso not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function createDocenteMateriaAsignacion(p) {
  try {
    var sheet = getOrCreateSheet('DocenteMateriaAsignaciones', ['id', 'docenteId', 'materiaId', 'condicion']);
    var id = p.id || 'dma_' + Date.now();
    sheet.appendRow([id, p.docenteId || '', p.materiaId || '', p.condicion || 'titular']);
    return createJsonResponse({success: true, id: id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function updateDocenteMateriaAsignacion(id, p) {
  try {
    var sheet = getOrCreateSheet('DocenteMateriaAsignaciones', ['id', 'docenteId', 'materiaId', 'condicion']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (p.docenteId !== undefined) sheet.getRange(i + 1, 2).setValue(p.docenteId);
        if (p.materiaId !== undefined) sheet.getRange(i + 1, 3).setValue(p.materiaId);
        if (p.condicion !== undefined) sheet.getRange(i + 1, 4).setValue(p.condicion);
        return createJsonResponse({success: true, id: id});
      }
    }
    return createJsonResponse({error: 'Asignacion not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

function deleteDocenteMateriaAsignacion(id) {
  try {
    var sheet = getOrCreateSheet('DocenteMateriaAsignaciones', ['id', 'docenteId', 'materiaId', 'condicion']);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({success: true});
      }
    }
    return createJsonResponse({error: 'Asignacion not found: ' + id});
  } catch(error) {
    return createJsonResponse({error: error.toString()});
  }
}

// HELPER
function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  
  return sheet;
}
