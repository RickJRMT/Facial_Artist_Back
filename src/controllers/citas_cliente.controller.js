// Importa la configuración de conexión a la base de datos desde un archivo externo
const db = require('../config/conexion.db');

// Define una clase para manejar operaciones CRUD relacionadas con citas
class CrudControllerCitas {

    // Método asíncrono para crear una cita
    async crearCita(data) {
        // Obtiene una conexión desde el pool de conexiones
        const connection = await db.getConnection();

        try {
            // Inicia una transacción. Esto asegura que todos los cambios se hagan de forma atómica,
            // es decir, o todos se completan correctamente, o ninguno se guarda en la base de datos.
            await connection.beginTransaction();

            // Paso 1: Verificar si el cliente ya existe por su número de celular.
            // Se realiza una búsqueda en la base de datos usando el número de celular proporcionado.
            const [[cliente]] = await connection.query(
                `SELECT idCliente FROM Cliente WHERE celularCliente = ?`,
                [data.celularCliente]
            );

            // Si existe, se guarda su id para usarlo más adelante
            let idCliente = cliente?.idCliente;

            // Si el cliente NO existe, se crea un nuevo registro en la tabla Cliente
            if (!idCliente) {
                const [res] = await connection.query(
                    `INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente) VALUES (?, ?, ?)`,
                    [data.nombreCliente, data.celularCliente, data.fechaNacCliente]
                );
                // Se guarda el id generado automáticamente para el nuevo cliente
                idCliente = res.insertId;
            }

            // Paso 2: Obtener la duración del servicio seleccionado
            // Se consulta la tabla Servicios para obtener cuántos minutos dura el servicio
            const [[servicio]] = await connection.query(
                `SELECT servDuracion FROM Servicios WHERE idServicios = ?`,
                [data.idServicios]
            );

            // Si no se encuentra el servicio, se lanza un error (no se debe continuar)
            if (!servicio) {
                throw new Error('Servicio no encontrado');
            }

            // Se guarda la duración del servicio en minutos
            const duracionMinutos = servicio.servDuracion;

            // Paso 3: Calcular la hora de finalización (fin_cita)

            // Descompone la horaCita enviada por el frontend (ej. "13:00:00") en horas, minutos y segundos
            const [horas, minutos, segundos] = data.horaCita.split(':').map(Number);

            // Se crea un objeto Date con esos valores. El año, mes y día no importan porque solo se usará la hora.
            const fechaHoraInicio = new Date(0, 0, 0, horas, minutos, segundos);

            // Se suma a ese objeto la duración del servicio (en minutos), modificando la hora del objeto
            fechaHoraInicio.setMinutes(fechaHoraInicio.getMinutes() + duracionMinutos);

            // Extrae solo la hora de ese objeto Date resultante, en formato "HH:MM:SS"
            const finCita = fechaHoraInicio.toTimeString().split(' ')[0];

            // Paso 4: Insertar la nueva cita en la base de datos
            // Se insertan los datos de la cita, incluyendo la hora de inicio (horaCita) y hora de fin (fin_cita) ya calculada
            const [resCita] = await connection.query(
                `INSERT INTO Citas (idCliente, idServicios, idProfesional, fechaCita, horaCita, fin_cita) VALUES (?, ?, ?, ?, ?, ?)`,
                [idCliente, data.idServicios, data.idProfesional, data.fechaCita, data.horaCita, finCita]
            );

            // Finaliza la transacción, guardando todos los cambios realizados hasta ahora
            await connection.commit();

            // Devuelve un objeto con los datos de la cita creada, incluyendo:
            // - el id de la cita generada automáticamente
            // - el id del cliente
            // - todos los datos originales recibidos
            // - la hora de fin calculada
            return {
                idCita: resCita.insertId,
                idCliente,
                ...data,
                finCita
            };

        } catch (error) {
            // Si ocurre un error en cualquier parte del proceso, se revierte la transacción
            await connection.rollback();
            // El error se propaga para que el controlador superior lo maneje (por ejemplo, para mostrar un mensaje)
            throw error;
        } finally {
            // Libera la conexión, devolviéndola al pool para que pueda ser reutilizada
            connection.release();
        }
    }
}

// Exporta la clase para que pueda ser utilizada en rutas u otros controladores
module.exports = CrudControllerCitas;
