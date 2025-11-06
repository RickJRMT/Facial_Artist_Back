const express = require('express');
const router = express.Router();
const clienteController = require( '../controllers/clientes.controller.js');


router.get('/', clienteController.obtenerClientes);
router.get('/:id', clienteController.obtenerClientePorId);

module.exports = router;
