const express = require('express');
const router = express.Router();
const CitasProfesionalController = require('../controllers/citas_profesional.controller');

// GET /api/citas-profesional/profesional/:id
router.get('/profesional/:id', CitasProfesionalController.getCitasByProfesional);

// GET /api/citas-profesional/stats (opcional ?id=1 para filtrar por pro)
router.get('/stats', CitasProfesionalController.getEstadisticasCitas);

module.exports = router;