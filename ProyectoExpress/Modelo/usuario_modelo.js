const pull = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, nombre, correo, boleta, rol';
//consultar a todos
async function listar() {
    const [filas] = await PoolConnection.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY id`);
    return filas;
}
//Obtener por id
async function ObtenerPorid() {
    const [filas] = await PoolConnection.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`);
    return filas [0];
}
//Registrar
async function crear({nombre, correo , contrasenaHash, boleta, rol}) {
    const [info] = await PoolConnection.query(`INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?, ?, ?, ?, ?)`,[nombre, correo, contrasenaHash, boleta, rol || 'alumno']);
    return ObtenerPorid(info.insertId);

}

async function actualizar(id, {nombre, correo, rol}) {
    const cambios = Object.entries ({nombre, correo, rol}).filter(([, valor]) => valor !== undefined);
    if(cambios.length === 0) return ObtenerPorid(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(', ');

    const [info] = await PoolConnection.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`, [...cambios.map(([, valor]) => valor), id]);

    if(info.affectedRows === 0) return undefined;
    return ObtenerPorid(id);


}

//Eliminar
async function eliminar(id) {
    const [filas] = await PoolConnection.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return info.affectedRows >0 ;
    }


    //Buscar por correo has

    async function buscarPorCorreoConHash(correo) {
        const [filas] = await PoolConnection.query(`SELECT * FROM usuarios WHERE correo = ?`, [correo]);
    return filas [0];
        
    }
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