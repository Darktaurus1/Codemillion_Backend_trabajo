const pull = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, taller_alumno, nombre_alumno, boleta, fecha_registro';


// Registrar asistencia
async function registrarAsistencia({tallerId, nombreAlumno, boleta}) {
    const [info] = await PoolConnection.query(
        `INSERT INTO asistencias (taller_id, nombre_alumno, boleta) VALUES (?, ?, ?)`,
        [tallerId, nombreAlumno, boleta]
    );
    return { id: info.insertId, tallerId, nombreAlumno, boleta };
}

// Consultar asistencias de un taller 
async function consultarAsistenciaTaller(tallerId) {
    const [filas] = await PoolConnection.query(
        `SELECT * FROM asistencias WHERE taller_id = ? ORDER BY id`,
        [tallerId]
    );
    return filas;
}
 module.exports = {listar, ObtenerPorid, crear, actualizar, eliminar, buscarPorCorreoConHash, registrarAlumnoTaller, listarTalleres, registrarAsistencia, consultarAsistenciaTaller}