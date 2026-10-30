const pool = require("../bd-local")

const COLUMNAS_ASISTENCIAS = "id, taller_id, nombre_alumno, boleta, fecha_registro, asistencia"

async function registrarAsistencia({tallerId, nombreAlumno, boleta}) {
  await pool.query(
    `INSERT INTO asistencias (taller_id, nombre_alumno, boleta) VALUES (?, ?, ?)`,
    [tallerId, nombreAlumno, boleta]
  )

  const[filas] = await pool.query(
      `SELECT ${COLUMNAS_ASISTENCIAS} FROM asistencias WHERE taller_id = ? AND boleta = ? ORDER BY fecha_registro DESC LIMIT 1`,
        [tallerId, boleta]
  )
  return filas[0]
}

async function marcarAsistencia(id) {
  const [resultado] = await pool.query(
    'UPDATE asistencias SET asistencia = 1 WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

async function consultarAsistenciasPorTaller(tallerId) {
  const [filas] = await pool.query(
      `SELECT ${COLUMNAS_ASISTENCIAS} FROM asistencias WHERE taller_id = ?`,
      [tallerId]
  )
  return filas
}

module.exports = {registrarAsistencia, consultarAsistenciasPorTaller, marcarAsistencia}