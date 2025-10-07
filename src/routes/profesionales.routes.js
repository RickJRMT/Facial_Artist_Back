const express = require('express');

const router = express.Router();

const CrudControllerProfesionales = require('../controllers/profesionales.controller'); 

const crudProfesionales = new CrudControllerProfesionales();


const tabla = 'Profesional';

router.get('/', async (req, res) => {
    try {
        //utilizar el método obtener todos los datos del controlador para obtener todos los registros 
        const profesionales = await crudProfesionales.obtenerTodosProfesionales(tabla);
        //Respuesta con el arreglo de personas en formato JSON
        res.json(profesionales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router; 