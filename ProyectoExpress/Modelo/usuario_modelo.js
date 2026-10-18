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
    module.exports = {listar, ObtenerPorid, crear, actualizar, eliminar, buscarPorCorreoConHash}
    //Tarea uno crear los modelos de las tablas talleres y asistencia 
    //taller tiene registaralumno al taller , consultar todos los talleres
    //asistencia tiene registrarasistencia consultar asistencia de taller