
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexBoleta = /^20[2-3]\d(0[1-9]|1[0-5])\d{4}$/;
 
// Nombre y apellidos: letras, espacios, acentos y guiones.
const regexNombre = /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u;
 
// Al menos una mayúscula, una minúscula, un número y un carácter especial.
const regexContrasenaSegura =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).+$/;
 
function validarCorreo(correo) {
    return typeof correo === "string" &&
        correo.length <= 254 &&
        regexEmail.test(correo);
}
 
function validarBoleta(boleta) {
    return typeof boleta === "string" &&
        regexBoleta.test(boleta);
}
 
function validarContrasena(contrasena) {
    return typeof contrasena === "string" &&
        contrasena.length >= 8 &&
        contrasena.length <= 128;
}
 
// Validar que la contraseña sea más fuerte.
function validarContrasenaSegura(contrasena) {
    return validarContrasena(contrasena) &&
        regexContrasenaSegura.test(contrasena);
}
 
// Validar que ambas contraseñas coincidan.
function validarConfirmacionContrasena(
    contrasena,
    confirmarContrasena
) {
    return typeof contrasena === "string" &&
        typeof confirmarContrasena === "string" &&
        contrasena === confirmarContrasena;
}
 
// Validar nombre y apellidos.
function validarNombre(nombre) {
    return typeof nombre === "string" &&
        nombre.trim().length >= 2 &&
        nombre.trim().length <= 80 &&
        regexNombre.test(nombre.trim());
}
 
// Validar que un campo obligatorio tenga contenido.
function validarCampoObligatorio(valor) {
    return typeof valor === "string" &&
        valor.trim().length > 0;
}
 
// Validar longitud máxima de cualquier texto.
function validarLongitud(valor, maximo = 100) {
    return typeof valor === "string" &&
        valor.trim().length > 0 &&
        valor.length <= maximo;
}
 
module.exports = {
    validarBoleta,
    validarContrasena,
    validarCorreo,
    validarContrasenaSegura,
    validarConfirmacionContrasena,
    validarNombre,
    validarCampoObligatorio,
    validarLongitud
};