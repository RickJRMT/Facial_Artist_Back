// Se importa la versión de mysql2 que trabaja con Promesas (mejor utilidad para async/await)
const mysql = require('mysql2/promise');

// Importar dotenv para manejar variables de entorno desde un archivo .env
const dotenv = require('dotenv'); // dotenv permite leer valores como usuario, contraseña o nombre de base de datos desde un archivo .env, y así evitar poner información sensible directamente en el código.

// Cargar las variables de entorno definidas en .env
dotenv.config(); // Esta línea lee el archivo .env y carga sus valores en process.env. Por ejemplo, process.env.DB_USER

// Se crea un "pool" de conexiones a la base de datos. createPool() crea un grupo de conexiones reutilizables, la cual es más eficiente que abrir y cerrar una conexión para cada consulta
const pool = mysql.createPool({
    host: process.env.DB_HOST,          // Host donde está la base de datos
    user: process.env.DB_USER,          // Usuario de la base de datos
    password: process.env.DB_PASSWORD,  // Contraseña de la base de datos
    database: process.env.DB_NAME,      // Nombre de la base de datos
    waitForConnections: true,           // Espera cuando todas las conexiones están ocupadas
    connectionLimit: 10,                // Límite de conexiones al mismo tiempo
    queueLimit: 0                       // No hay límite de espera en la cola
});
//  Las variables host, user, entre otras, vienen del archivo .env, lo que hace que el código sea más seguro y configurable

// Exportar el pool para usarlo en otros archivos del proyecto
module.exports = pool;