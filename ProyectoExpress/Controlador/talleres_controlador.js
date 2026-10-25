const bcrypt = require('bcryptjs');

const TalleresModel = require('../Modelo/talleres_modelo');

async function listarTalleres(req, res){
    try{
        const talleres = await TalleresModel.listar();
        res.json(talleres);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
    
}
async function obtenerTaller(req, res) {
    try{
        const taller = await TalleresModel.obtenerPorId(req.params.id);
        if(!taller) return res.status(404).json({error : 'Taller no encontrado'});
        res.json(taller);
    } catch (error){
        res.status(500).json({error: error.message});
    }
}
async function registrarAlumno(req, res) {
    try {
        const nuevoRegistro = await TalleresModel.registrarAlumnoTaller(req.body);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function crearTaller(req, res) {
    const {nombre, instructor, fecha, cupo} = req.body
    if(!nombre || !fecha){
        return res.status(400).json({error: "nombre y fecha son obligatorios"})
    }
    try{
        const taller = await TalleresModel.crear({nombre, instructor, fecha, cupo})
        res.status(201).json(taller)
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {listarTalleres, obtenerTaller, registrarAlumno, crearTaller};