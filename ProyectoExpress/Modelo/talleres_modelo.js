const pull = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, nombre, instructor, fecha, cupo, created_at';




     // Registrar alumno al taller
async function registrarAlumnoTaller(usuarioId, tallerId) {
    const [info] = await PoolConnection.query(
        `INSERT INTO taller_usuarios (usuario_id, taller_id) VALUES (?, ?)`,
        [usuarioId, tallerId]
    );
    return { id: info.insertId, usuarioId, tallerId };
}
// Consultar todos los talleres
async function listarTalleres() {
    const [filas] = await PoolConnection.query(`SELECT * FROM talleres ORDER BY id`);
    return filas;
}

