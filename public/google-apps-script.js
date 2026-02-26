/**
 * Google Apps Script para Sistema de Gestión de Horarios
 * E.E.S.T. N° 6 Banfield
 * 
 * Instrucciones:
 * 1. Crea un Google Sheet con 6 hojas: Modulos, Materias, Docentes, Cursos, DocenteMateriaAsignaciones, Bloques
 * 2. Copia este código en un Google Apps Script (Extensiones > Apps Script)
 * 3. Ejecuta deployAsWebApp() una sola vez
 * 4. Copia la URL de deployment y pégala en la app
 * 
 * Estructura esperada del Google Sheet:
 * - Modulos: id, numero, horaInicio, horaFin, tipo (clase|recreo|teoria|taller), etiqueta
 * - Materias: id, nombre, tieneSubgrupos, docenteIds
 * - Docentes: id, nombre, apellido
 * - Cursos: id, nombre, division
 * - DocenteMateriaAsignaciones: id, docenteId, materiaId, condicion (titular|suplente|provisional)
 * - Bloques: id, cursoId, diaIndex, moduloId, materiaId, docenteId, grupo
 */

// Get the Sheet ID automatically - this script must be run from a Google Sheet
// No need to manually set SHEET_ID
function getSheetId() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getId();
  } catch (err) {
    Logger.log("Error getting sheet ID: " + err.toString());
    throw new Error("This script must be run from a Google Sheet with bound script");
  }
}

function doGet(e) {
  try {
    // Initialize data if sheets are empty
    initializeData();
    
    const action = (e && e.parameter && e.parameter.action) || "";
    Logger.log("doGet action: " + action);
    
    if (!action) {
      return getResponse({ error: "No action specified" }, 400);
    }

    switch (action) {
      case "getModulos":
        return getResponse(getModulos());
      case "getMaterias":
        return getResponse(getMaterias());
      case "getDocentes":
        return getResponse(getDocentes());
      case "getDocenteMateriaAsignaciones":
        return getResponse(getDocenteMateriaAsignaciones());
      case "getCursos":
        return getResponse(getCursos());
      case "getBloques":
        const cursoId = e.parameter.cursoId || "";
        return getResponse(getBloques(cursoId));
      case "getAllBloques":
        return getResponse(getAllBloques());
      default:
        return getResponse({ error: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    Logger.log("Error in doGet: " + err.toString());
    return getResponse({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    // Initialize data if sheets are empty
    initializeData();
    
    // Handle form-urlencoded POST data (CORS-friendly format)
    let action = "";
    let payload = {};
    
    if (e.postData && e.postData.type === "application/x-www-form-urlencoded") {
      // Parse form data
      const params = e.parameter;
      action = params.action || "";
      const bodyStr = params.body || "{}";
      payload = JSON.parse(bodyStr);
    } else if (e.postData && e.postData.type === "application/json") {
      // Handle JSON POST data as fallback
      payload = JSON.parse(e.postData.contents);
      action = payload.action || "";
    }
    
    Logger.log("doPost action: " + action);

    if (!action) {
      return getResponse({ error: "No action specified" }, 400);
    }

    switch (action) {
      // Bloques
      case "saveBloques":
        saveBloques(payload.bloques || []);
        return getResponse({ success: true });
      case "deleteBloque":
        deleteBloque(payload.bloqueId || "");
        return getResponse({ success: true });
      
      // Docentes
      case "createDocente":
        const newDocente = createDocente(payload);
        return getResponse(newDocente);
      case "updateDocente":
        updateDocente(payload.id, payload);
        return getResponse(payload);
      case "deleteDocente":
        deleteDocente(payload.id);
        return getResponse({ success: true });
      
      // Materias
      case "createMateria":
        const newMateria = createMateria(payload);
        return getResponse(newMateria);
      case "updateMateria":
        updateMateria(payload.id, payload);
        return getResponse(payload);
      case "deleteMateria":
        deleteMateria(payload.id);
        return getResponse({ success: true });
      
      // Módulos
      case "createModulo":
        const newModulo = createModulo(payload);
        return getResponse(newModulo);
      case "updateModulo":
        updateModulo(payload.id, payload);
        return getResponse(payload);
      case "deleteModulo":
        deleteModulo(payload.id);
        return getResponse({ success: true });
      
      // Cursos
      case "createCurso":
        const newCurso = createCurso(payload);
        return getResponse(newCurso);
      case "updateCurso":
        updateCurso(payload.id, payload);
        return getResponse(payload);
      case "deleteCurso":
        deleteCurso(payload.id);
        return getResponse({ success: true });
      
      // Docente-Materia Asignaciones
      case "createDocenteMateriaAsignacion":
        const newAsignacion = createDocenteMateriaAsignacion(payload);
        return getResponse(newAsignacion);
      case "updateDocenteMateriaAsignacion":
        updateDocenteMateriaAsignacion(payload.id, payload);
        return getResponse(payload);
      case "deleteDocenteMateriaAsignacion":
        deleteDocenteMateriaAsignacion(payload.id);
        return getResponse({ success: true });
      
      default:
        return getResponse({ error: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return getResponse({ error: err.toString() }, 500);
  }
}

function getResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Getters ----

function getModulos() {
  try {
    const sheet = getSheet("Modulos");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("No data in Modulos sheet");
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    const result = data.map((row) => ({
      id: String(row[0]).trim(),
      numero: row[1],
      horaInicio: String(row[2]).trim(),
      horaFin: String(row[3]).trim(),
      tipo: String(row[4]).trim(),
      etiqueta: row[5] ? String(row[5]).trim() : undefined,
    })).filter(m => m.id);
    
    Logger.log("getModulos returned: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getModulos: " + err.toString());
    return [];
  }
}

function getMaterias() {
  try {
    const sheet = getSheet("Materias");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const result = data.map((row) => ({
      id: String(row[0]).trim(),
      nombre: String(row[1]).trim(),
      tieneSubgrupos: row[2] === true || String(row[2]).toUpperCase() === "TRUE",
      docenteIds: row[3] ? String(row[3]).split(",").map(s => s.trim()).filter(s => s) : [],
    })).filter(m => m.id);
    
    Logger.log("getMaterias returned: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getMaterias: " + err.toString());
    return [];
  }
}

function getDocentes() {
  try {
    const sheet = getSheet("Docentes");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const result = data.map((row) => ({
      id: String(row[0]).trim(),
      nombre: String(row[1]).trim(),
      apellido: String(row[2]).trim(),
    })).filter(d => d.id);
    
    Logger.log("getDocentes returned: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getDocentes: " + err.toString());
    return [];
  }
}

function getDocenteMateriaAsignaciones() {
  try {
    const sheet = getSheet("DocenteMateriaAsignaciones");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const result = data.map((row) => ({
      id: String(row[0]).trim(),
      docenteId: String(row[1]).trim(),
      materiaId: String(row[2]).trim(),
      condicion: String(row[3]).trim(),
    })).filter(a => a.id);
    
    Logger.log("getDocenteMateriaAsignaciones returned: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getDocenteMateriaAsignaciones: " + err.toString());
    return [];
  }
}

function getCursos() {
  try {
    const sheet = getSheet("Cursos");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const result = data.map((row) => ({
      id: String(row[0]).trim(),
      nombre: String(row[1]).trim(),
      division: String(row[2]).trim(),
    })).filter(c => c.id);
    
    Logger.log("getCursos returned: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getCursos: " + err.toString());
    return [];
  }
}

function getBloques(cursoId) {
  try {
    const sheet = getSheet("Bloques");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const result = data
      .filter((row) => String(row[1]).trim() === cursoId)
      .map((row) => ({
        id: String(row[0]).trim(),
        cursoId: String(row[1]).trim(),
        diaIndex: row[2],
        moduloId: String(row[3]).trim(),
        materiaId: String(row[4]).trim(),
        docenteId: String(row[5]).trim(),
        docentes: row[5] ? [{ docenteId: String(row[5]).trim(), condicion: "titular" }] : [],
        grupo: row[6] ? String(row[6]).trim() || null : null,
      }))
      .filter(b => b.id);
    
    Logger.log("getBloques returned: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getBloques: " + err.toString());
    return [];
  }
}

// Fetch ALL bloques without filtering by course
function getAllBloques() {
  try {
    const sheet = getSheet("Bloques");
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const result = data
      .map((row) => ({
        id: String(row[0]).trim(),
        cursoId: String(row[1]).trim(),
        diaIndex: row[2],
        moduloId: String(row[3]).trim(),
        materiaId: String(row[4]).trim(),
        docenteId: String(row[5]).trim(),
        docentes: row[5] ? [{ docenteId: String(row[5]).trim(), condicion: "titular" }] : [],
        grupo: row[6] ? String(row[6]).trim() || null : null,
      }))
      .filter(b => b.id);
    
    Logger.log("getAllBloques returned " + result.length + " bloques: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error in getAllBloques: " + err.toString());
    return [];
  }
}

// ---- Setters ----

function saveBloques(bloques) {
  const sheet = getSheet("Bloques");
  // Clear existing data
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  // Write new data
  bloques.forEach((b) => {
    sheet.appendRow([b.id, b.cursoId, b.diaIndex, b.moduloId, b.materiaId, b.docenteId, b.grupo]);
  });
}

function deleteBloque(bloqueId) {
  const sheet = getSheet("Bloques");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === bloqueId) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// ---- Docentes CRUD ----

function createDocente(payload) {
  const sheet = getSheet("Docentes");
  const id = payload.id || "d_" + Date.now();
  sheet.appendRow([id, payload.nombre, payload.apellido]);
  return { id, nombre: payload.nombre, apellido: payload.apellido };
}

function updateDocente(id, payload) {
  const sheet = getSheet("Docentes");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 2, 2, 1, 2).setValues([[payload.nombre, payload.apellido]]);
      break;
    }
  }
}

function deleteDocente(id) {
  const sheet = getSheet("Docentes");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// ---- Materias CRUD ----

function createMateria(payload) {
  const sheet = getSheet("Materias");
  const id = payload.id || "mat_" + Date.now();
  const docenteIds = (payload.docenteIds || []).join(",");
  sheet.appendRow([id, payload.nombre, payload.tieneSubgrupos || false, docenteIds]);
  return { id, nombre: payload.nombre, tieneSubgrupos: payload.tieneSubgrupos || false, docenteIds: payload.docenteIds || [] };
}

function updateMateria(id, payload) {
  const sheet = getSheet("Materias");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      const docenteIds = (payload.docenteIds || []).join(",");
      sheet.getRange(i + 2, 2, 1, 3).setValues([[payload.nombre, payload.tieneSubgrupos || false, docenteIds]]);
      break;
    }
  }
}

function deleteMateria(id) {
  const sheet = getSheet("Materias");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// ---- Módulos CRUD ----

function createModulo(payload) {
  const sheet = getSheet("Modulos");
  const id = payload.id || "mod_" + Date.now();
  sheet.appendRow([id, payload.numero, payload.horaInicio, payload.horaFin, payload.tipo, payload.etiqueta || ""]);
  return { id, numero: payload.numero, horaInicio: payload.horaInicio, horaFin: payload.horaFin, tipo: payload.tipo, etiqueta: payload.etiqueta };
}

function updateModulo(id, payload) {
  const sheet = getSheet("Modulos");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 2, 2, 1, 5).setValues([[payload.numero, payload.horaInicio, payload.horaFin, payload.tipo, payload.etiqueta || ""]]);
      break;
    }
  }
}

function deleteModulo(id) {
  const sheet = getSheet("Modulos");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// ---- Cursos CRUD ----

function createCurso(payload) {
  const sheet = getSheet("Cursos");
  const id = payload.id || "c_" + Date.now();
  sheet.appendRow([id, payload.nombre, payload.division]);
  return { id, nombre: payload.nombre, division: payload.division };
}

function updateCurso(id, payload) {
  const sheet = getSheet("Cursos");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 2, 2, 1, 2).setValues([[payload.nombre, payload.division]]);
      break;
    }
  }
}

function deleteCurso(id) {
  const sheet = getSheet("Cursos");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// ---- Docente-Materia Asignaciones CRUD ----

function createDocenteMateriaAsignacion(payload) {
  const sheet = getSheet("DocenteMateriaAsignaciones");
  const id = payload.id || "dma_" + Date.now();
  sheet.appendRow([id, payload.docenteId, payload.materiaId, payload.condicion]);
  return { id, docenteId: payload.docenteId, materiaId: payload.materiaId, condicion: payload.condicion };
}

function updateDocenteMateriaAsignacion(id, payload) {
  const sheet = getSheet("DocenteMateriaAsignaciones");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 2, 2, 1, 3).setValues([[payload.docenteId, payload.materiaId, payload.condicion]]);
      break;
    }
  }
}

function deleteDocenteMateriaAsignacion(id) {
  const sheet = getSheet("DocenteMateriaAsignaciones");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

// ---- Helpers ----

function getSheet(name) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      Logger.log("Creating sheet: " + name);
      sheet = ss.insertSheet(name);
      // Initialize headers for new sheets
      initializeSheetHeaders(sheet, name);
    }
    Logger.log("Got sheet: " + name);
    return sheet;
  } catch (err) {
    Logger.log("Error in getSheet(" + name + "): " + err.toString());
    throw err;
  }
}

function initializeSheetHeaders(sheet, name) {
  switch(name) {
    case "Modulos":
      sheet.appendRow(["id", "numero", "horaInicio", "horaFin", "tipo", "etiqueta"]);
      break;
    case "Materias":
      sheet.appendRow(["id", "nombre", "tieneSubgrupos", "docenteIds"]);
      break;
    case "Docentes":
      sheet.appendRow(["id", "nombre", "apellido"]);
      break;
    case "Cursos":
      sheet.appendRow(["id", "nombre", "division"]);
      break;
    case "DocenteMateriaAsignaciones":
      sheet.appendRow(["id", "docenteId", "materiaId", "condicion"]);
      break;
    case "Bloques":
      sheet.appendRow(["id", "cursoId", "diaIndex", "moduloId", "materiaId", "docenteId", "grupo"]);
      break;
  }
}

function initializeData() {
  try {
    // Crear hojas si no existen
    getSheet("Modulos");
    getSheet("Materias");
    getSheet("Docentes");
    getSheet("Cursos");
    getSheet("DocenteMateriaAsignaciones");
    getSheet("Bloques");
    
    // Verificar si ya hay datos
    const docentesSheet = getSheet("Docentes");
    if (docentesSheet.getLastRow() < 2) {
      Logger.log("Inicializando datos de ejemplo...");
      
      // Agregar docentes
      docentesSheet.appendRow(["d1", "Juan", "García"]);
      docentesSheet.appendRow(["d2", "María", "López"]);
      docentesSheet.appendRow(["d3", "Carlos", "Rodríguez"]);
      docentesSheet.appendRow(["d4", "Ana", "Martínez"]);
      
      // Agregar materias
      const materiasSheet = getSheet("Materias");
      materiasSheet.appendRow(["mat1", "Matemática", true, "d1,d2"]);
      materiasSheet.appendRow(["mat2", "Lengua", false, "d3"]);
      materiasSheet.appendRow(["mat3", "Física", true, "d2,d4"]);
      materiasSheet.appendRow(["mat4", "Historia", false, "d1"]);
      materiasSheet.appendRow(["mat5", "Inglés", false, "d4"]);
      
      // Agregar módulos
      const modulosSheet = getSheet("Modulos");
      modulosSheet.appendRow(["m1", 1, "07:50", "08:35", "clase", ""]);
      modulosSheet.appendRow(["m2", 2, "08:35", "09:20", "clase", ""]);
      modulosSheet.appendRow(["m3", 3, "09:20", "10:05", "clase", ""]);
      modulosSheet.appendRow(["recreo1", 0, "10:05", "10:15", "recreo", "Recreo"]);
      modulosSheet.appendRow(["m4", 4, "10:15", "11:00", "clase", ""]);
      modulosSheet.appendRow(["m5", 5, "11:00", "11:45", "clase", ""]);
      modulosSheet.appendRow(["m6", 6, "11:45", "12:30", "clase", ""]);
      
      // Agregar cursos
      const cursosSheet = getSheet("Cursos");
      cursosSheet.appendRow(["c1", "1ro", "A"]);
      cursosSheet.appendRow(["c2", "1ro", "B"]);
      cursosSheet.appendRow(["c3", "2do", "A"]);
      cursosSheet.appendRow(["c4", "2do", "B"]);
      cursosSheet.appendRow(["c5", "3ro", "A"]);
      cursosSheet.appendRow(["c6", "3ro", "B"]);
      
      // Agregar asignaciones docente-materia
      const asignacionesSheet = getSheet("DocenteMateriaAsignaciones");
      asignacionesSheet.appendRow(["dma1", "d1", "mat1", "titular"]);
      asignacionesSheet.appendRow(["dma2", "d2", "mat1", "suplente"]);
      asignacionesSheet.appendRow(["dma3", "d3", "mat2", "titular"]);
      asignacionesSheet.appendRow(["dma4", "d2", "mat3", "titular"]);
      asignacionesSheet.appendRow(["dma5", "d4", "mat3", "suplente"]);
      asignacionesSheet.appendRow(["dma6", "d1", "mat4", "titular"]);
      asignacionesSheet.appendRow(["dma7", "d4", "mat5", "titular"]);
      
      Logger.log("Datos de ejemplo inicializados correctamente");
    }
  } catch (err) {
    Logger.log("Error en initializeData: " + err.toString());
  }
}
