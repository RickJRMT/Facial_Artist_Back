const express = require('express');
// Importa el framework Express para crear el servidor

const cors = require('cors');
// Importa CORS para permitir solicitudes desde otros dominios (muy útil cuando el frontend y backend están separados)

const app = express();
// Crear una instancia de aplicación Express

const imagenesRoutes = require('../src/routes/imagenes.routes');
// Importar las rutas para el manejo de imágenes desde el archivo correspondiente

const cursosRoutes = require('../src/routes/cursos.routes');
// Importar las rutas para el manejo de cursos desde el archivo correspondiente

const hvRoutes = require('../src/routes/hv.routes');
// Importar las rutas para el manejo de hv desde el archivo correspondiente

const serviciosRoutes = require('../src/routes/servicios.routes');
// Importar las rutas para el manejo de servicios desde el archivo correspondiente

const clientesRoutes = require('../src/routes/Clientes.routes');

// const horariosRoutes = require('../src/routes/horarios.routes');
// // Importar las rutas para el manejo de horarios desde el archivo correspondiente

// Middleware
app.use(cors());
// Habilita los CORS (permite que el servidor reciba peticiones desde otros orígenes)

app.use(express.json({ limit: '50mb' }));
// Permite recibir datos en formato JSON, estableciendo un límite de 50MB (ideal para datos grandes como imagenes en base64)

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Permite recibir datos codificados desde formularios (como los enviados por POST desde HTML), también con límite de 50MB

// middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ succes: false, message: 'Error interno' });
});

// Rutas
app.use('/api/imagenes', imagenesRoutes);
// Asocia todas las rutas de imágenes bajo el prefijo de /api/imagenes

app.use('/api/cursos', cursosRoutes);
// Asocia todas las rutas de cursos bajo el prefijo de /api/cursos

app.use('/api/hv', hvRoutes);
// Asocia todas las rutas de hv bajo el prefijo de /api/hv

app.use('/api/cliente', clientesRoutes);

app.use('/api/servicios', serviciosRoutes);
// Asocia todas las rutas de servicios bajo el prefijo de /api/servicios

// asocia todas las rutas de citas con el prefijo de : "/api/citas"
app.use('/api/citas', require('./routes/clientes.citas.routes'));

// asocia todas las rutas de profesionales con el prefijo de : "/api/profesionales"
app.use('/api/profesional', require('./routes/profesionales.routes'));

app.use('/api/adminCitas', require('./routes/admin.citas.routes'));

app.use('/api/horarios', require('./routes/horarios.route'));

app.use('/api/citas-profesional', require('./routes/citas_profesional.routes'));

module.exports = app;
// Exporta la app configurada para ser utilizada por el archivo principal del servidor (en este caso el archivo server.js)
