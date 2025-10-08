const db = require('../config/conexion.db');

class CrudControllerCitas {
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
                `INSERT INTO Citas (idCliente, idProfesional, idHorario, fechaCita, horaCita) VALUES (?, ?, ?, ?, ?)`,
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
}

module.exports = CrudControllerCitas; 