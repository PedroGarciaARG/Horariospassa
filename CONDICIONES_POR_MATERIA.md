# Condiciones por Docente-Materia

## Resumen de cambios

Un docente puede ahora tener **diferentes condiciones** (Titular, Suplente, Provisional) para **cada materia** que enseña. Por ejemplo:
- Carlos García es **Titular** en Matemática
- Pero es **Suplente** en Física

## Cambios en la estructura de datos

### Antes (incorrecto)
```js
{
  id: "d1",
  nombre: "Carlos",
  apellido: "García",
  condicion: "titular",        // ❌ Global - igual para todas las materias
  materias: ["mat1", "mat3"]   // ❌ Acoplado al docente
}
```

### Ahora (correcto)
```js
// Docentes sin condición
{
  id: "d1",
  nombre: "Carlos",
  apellido: "García"
}

// Condiciones guardadas en una tabla separada
{
  id: "dma1",
  docenteId: "d1",
  materiaId: "mat1",
  condicion: "titular"           // ✅ Titular en Matemática
}

{
  id: "dma2",
  docenteId: "d1",
  materiaId: "mat3",
  condicion: "suplente"          // ✅ Suplente en Física
}
```

## Archivos modificados

### 1. **types/index.ts**
- ✅ Limpiado: `Docente` ya no tiene `condicion` ni `materias`
- ✅ Preservado: `DocenteMateriaAsignacion` (ya existía)

### 2. **lib/api.ts**
- ✅ Creado: `MOCK_DOCENTE_MATERIA_ASIGNACIONES` con ejemplos
- ✅ Actualizado: `MOCK_DOCENTES` (sin condicion/materias)
- ✅ Agregada función: `fetchDocenteMateriaAsignaciones()`
- ✅ Agregada función helper: `getDocenteCondicion(docenteId, materiaId, asignaciones)`

### 3. **app/page.tsx**
- ✅ Agrega estado: `docenteMateriaAsignaciones`
- ✅ Pasa a componentes: `docenteMateriaAsignaciones` como prop

### 4. **components/editor-horarios.tsx**
- ✅ Recibe: `docenteMateriaAsignaciones` como prop
- ✅ Filtra docentes por materia: usando asignaciones, no `docente.materias`
- ✅ Muestra condición: resuelta desde asignaciones
- ✅ DraggableBloque: recibe `condicion` como prop (no de `docente.condicion`)

### 5. **components/vista-docente.tsx**
- ✅ Recibe: `docenteMateriaAsignaciones` como prop
- ✅ Muestra perfil: lista todas las materias con sus condiciones

### 6. **public/google-apps-script.js**
- ✅ Nueva hoja: "DocenteMateriaAsignaciones"
- ✅ Nuevo getter: `getDocenteMateriaAsignaciones()`
- ✅ Actualizado: `getDocentes()` ahora solo devuelve `{id, nombre, apellido}`

## Google Sheets: Estructura esperada

### Hoja "Docentes"
| id  | nombre | apellido    |
|-----|--------|-------------|
| d1  | Carlos | García      |
| d2  | Laura  | Martínez    |

### Hoja "DocenteMateriaAsignaciones"
| id   | docenteId | materiaId | condicion   |
|------|-----------|-----------|-------------|
| dma1 | d1        | mat1      | titular     |
| dma2 | d1        | mat3      | suplente    |
| dma3 | d2        | mat1      | suplente    |
| dma4 | d2        | mat8      | titular     |

## Mock data de ejemplo

Todos los cambios ya están reflejados en los datos mock. Carlos García es un buen ejemplo:
- **Titular** en Matemática (dma1)
- **Suplente** en Física (dma2)

Diego Pérez:
- **Titular** en Tecnología (dma11)
- **Suplente** en Informática (dma12)

## Cómo usar

### En el Editor de Horarios
1. Selecciona una materia
2. El selector de docentes se filtra automáticamente a los que enseñan esa materia
3. La condición mostrada es la de esa materia específica

### En Vista por Docente
1. Selecciona un docente
2. Verás todas sus materias con sus condiciones respectivas

### En Google Sheets
1. Crea la hoja "DocenteMateriaAsignaciones" con 4 columnas: id, docenteId, materiaId, condicion
2. El Apps Script automáticamente lee de esta hoja
3. Los datos se sincronizan con la app

## Migración desde el formato anterior

Si tienes datos en el formato antiguo:

**Antes (incorrecto):**
```
Docentes:
d1, Carlos, García, titular, mat1,mat3
```

**Después (correcto):**
```
Docentes:
d1, Carlos, García

DocenteMateriaAsignaciones:
dma1, d1, mat1, titular
dma2, d1, mat3, suplente
```

---

**La refactorización está completa y lista para usar con Google Sheets.**
