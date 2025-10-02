const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursos.controller');

router.post('/', cursosController.crearCurso);
router.get('/', cursosController.obtenerCurso);
router.get('/:id', cursosController.obtenerCursoPorId);
router.put('/:id', cursosController.actualizarCurso);
router.delete('/:id', cursosController.eliminarCurso);

module.exports = router;