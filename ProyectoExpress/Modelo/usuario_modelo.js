const pool = require("../bd-local")

const COLUMNAS_PUBLICAS = "id, nombre, correo, boleta, rol"

function publico(usuario) {
    if (!usuario) return undefined;
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        boleta: usuario.boleta,
        rol: usuario.rol
    };
}

async function revisarDuplicado({ correo, boleta }, idPropio = null) {
    if (correo) {
        const [res] = await pool.query(
            "SELECT id FROM usuarios WHERE LOWER(correo) = LOWER(?) AND (? IS NULL OR id <> ?)", 
            [correo, idPropio, idPropio]
        );
        if (res.length > 0) {
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            throw error;
        }
    }
    if (boleta) {
        const [res] = await pool.query(
            "SELECT id FROM usuarios WHERE boleta = ? AND (? IS NULL OR id <> ?)", 
            [boleta, idPropio, idPropio]
        );
        if (res.length > 0) {
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            throw error;
        }
    }
}

async function listar() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY id`)
    return filas.map(publico);
}

//Obtener por ID

async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = ?`, [id]);
    return filas.length > 0 ? publico(filas[0]) : undefined;
}

//crear

async function crear({nombre, correo, contrasenaHash, boleta, rol}) {
    await revisarDuplicado({correo, boleta})

    const [info] = await pool.query(
        `INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?, ?, ?, ?, ?)`,
        [nombre, correo, contrasenaHash, boleta, rol || "alumno"]
    )

    return obtenerPorId(info.insertId);
}

//Actualizar

async function actualizar(id, {nombre, correo, rol}) {
    const usuarioExistente = await obtenerPorId(id);
    if (!usuarioExistente) return undefined;

    await revisarDuplicado({ correo }, id);

    const cambios = Object.entries({ nombre, correo, rol }).filter(([, valor]) => valor !== undefined);
    if (cambios.length === 0) {
        return obtenerPorId(id);
    }

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(", ");
    const valores = cambios.map(([, valor]) => valor);

    await pool.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`, [...valores, id]);
    return obtenerPorId(id);
}

//eliminar

async function eliminar(id) {
    const [info] = await pool.query(`DELETE FROM usuarios WHERE id = ?`, [id]);
    return info.affectedRows > 0;
}

//buscar por correo hash

async function buscarPorCorreoConHash(correo) {
    const [filas] = await pool.query("SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)", [correo]);
    return filas.length > 0 ? { ...filas[0] } : undefined;
}

module.exports = {listar, obtenerPorId, crear , actualizar, eliminar, buscarPorCorreoConHash}

//deberan de crear los modelos de las tablas talleres y asistencia 
//taller tiene registrar alumno al taller, consultar todos los talleres talleres_modelo.js
//asistencia tiene registrar asistencia, consultar asistencia de taller asistencia_modelo.js
//