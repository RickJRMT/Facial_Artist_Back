const db = require('../config/conexion.db');

class CrudControllerCitas {
    //obtener todos los registros de una tabla
    async obtenerTodos(tabla) {
        try {
            //Realiza una consulta SQL para seleccionar todos los registros de la tabla indicada
            const [resultados] = await db.query(`SELECT * FROM ${tabla}`);
            return resultados; //devuelve  el array de los resultados
        } catch (error) {
            throw error;
        }
    }
    //Metodo para obtener un único registro por su ID 
    async obtenerUno(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            return resultado[0];
        } catch (error) {
            throw error;
        }
    }
    //Este método remplazará el generico de crear tabla, dado que se creará la logica para insertar datos del cliente
    async crearCita(data) {
        // una transacción necesita ejecutarse en una única conexión dedicada, no en múltiples conexiones del pool.
        let connection = await db.getConnection();
        try {
            // inicializamos una transacción
            await connection.beginTransaction();
            // Buscar cliente por celular mediante el objeto "data"
            // vamos a colocar dos corchetes: el primero desestrucgura el array de rows y el segundo de la primera fila.
            // el cliente estará con dos corchetes porque se va a desestructurar, ya que la consulta devuelve un array y un objeto
            const [[cliente]] = await connection.query(
                `SELECT idCliente FROM Cliente WHERE celularCliente = ?`,
                [data.celularCliente]
            );
            // si el cliente existe, toma su propiedad idCliente y guardala en la variable "idCliente"
            let idCliente = cliente?.idCliente;
            // Insertar cliente si no existe
            if (!idCliente) {
                const [res] = await connection.query(
                    `INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente) VALUES (?, ?, ?)`,
                    [data.nombreCliente, data.celularCliente, data.fechaNacCliente]
                );
                idCliente = res.insertId;
            }
            // Insertar cita
            const [resCita] = await connection.query(
                `INSERT INTO Cita (idCliente, idProfesional, idHorario, fechaCita, horaCita) VALUES (?, ?, ?, ?, ?)`,
                [idCliente, data.idProfesional, data.idHorario, data.fechaCita, data.horaCita]
            );
            // Esto finaliza la transacción y guarda todos los cambios realizados en la base de datos.
            await connection.commit();
            return {
                idCita: resCita.insertId,
                idCliente,
                ...data
            };
        } catch (error) {
            // el rollback permite restablecer los datos
            await connection.rollback();
            throw error;
        } finally {
            // para liberar la conexión
            connection.release();
        }
    }
    //Método para actualizar un registro existente
    async actualizar(tabla, idCampo, id, data) {
        try {
            //ejecuta una consulta UPDATE con los datos nuevos 
            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data, idCampo, id]);
            //Si no se afecto ninguna fila, es que el registro no existia
            if (resultado.affectedRows === 0) {
                throw new error('registro no encontrado');
            }

            //devuelve el registro actualizado 
            return await this.obtenerUno(tabla, idCampo, id);
        } catch (error) {
            throw error;
        }
    }

    //Método para eliminar un registro 
    async eliminar(tabla, idCampo, id) {
        try {
            //ejecuta la eliminación del registro 
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            //Si no se elimino ninguna fila, es que el id no existe
            if (resultado.affectedRows === 0) {
                throw new error('Registro no encontrado');
            }
            //devuelve un mensaje de exito
            return { mensaje: 'registro eliminado correctamente' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CrudControllerCitas; 