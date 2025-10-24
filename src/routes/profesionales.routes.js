// const express = require('express');

// const router = express.Router();
// const crudgenericoController = require('../controllers/crud.controller'); 

// const tabla = 'Profesional';

// router.get('/', async (req, res) => {
//     try {
//         //utilizar el método obtener todos los datos del controlador para obtener todos los registros 
//         const profesionales = await crudgenericoController.obtenerTabla(tabla);
//         //Respuesta con el arreglo de personas en formato JSON
//         res.json(profesionales);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// module.exports = router;

const express = require('express');
const router = express.Router();
const ProfesionalesController = require('../controllers/profesionales.controller'); // Nuevo import

// GET / (todos, usando controller ahora para consistencia)
router.get('/', ProfesionalesController.getAll);

// GET /:id
router.get('/:id', ProfesionalesController.getById);

// POST /
router.post('/', ProfesionalesController.create);

// PUT /:id
router.put('/:id', ProfesionalesController.update);

// DELETE /:id
router.delete('/:id', ProfesionalesController.delete);

module.exports = router;