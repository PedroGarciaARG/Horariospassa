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
    
    switch(action) {
      case 'test':
        return createJsonResponse({
          success: true,
          message: 'Google Apps Script is working!',
          timestamp: new Date().toISOString()
        });
        
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
        return createJsonResponse(getBloques(e.parameter.cursoId));
        
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
    
    Logger.log('POST Action: ' + action);
    
    switch(action) {
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
      result.push({
        id: values[i][0],
        numero: parseInt(values[i][1]) || 0,
        horaInicio: values[i][2] || '',
        horaFin: values[i][3] || '',
        tipo: values[i][4] || 'clase',
        etiqueta: values[i][5] || ''
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Bloques');
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    const result = [];
    
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0]) continue;
      if (cursoId && values[i][1] !== cursoId) continue;
      
      result.push({
        id: values[i][0],
        cursoId: values[i][1],
        diaIndex: parseInt(values[i][2]) || 0,
        moduloId: values[i][3] || '',
        materiaId: values[i][4] || '',
        docenteId: values[i][5] || '',
        grupo: values[i][6] || null
      });
    }
    return result;
  } catch(error) {
    Logger.log('Error in getBloques: ' + error);
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
    const sheet = getOrCreateSheet('Bloques', ['id', 'cursoId', 'diaIndex', 'moduloId', 'materiaId', 'docenteId', 'grupo']);
    
    // Limpiar filas existentes
    while (sheet.getLastRow() > 1) {
      sheet.deleteRow(2);
    }
    
    // Agregar nuevos bloques
    if (Array.isArray(bloques)) {
      bloques.forEach(bloque => {
        sheet.appendRow([
          bloque.id || '',
          bloque.cursoId || '',
          bloque.diaIndex || 0,
          bloque.moduloId || '',
          bloque.materiaId || '',
          bloque.docenteId || '',
          bloque.grupo || ''
        ]);
      });
    }
    
    return createJsonResponse({success: true, count: bloques ? bloques.length : 0});
  } catch(error) {
    Logger.log('Error in saveBloques: ' + error);
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
