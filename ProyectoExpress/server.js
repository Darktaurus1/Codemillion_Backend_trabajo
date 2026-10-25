const express = require("express")
const talleres = require("./Controlador/talleres_controlador")
const asistencias = require("./Controlador/asistencia_controlador")
const usuarios = require("./Controlador/usuario_controlador")

const app = express()

app.use(express.json())

const PORT = 4000

//ejemplo de una peticion por medio de una ruta principal GET
app.get('/saludo', (req, res) => {
    res.json({mensaje: "Hola, esto es una prueba en GET"})
})

app.get("/", (req, res) => {
    res.json({mensaje: "API de Registro de Asistencia - CECyT 9 funcionando correctamente"})
})

//rutas para las consultas de talleres
app.get("/api/talleres", talleres.listarTalleres);
app.get("/api/talleres/:id", talleres.obtenerTaller)
app.post('/api/talleres', talleres.crearTaller);

//rutas para las consultas de asistencias
app.get("/api/talleres/:id/asistencias", asistencias.listarAsistenciasDeTaller)
app.post("/api/asistencias", asistencias.registrarAsistencia)

//rutas para las consultas de usuarios
app.get("/api/usuarios", usuarios.listarUsuarios)
app.get("/api/usuarios/:id", usuarios.obtenerUsuario)
app.post("/api/usuarios", usuarios.crearUsuario)
app.put("/api/usuarios/:id", usuarios.actualizarUsuario)
app.delete("/api/usuarios/:id", usuarios.eliminarUsuario)

app.post("/eco", (req, res) => {
    const {texto} = req.body
    if(!texto){
        return res.status(400).json({error: "El texto es obligatorio"})
    }
    res.status(201).json({eco: texto})
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})