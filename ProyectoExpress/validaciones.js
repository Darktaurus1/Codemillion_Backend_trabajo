const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexBoleta = /^20[2-3]\d(0[1-9]|1[0-5])\d{4}$/;

function validarCorreo(correo){
    return regexEmail.test(correo)
}

function validarBoleta(boleta){
    return regexBoleta.test(boleta)
}


function validarContrasena(contrasena){
    if (typeof contrasena !== "string") return false
    return contrasena.length >= 8
}

module.exports = {validarBoleta, validarContrasena, validarCorreo}