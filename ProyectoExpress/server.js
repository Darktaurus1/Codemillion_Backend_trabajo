const expresss = require('express');

const app = expresss();

app.use(expresss.json());

const PORT = 4000;

//Ejemplo de una peticion por medio de ruta principal GET
app.get('/saludo', (req, res)=>{
    res.json({mensaje:'Hola esto es una prueba en GET'});
});

app.post('/eco', (req, res)=>{
    const {texto} = req.body;
    if(!texto){
        return res.status(400).json({error:'El texto es obligatorio'});
    }
    res.status(201).json({eco:texto});
});

app.listen(PORT, () =>{
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
});
app.get("/", (req, res) => {
    res.json({mensaje: "API de Registro de Asistencia - CECyT 9 funcionando correctamente"})
})

//rutas para las consultas de talleres
app.get("/api/talleres", talleres.listarTalleres);
app.get("/api/talleres/:id", talleres.obtenerTaller);
app.post('/api/talleres', talleres.crearTaller);

//rutas para las consultas de asistencias
app.get("/api/talleres/:id/asistencias", asistencias.listarAsistenciasDeTaller);
app.post("/api/asistencias", asistencias.registrarAsistencia);

//rutas para las consultas de usuarios
app.get("/api/usuarios", usuarios.listarUsuarios);
app.get("/api/usuarios/:id", usuarios.obtenerUsuario);
app.post("/api/usuarios", usuarios.crearUsuario);
app.put("/api/usuarios/:id", usuarios.actualizarUsuario);
app.delete("/api/usuarios/:id", usuarios.eliminarUsuario);