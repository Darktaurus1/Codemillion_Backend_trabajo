const bcrypt = require('bcryptjs');
const talleresModel = require ('../Modelo/talleres_modelo.js');

async function registarAlumno(req, res) {
   try{
        return asistenciaModel.registrarAlumnoTaller(req, res);
    } catch (error) {
        res.status(500).json({error: errormessage})
    }
}

async function listarTalleres() {
     try{
            const Talleres = await talleresModel.listarTalleres();
            res.json(Talleres);
        }catch{
            res.status(500).json({error: error.message});
        }
}