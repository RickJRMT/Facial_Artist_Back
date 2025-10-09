const express = require('express');
const router = express.Router();
const HorariosController = require('../controllers/horarios.controller'); // Ajusta la ruta

// Middleware global para este router (opcional, para JSON parsing)
router.use(express.json({ limit: '1mb' }));
router.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rutas directas al controlador
router.get('/', HorariosController.obtenerTodos);
router.get('/:id', HorariosController.obtenerPorId);
router.post('/', HorariosController.crear);
router.put('/:id', HorariosController.actualizar);
router.delete('/:id', HorariosController.eliminar);

module.exports = router;