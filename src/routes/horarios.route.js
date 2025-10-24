const express = require('express');
const router = express.Router();
const HorariosController = require('../controllers/horarios.controller');
const crudgenericoController = require('../controllers/crud.controller');
const tabla = 'horarios';

// GET
router.get('/profesional/:id', HorariosController.getHorariosByProfesional);

// GET: horarios para visualizar en insomnia
router.get('/', async (req, res) => {
    try {
        //utilizar el método obtener todos los datos del controlador para obtener todos los registros 
        const horarios = await crudgenericoController.obtenerTabla(tabla);
        //Respuesta con el arreglo de personas en formato JSON
        res.json(horarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST
router.post('/', HorariosController.createHorario);

// PUT
router.put('/:id', HorariosController.updateHorario);

module.exports = router;