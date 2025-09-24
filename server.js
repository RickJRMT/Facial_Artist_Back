// Se importa la configuración principal de la aplicación desde el archivo app.js ubicado en la carpeta src
const app = require('./src/app');

// Se cargan las variables de entorno definidas en el archivo .env
require('dotenv').config();

// Se define el puerto en el que se ejecutará el servidor. Si no hay una variable de entorno PORT, usará el 3000 por defecto
const PORT = process.env.PORT || 3000;

// Se inicia el servidor en el puerto especificado y muestra un mensaje en consola cuando esté corriendo correctamente
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});