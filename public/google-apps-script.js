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

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID"; // Reemplaza con tu ID de sheet

function doGet(e) {
  try {
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
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || "";
    Logger.log("doPost action: " + action);

    if (!action) {
      return getResponse({ error: "No action specified" }, 400);
    }

    switch (action) {
      case "saveBloques":
        saveBloques(payload.bloques || []);
        return getResponse({ success: true });
      case "deleteBloque":
        deleteBloque(payload.bloqueId || "");
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

// ---- Helpers ----

function getSheet(name) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      Logger.log("Creating sheet: " + name);
      sheet = ss.insertSheet(name);
    }
    Logger.log("Got sheet: " + name);
    return sheet;
  } catch (err) {
    Logger.log("Error in getSheet(" + name + "): " + err.toString());
    throw err;
  }
}
