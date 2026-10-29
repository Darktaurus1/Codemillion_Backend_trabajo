const bcrypt = require('bcryptjs');
const UsuariosModel = require('../Modelo/usuario_modelo');const {
    validarBoleta,
    validarCorreo,
    validarContrasena,
    validarContrasenaSegura,
    validarConfirmacionContrasena,
    validarNombre,
    validarCampoObligatorio,
    validarLongitud
} = require('../validaciones');

function esDuplicado(error) {
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}

async function listarUsuarios(req, res){
    try{
        const usuarios = await UsuariosModel.listar();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

async function obtenerUsuario(req, res) {
    try{
        const usuario = await UsuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error : 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error){
        res.status(500).json({error: error.message});
    }
}

async function crearUsuario(req, res) {
    const { nombre, correo, contrasena, confirmarContrasena, boleta, rol } = req.body;

    // Campos obligatorios (se valida que sean strings con contenido)
    if (
        !validarCampoObligatorio(nombre) ||
        !validarCampoObligatorio(correo) ||
        !validarCampoObligatorio(contrasena) ||
        !validarCampoObligatorio(confirmarContrasena) ||
        !validarCampoObligatorio(boleta)
    ) {
        return res.status(400).json({
            error: 'nombre, correo, contrasena, confirmarContrasena y boleta son obligatorios'
        });
    }

    // Nombre
    if (!validarNombre(nombre)) {
        return res.status(400).json({
            error: 'El nombre solo puede contener letras, espacios, acentos y guiones (2 a 80 caracteres)'
        });
    }

    // Correo
    if (!validarCorreo(correo)) {
        return res.status(400).json({ error: 'El correo no tiene un formato válido' });
    }

    // Boleta
    if (!validarBoleta(boleta)) {
        return res.status(400).json({ error: 'La boleta no tiene un formato válido (10 dígitos, ej. 2023630001)' });
    }

    // Longitud de la contraseña
    if (!validarContrasena(contrasena)) {
        return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 128 caracteres' });
    }

    // Fortaleza de la contraseña
    if (!validarContrasenaSegura(contrasena)) {
        return res.status(400).json({
            error: 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial'
        });
    }

    // Confirmación de contraseña
    if (!validarConfirmacionContrasena(contrasena, confirmarContrasena)) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Rol (opcional): si viene, debe ser texto y de longitud razonable
    if (rol !== undefined && !validarLongitud(rol, 30)) {
        return res.status(400).json({ error: 'El rol no es válido' });
    }

    try {
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await UsuariosModel.crear({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            contrasenaHash,
            boleta,
            rol
        });
        res.status(201).json(usuario);
    } catch (error) {
        if (esDuplicado(error)) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese correo o boleta' });
        }
        res.status(500).json({ error: error.message });
    }
}

async function actualizarUsuario(req, res) {
    const { nombre, correo, rol } = req.body;
    if (nombre === undefined && correo === undefined && rol === undefined) {
        return res.status(400).json({ error: 'Envía al menos uno de: nombre, correo, rol' });
    }
    if (correo !== undefined && !validarCorreo(correo)) {
        return res.status(400).json({ error: 'El correo no tiene un formato válido' });
    }
    try {
        const usuario = await UsuariosModel.actualizar(req.params.id, { nombre, correo, rol });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        if (esDuplicado(error)) return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
        res.status(500).json({ error: error.message });
    }
}

async function eliminarUsuario(req, res) {
    try {
        const eliminado = await UsuariosModel.eliminar(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { listarUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario }
//deberan realizar los controladores de asistencia y talleres con sus funciones correspondientes