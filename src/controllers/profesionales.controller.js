const db = require('../config/conexion.db');


class CrudControllerProfesionales {

    async obtenerTodosProfesionales(tabla) {
        try {
            //Realiza una consulta SQL para seleccionar todos los registros de la tabla indicada
            const [resultados] = await db.query(`SELECT * FROM ${tabla}`);
            return resultados; //devuelve  el array de los resultados
        } catch (error) {
            throw error;
        }
    }
}
module.exports = CrudControllerProfesionales; 
