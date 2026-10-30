const pool = require('../bd-local')
const COLUMNAS_TALLERES = "id, nombre, instructor, fecha, cupo, created_at"

async function listar() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_TALLERES} FROM talleres ORDER BY fecha`)
    return filas
}

async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_TALLERES} FROM talleres WHERE id = ?`, [id])
    return filas[0]
}

async function registrarAlumnoTaller({tallerId, nombreAlumno, boleta}) {
  await pool.query(
    `INSERT INTO asistencias (taller_id, nombre_alumno, boleta, asistencia) VALUES (?, ?, ?, ?)`,
    [tallerId, nombreAlumno, boleta, 0]
  )

  const [filas] = await pool.query(
        `SELECT * FROM asistencias WHERE taller_id = ? AND boleta = ? ORDER BY fecha_registro DESC LIMIT 1`,
        [tallerId, boleta]
    )
    return filas[0]
}

async function crear({nombre, instructor, fecha, cupo}) {
    await pool.query(
        `INSERT INTO talleres (id, nombre, instructor, fecha, cupo) 
         VALUES (UUID(), ?, ?, ?, ?)`, 
        [nombre, instructor, fecha, cupo]
    );

    const [filas] = await pool.query(
        `SELECT id, nombre, instructor, fecha, cupo, created_at 
         FROM talleres 
         WHERE nombre = ? AND instructor = ? 
         ORDER BY created_at DESC LIMIT 1`,
        [nombre, instructor]
    );
    
    return filas[0];
}

module.exports = {listar, obtenerPorId, crear}