const bcrypt = require('bcryptjs');
const asistenciaModel = require ('../Modelo/asistencia_modelo.js');





async function registrarasistencia(req, res) {
    try{
        return asistenciaModel.registrarAsistencia(req);
    } catch (error) {
        res.status(500).json({error: errormessage})
    }
}

async function consultarAsistencia(req, res){
    try{
        const asistencia = await asistencia.consultarAsistenciaTaller(req.param.id);
        if(!asistencia) return res.status(404).json({error : 'taller no encontrado'});
        res.json(asistencia);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}