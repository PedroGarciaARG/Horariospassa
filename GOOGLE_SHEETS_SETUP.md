# Guía de Configuración – Sistema de Gestión de Horarios

## 1. Preparar tu Google Sheet

1. Crea un nuevo Google Sheet: https://sheets.google.com
2. Renombra las hojas predeterminadas o crea estas 5 hojas:
   - **Modulos** - Definición de módulos horarios
   - **Materias** - Catálogo de materias
   - **Docentes** - Base de docentes
   - **Cursos** - Listado de cursos
   - **Bloques** - Asignaciones de horarios (se actualiza automáticamente)

### Estructura de cada hoja:

#### Modulos
| id | numero | horaInicio | horaFin | tipo | etiqueta |
|----|--------|-----------|---------|------|----------|
| m1 | 1 | 07:30 | 08:15 | clase |  |
| m2 | 2 | 08:15 | 09:00 | teoria | Teoría |
| m3 | 3 | 09:00 | 09:45 | taller | Taller |
| recreo1 | 0 | 09:45 | 10:00 | recreo | Recreo |

**tipo:** puede ser `clase`, `recreo`, `teoria` o `taller`

#### Materias
| id | nombre | tieneSubgrupos | docenteIds |
|----|--------|----------------|-----------|
| mat1 | Matemática | FALSE | d1,d2 |
| mat8 | Tecnología | TRUE | d2,d8 |

**tieneSubgrupos:** TRUE para materias con subgrupos A/B (como talleres)
**docenteIds:** lista separada por comas

#### Docentes
| id | nombre | apellido | condicion | materias |
|----|--------|----------|-----------|----------|
| d1 | Carlos | García | titular | mat1,mat3 |
| d3 | Sofía | López | suplente | mat2 |

**condicion:** `titular`, `suplente` o `provisional`

#### Cursos
| id | nombre | division |
|----|--------|----------|
| c1 | 1° 1° | Primera |
| c2 | 1° 2° | Segunda |

#### Bloques
(Se actualiza automáticamente – no necesitas completar manualmente)
| id | cursoId | diaIndex | moduloId | materiaId | docenteId | grupo |
|----|---------|----------|----------|-----------|-----------|--------|
| b1 | c1 | 0 | m1 | mat1 | d1 | null |

**diaIndex:** 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes
**grupo:** `A`, `B` o vacío para materias sin subgrupos

---

## 2. Configurar Google Apps Script

1. Abre tu Google Sheet
2. Ve a **Extensiones** > **Apps Script**
3. Copia el código de `google-apps-script.js` (archivo proporcionado en la app)
4. **Reemplaza** `YOUR_GOOGLE_SHEET_ID` con el ID real de tu Sheet
   - Encuentralo en la URL: `docs.google.com/spreadsheets/d/{AQUI_ESTA_EL_ID}`
5. Guarda el proyecto (Ctrl+S)

### Deployar como Web App

1. Haz clic en **Deploy** (arriba a la derecha)
2. Selecciona **New deployment**
3. Tipo: **Web app**
4. Execute as: Tu cuenta
5. Who has access: **Anyone**
6. Copia la URL de deployment que aparece

---

## 3. Conectar la App

1. Abre tu app de horarios
2. Haz clic en el botón **Configurar** (icono de engranaje) en la esquina superior derecha
3. Pega la URL de deployment del Apps Script
4. Haz clic en **Probar Conexión**
   - ✅ Si ves "OK", está funcionando
   - ❌ Si ves error, verifica:
     - La URL sea completa y correcta
     - Hayas reemplazado el SHEET_ID en el Apps Script
     - Tu Google Sheet tenga las 5 hojas correctas
5. Guarda la configuración

---

## 4. Usar la App

### Editor de Horarios
- Selecciona un curso en el dropdown
- Haz clic en cualquier celda para asignar una clase
- Arrastra bloques para moverlos entre horarios
- El sistema detecta conflictos de docentes automáticamente
- Haz clic en **Guardar** para sincronizar con Google Sheets

### Tipos de Módulos
- **Teoría** (verde): Para clases teóricas
- **Taller** (naranja): Para talleres con subgrupos A/B
- **Clase** (azul): Para clases regulares
- **Recreo** (gris): No se pueden asignar clases

### Vista por Docente
- Ver el horario individual de cada profesor
- Visualizar horas de teoría vs. taller
- Exportar horario individual

### Estadísticas
- Gráficos de distribución por docente, curso y materia
- Análisis de horas de teoría vs. taller

---

## 5. Troubleshooting

**Q: La app dice "No configurado"**
- Aún no has pegado la URL del Apps Script. Ve a Configurar > Google Apps Script

**Q: Dice "Error" al conectar**
- Verifica que hayas reemplazado `YOUR_GOOGLE_SHEET_ID` en el Apps Script
- Verifica que tu Google Sheet tenga exactamente estas 5 hojas: Modulos, Materias, Docentes, Cursos, Bloques
- Las cabeceras deben estar en la fila 1

**Q: Los datos no se guardan**
- Verifica que la conexión esté configurada correctamente (botón Configurar)
- Asegúrate de hacer clic en **Guardar** en el editor de horarios

**Q: ¿Cómo importo datos existentes?**
- Completa las hojas Modulos, Materias, Docentes y Cursos con tus datos
- La hoja Bloques se actualiza automáticamente cuando usas la app

---

## 6. Backup y Seguridad

- Google Sheets guarda automáticamente todas tus versiones
- Ve a **Archivo** > **Historial de versiones** para recuperar cambios anteriores
- Solo comparte el URL del Apps Script con usuarios de confianza
- Los datos se almacenan en tu Google Drive

---

¡Ya estás listo! Abre la app y comienza a crear horarios.
