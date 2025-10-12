// Importamos la configuración de la base de datos para poder hacer consultas
const db = require('../config/conexion.db');
// Importamos moment para manejar fechas y horas de forma sencilla y confiable
const moment = require('moment');

class CrudControllerCitas {
    // Método para crear una cita nueva, recibe un objeto 'data' con todos los datos necesarios para la cita
    async crearCita(data) {
        // Obtenemos una conexión a la base de datos (del pool de conexiones)
        const connection = await db.getConnection();
        try {
            // Validamos que todos los campos obligatorios estén presentes en 'data'
            // Esto evita errores posteriores si falta algún dato esencial
            const camposRequeridos = [
                'nombreCliente',    // Nombre del cliente que agenda la cita
                'celularCliente',   // Celular del cliente (usado para identificarlo)
                'fechaNacCliente',  // Fecha de nacimiento del cliente (para guardarla si es nuevo)
                'idProfesional',    // ID del profesional que atenderá la cita
                'idServicios',      // ID del servicio que se va a realizar
                'fechaCita',        // Fecha de la cita en formato YYYY-MM-DD
                'horaCita',         // Hora de la cita en formato HH:mm:ss (24 horas)
            ];
            // Recorremos cada campo para verificar que existe en 'data'
            for (const campo of camposRequeridos) {
                if (!data[campo]) {
                    // Si falta alguno, lanzamos un error para detener el proceso
                    throw new Error(`Falta el campo obligatorio: ${campo}`);
                }
            }

            // Iniciamos una transacción para que todas las consultas sean atómicas
            // Si algo falla, podemos hacer rollback y no guardar datos parciales
            await connection.beginTransaction();

            // Buscamos en la tabla Cliente si ya existe un cliente con ese número de celular
            // La consulta devuelve un array con resultados; el doble corchete es porque usamos desestructuración para obtener el primer resultado
            const [[cliente]] = await connection.query(
                `SELECT idCliente FROM Cliente WHERE celularCliente = ?`,
                [data.celularCliente]
            );
            // Si existe, guardamos su idCliente; si no, idCliente quedará undefined
            let idCliente = cliente?.idCliente;

            // Si el cliente no existe, lo insertamos en la tabla Cliente con los datos recibidos
            if (!idCliente) {
                const [res] = await connection.query(
                    `INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente) VALUES (?, ?, ?)`,
                    [data.nombreCliente, data.celularCliente, data.fechaNacCliente]
                );
                // Guardamos el nuevo id generado para el cliente (insertId es el id autoincremental creado)
                idCliente = res.insertId;
            }

            // Ahora consultamos la duración del servicio solicitado para poder calcular la hora final de la cita
            const [[servicio]] = await connection.query(
                `SELECT servDuracion FROM Servicios WHERE idServicios = ?`,
                [data.idServicios]
            );
            if (!servicio) {
                // Si no existe ese servicio, lanzamos error para informar que el id es inválido
                throw new Error('Servicio no encontrado');
            }

            // Convertimos la duración del servicio (que puede venir como string) a número entero en base 10
            // Es importante especificar base 10 para evitar interpretaciones erróneas (por ejemplo, como octal)
            const duracionMinutos = parseInt(servicio.servDuracion, 10);

            // Aquí usamos moment para manejar la hora de inicio de la cita:
            // 'data.horaCita' viene como string, ej "14:30:00", y lo parseamos con formato "HH:mm:ss"
            const horaCitaMoment = moment(data.horaCita, 'HH:mm:ss');

            // Usamos '.clone()' para copiar el objeto moment y evitar mutar el original
            // Luego le sumamos la duración del servicio en minutos para calcular la hora en que termina la cita
            const finCitaMoment = horaCitaMoment.clone().add(duracionMinutos, 'minutes');

            // Formateamos la hora final en string "HH:mm:ss" para guardarla en la base de datos
            const finCita = finCitaMoment.format('HH:mm:ss');

            // Validamos que no exista otra cita para el mismo profesional y fecha que se solape con el nuevo horario
            // La consulta busca citas cuyo intervalo (horaCita - fin_cita) se cruza con el intervalo nuevo
            const [citas] = await connection.query(
                `SELECT * FROM Citas WHERE idProfesional = ? AND fechaCita = ? AND fin_cita IS NOT NULL AND (
                    (horaCita < ? AND fin_cita > ?)
                )`,
                [data.idProfesional, data.fechaCita, finCita, data.horaCita]
            );

            // Si hay citas que se solapan, no permitimos crear la nueva cita
            if (citas.length > 0) {
                throw new Error('El horario seleccionado no está disponible');
            }

            // Insertamos la nueva cita en la base de datos con todos los datos y la hora de fin calculada
            const [resCita] = await connection.query(
                `INSERT INTO Citas (idCliente, idServicios, idProfesional, fechaCita, horaCita, fin_cita) VALUES (?, ?, ?, ?, ?, ?)`,
                [idCliente, data.idServicios, data.idProfesional, data.fechaCita, data.horaCita, finCita]
            );

            // Confirmamos la transacción para guardar todo permanentemente
            await connection.commit();

            // Retornamos la información de la cita creada, incluyendo el id generado
            return {
                idCita: resCita.insertId, // Id autogenerado de la cita
                idCliente,                // Id del cliente (nuevo o existente)
                ...data,                  // Todos los datos recibidos en la petición
                finCita,                  // Hora final calculada de la cita
            };
        } catch (error) {
            // Si hay algún error, deshacemos todo lo hecho en la transacción
            await connection.rollback();
            // Re-lanzamos el error para que pueda ser manejado por la capa superior (ejemplo: controlador o middleware)
            throw error;
        } finally {
            // Liberamos la conexión para que pueda ser usada por otras consultas
            connection.release();
        }
    }

    // Método para obtener los horarios disponibles para un profesional, en una fecha y servicio dados
    async obtenerHorariosDisponibles(data) {
        const connection = await db.getConnection();
        try {
            // Extraemos los datos necesarios del objeto 'data'
            const { idProfesional, fechaCita, idServicios } = data;

            // Validamos que los datos obligatorios estén presentes
            if (!idProfesional || !fechaCita || !idServicios) {
                throw new Error('Faltan datos: idProfesional, fechaCita o idServicios');
            }

            // Validamos que 'fechaCita' tenga formato correcto (YYYY-MM-DD)
            // Usamos moment con tercer parámetro 'true' para validación estricta
            if (!moment(fechaCita, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Formato de fechaCita inválido, debe ser YYYY-MM-DD');
            }

            // Obtenemos el horario laboral del profesional (hora de inicio y fin)
            const [[profesional]] = await connection.query(
                `SELECT hora_inicio, hora_fin FROM Profesional WHERE idProfesional = ?`,
                [idProfesional]
            );
            if (!profesional) {
                throw new Error(`Profesional no encontrado para id ${idProfesional}`);
            }

            // Creamos objetos moment para la hora de inicio y fin, combinando la fecha y hora
            // Esto permite hacer operaciones y comparaciones entre fechas/horas
            const horaInicio = moment(`${fechaCita} ${profesional.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
            const horaFin = moment(`${fechaCita} ${profesional.hora_fin}`, 'YYYY-MM-DD HH:mm:ss');

            // Validamos que los horarios sean válidos y que la hora de inicio sea antes que la de fin
            if (!horaInicio.isValid() || !horaFin.isValid() || horaInicio >= horaFin) {
                throw new Error('Horario inválido del profesional');
            }

            // Consultamos la duración del servicio para saber cuánto dura cada cita
            const [[servicio]] = await connection.query(
                `SELECT servDuracion FROM Servicios WHERE idServicios = ?`,
                [idServicios]
            );
            if (!servicio) {
                throw new Error(`Servicio no encontrado para id ${idServicios}`);
            }

            // Convertimos la duración a número entero en minutos
            const duracionMinutos = parseInt(servicio.servDuracion, 10);
            if (duracionMinutos <= 0) {
                throw new Error(`Duración del servicio inválida: ${duracionMinutos} minutos`);
            }

            // Creamos un array para guardar los intervalos (slots) de horarios disponibles
            const slots = [];
            // Empezamos desde la hora de inicio
            let current = horaInicio.clone();

            // Iteramos mientras 'current' sea menor que la hora fin del horario laboral
            while (current < horaFin) {
                // Creamos un slot desde la hora 'current' hasta 'current + duracionMinutos'
                const slotInicio = current.clone();
                const slotFin = current.clone().add(duracionMinutos, 'minutes');

                // Si el slot se pasa del horario laboral, dejamos de iterar
                if (slotFin > horaFin || slotFin <= slotInicio) break;

                // Consultamos en la tabla Citas si existe alguna cita que se cruce con este slot
                const [citas] = await connection.query(
                    `SELECT idCita FROM Citas
                    WHERE idProfesional = ? AND fechaCita = ? AND fin_cita IS NOT NULL AND (
                        (horaCita < ? AND fin_cita > ?) OR
                        (horaCita >= ? AND horaCita < ?)
                    )`,
                    [
                        idProfesional,
                        fechaCita,
                        slotFin.format('HH:mm:ss'),
                        slotInicio.format('HH:mm:ss'),
                        slotInicio.format('HH:mm:ss'),
                        slotFin.format('HH:mm:ss'),
                    ]
                );

                // Si no hay citas que bloqueen el slot, lo agregamos a la lista de horarios disponibles
                if (citas.length === 0) {
                    slots.push({
                        horaInicio: slotInicio.format('h:mm A'),        // Hora en formato 12h (ej. 2:30 PM) para mostrar en UI
                        horaFin: slotFin.format('h:mm A'),               // Igual para hora fin
                        horaInicio24: slotInicio.format('HH:mm:ss'),    // Hora en formato 24h (ej. 14:30:00) para uso interno
                    });
                }

                // Avanzamos la variable `current` en la cantidad de minutos que dura el servicio,
                // para calcular el siguiente posible intervalo (slot) de cita.
                // Esto permite que los horarios disponibles se ajusten exactamente al tiempo que dura cada servicio,
                // evitando solapamientos y garantizando que cada cita tenga su tiempo completo asignado.
                // Así, por ejemplo, si el servicio dura 60 minutos, después de un slot de 9:00 a 10:00,
                // el próximo slot empezará a las 10:00.
                // Esto hace que los horarios sean consecutivos y sin huecos innecesarios.
                current.add(duracionMinutos, 'minutes');
            }

            // Devolvemos el array de slots disponibles
            return slots;
        } catch (error) {
            // En caso de error, imprimimos en consola para debugging y re-lanzamos el error
            console.error('Error en obtenerHorariosDisponibles:', error);
            throw error;
        } finally {
            // Liberamos la conexión a la base de datos
            connection.release();
        }
    }
}

module.exports = CrudControllerCitas;
