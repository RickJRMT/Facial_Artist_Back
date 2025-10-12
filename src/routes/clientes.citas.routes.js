const express = require('express');

const router = express.Router();

const CrudControllerCitas = require('../controllers/citas_cliente.controller');
const crudgenericoController = require('../controllers/crud.controller'); 

// se crea una nueva instancia para utilizar los metodos 
const crudCitas = new CrudControllerCitas();

//se define el nombre de la tabla en la base de datos sobre la que se operará
const tabla = 'Citas';

//Se define el nombre del campo identificador único de la  tabla 
const idCampo = 'idCita';

//Ruta para obtener todos los registros de citas 

router.get('/', async (req, res) => {
    try {
        //utilizar el método obtener todos los datos del controlador para obtener todos los registros 
        const citas = await crudgenericoController.obtenerTabla(tabla); 
        //Respuesta con el arreglo de personas en formato JSON
        res.json(citas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//ruta para obtener una cita especifica por su id

router.get('/:id', async (req, res) => {
    try {
        const cita = await crudgenericoController.obtenerTablaId(tabla, idCampo, req.params.id);
        //respuesta con los datos de la cita en formato JSON 
        res.json(cita);
    } catch (error) {
        //manejar errores de servidor
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const nuevaCita = await crudCitas.crearCita(req.body);
        res.status(201).json(nuevaCita);
    } catch (error) {
        console.error('Error en creación de cita:', error);
        res.status(500).json({ error: error.message });
    }
});


//Ruta para  actualizar una cita existente por id
router.put('/:id', async (req, res) => {
    try {
        const citaActualizada = await crudgenericoController.actualizar(tabla, idCampo, req.params.id, req.body);
        //respuesta con el registro actualizado 
        res.json(citaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//ruta para eliminar una persona de la base de datos por id
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await  crudgenericoController.eliminar(tabla, idCampo, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Se creará esté endpoint para obtener los horarios disponibles 
router.post('/disponibilidad', async (req, res) => {
  try {
    const horarios = await crudCitas.obtenerHorariosDisponibles(req.body);
    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
