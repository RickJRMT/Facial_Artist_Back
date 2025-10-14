// Se requiere la conexión a la base de datos y la librería moment para trabajar con fechas y horas.
const db = require('../config/conexion.db');
const moment = require('moment');

class CrudControllerCitas {
    // Método para crear una cita nueva, recibe un objeto 'data' con todos los datos necesarios para la cita
    async crearCita(data) {
        // Establecemos la conexión con la base de datos
        const connection = await db.getConnection();
        try {
            // Validamos que todos los campos obligatorios estén presentes en 'data'
            const camposRequeridos = [
                'nombreCliente', // Nombre del cliente
                'celularCliente', // Celular del cliente
                'fechaNacCliente', // Fecha de nacimiento del cliente
                'idProfesional', // ID del profesional que realizará el servicio
                'idServicios', // ID del servicio que se quiere realizar
                'fechaCita', // Fecha de la cita
                'horaCita', // Hora de la cita
            ];
            // Iteramos sobre los campos requeridos y comprobamos que estén presentes en los datos
            for (const campo of camposRequeridos) {
                if (!data[campo]) {
                    // Si falta algún campo obligatorio, lanzamos un error
                    throw new Error(`Falta el campo obligatorio: ${campo}`);
                }
            }

            // Iniciamos una transacción para garantizar la consistencia de los datos.
            await connection.beginTransaction();

            // Buscamos si el cliente ya existe en la base de datos (buscamos por celular)
            const [[cliente]] = await connection.query(
                `SELECT idCliente FROM Cliente WHERE celularCliente = ?`,
                [data.celularCliente]
            );
            let idCliente = cliente?.idCliente; // Si el cliente existe, obtenemos su ID.

            // Si el cliente no existe, lo insertamos en la base de datos
            if (!idCliente) {
                const [res] = await connection.query(
                    `INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente) VALUES (?, ?, ?)`,
                    [data.nombreCliente, data.celularCliente, data.fechaNacCliente]
                );
                idCliente = res.insertId; // Obtenemos el ID del nuevo cliente insertado.
            }

            // Obtenemos la duración del servicio seleccionado
            const [[servicio]] = await connection.query(
                `SELECT servDuracion FROM Servicios WHERE idServicios = ?`,
                [data.idServicios]
            );
            if (!servicio) {
                throw new Error('Servicio no encontrado'); // Si no existe el servicio, lanzamos un error
            }

            // Convertimos la hora de la cita en un objeto moment y calculamos la hora de fin
            const duracionMinutos = parseInt(servicio.servDuracion, 10); // Duración en minutos
            const horaCitaMoment = moment(data.horaCita, 'HH:mm:ss'); // Hora de la cita como un objeto moment
            const finCitaMoment = horaCitaMoment.clone().add(duracionMinutos, 'minutes'); // Clonamos la hora y le sumamos la duración
            const finCita = finCitaMoment.format('HH:mm:ss'); // Convertimos el objeto moment de fin de cita a formato 'HH:mm:ss'

            // Validamos si el horario solicitado para la cita ya está ocupado
            const [citas] = await connection.query(
                `SELECT * FROM Citas WHERE idProfesional = ? AND fechaCita = ? AND fin_cita IS NOT NULL AND (
                    (horaCita < ? AND fin_cita > ?)
                )`,
                [data.idProfesional, data.fechaCita, finCita, data.horaCita]
            );

            if (citas.length > 0) {
                // Si ya hay citas que se solapan con el horario deseado, lanzamos un error
                throw new Error('El horario seleccionado no está disponible');
            }

            // Insertamos la cita en la base de datos
            const [resCita] = await connection.query(
                `INSERT INTO Citas (idCliente, idServicios, idProfesional, fechaCita, horaCita, fin_cita, numeroReferencia) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [idCliente, data.idServicios, data.idProfesional, data.fechaCita, data.horaCita, finCita, data.numeroReferencia]
            );

            // Si todo ha salido bien, confirmamos la transacción
            await connection.commit();

            // Devolvemos los datos de la cita creada, incluyendo el ID de la cita y la hora de fin
            return {
                idCita: resCita.insertId,
                idCliente,
                ...data,
                finCita,
            };
        } catch (error) {
            // Si ocurre un error, deshacemos la transacción para no dejar datos inconsistentes
            await connection.rollback();
            throw error; // Lanzamos el error para que lo maneje el controlador de errores
        } finally {
            // Liberamos la conexión a la base de datos
            connection.release();
        }
    }

    // Método para obtener los horarios disponibles para un profesional, en una fecha y servicio dados
    async obtenerHorariosDisponibles(data) {
        const connection = await db.getConnection();
        try {
            const { idProfesional, fechaCita, idServicios } = data;

            // Validamos que los datos requeridos estén presentes
            if (!idProfesional || !fechaCita || !idServicios) {
                throw new Error('Faltan datos: idProfesional, fechaCita o idServicios');
            }

            // Validamos que la fecha de la cita esté en formato correcto 'YYYY-MM-DD'
            if (!moment(fechaCita, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Formato de fechaCita inválido, debe ser YYYY-MM-DD');
            }

            // Consultamos los horarios disponibles para el profesional en la fecha solicitada
            const [horarios] = await connection.query(
                `SELECT hora_inicio, hora_fin FROM Horarios WHERE idProfesional = ? AND fecha = ? AND estado = 'activo'`,
                [idProfesional, fechaCita]
            );

            let horaInicio, horaFin;

            // Si no hay horarios específicos para ese día, usamos los horarios predeterminados del profesional
            if (!horarios || horarios.length === 0) {
                console.log('No se encontraron horarios en Horarios, consultando horarios predeterminados');
                const [[profesional]] = await connection.query(
                    `SELECT horainiciodef, horafindef FROM Profesional WHERE idProfesional = ?`,
                    [idProfesional]
                );

                if (!profesional) {
                    throw new Error('Profesional no encontrado');
                }

                // Validamos si existen horarios predeterminados configurados para el profesional
                if (!profesional.horainiciodef || !profesional.horafindef) {
                    throw new Error('El profesional no tiene horarios predeterminados configurados');
                }

                // Convertimos los horarios predeterminados en objetos moment para compararlos
                horaInicio = moment(`${fechaCita} ${profesional.horainiciodef}`, 'YYYY-MM-DD HH:mm:ss');
                horaFin = moment(`${fechaCita} ${profesional.horafindef}`, 'YYYY-MM-DD HH:mm:ss');
                console.log('Horarios predeterminados:', { horaInicio: horaInicio.format('HH:mm:ss'), horaFin: horaFin.format('HH:mm:ss') });
            } else {
                // Si encontramos horarios disponibles, los convertimos en objetos moment
                const horario = horarios[0];
                horaInicio = moment(`${fechaCita} ${horario.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
                horaFin = moment(`${fechaCita} ${horario.hora_fin}`, 'YYYY-MM-DD HH:mm:ss');
            }

            // Validamos que los horarios de inicio y fin sean válidos
            if (!horaInicio.isValid() || !horaFin.isValid() || horaInicio >= horaFin) {
                throw new Error('Horario inválido');
            }

            // Consultamos la duración del servicio
            const [[servicio]] = await connection.query(
                `SELECT servDuracion FROM Servicios WHERE idServicios = ?`,
                [idServicios]
            );
            if (!servicio) {
                throw new Error(`Servicio no encontrado para id ${idServicios}`);
            }

            const duracionMinutos = parseInt(servicio.servDuracion, 10);
            if (duracionMinutos <= 0) {
                throw new Error(`Duración del servicio inválida: ${duracionMinutos} minutos`);
            }

            // Generamos los slots de horarios disponibles
            const slots = [];
            let current = horaInicio.clone(); // Clonamos la hora de inicio para evitar modificarla

            // Creamos intervalos de tiempo (slots) disponibles para la cita
            while (current < horaFin) {
                const slotInicio = current.clone();
                const slotFin = current.clone().add(duracionMinutos, 'minutes');

                // Si el slot de fin es mayor que el horario de fin, o menor que el inicio, salimos del bucle
                if (slotFin > horaFin || slotFin <= slotInicio) break;


                // Validamos que no haya citas que ya ocupen el horario propuesto
                const [citas] = await connection.query(
                    `SELECT idCita FROM Citas
                    WHERE idProfesional = ? AND fechaCita = ? AND fin_cita IS NOT NULL AND (
                        (horaCita < ? AND fin_cita > ?) OR
                        (horaCita >= ? AND horaCita < ?)
                    )`,
                    [
                        idProfesional, // ID del profesional que realiza el servicio
                        fechaCita, // Fecha de la cita
                        slotFin.format('HH:mm:ss'), // Hora de fin del slot
                        slotInicio.format('HH:mm:ss'), // Hora de inicio del slot
                        slotInicio.format('HH:mm:ss'), // Hora de inicio del slot (para comparación)
                        slotFin.format('HH:mm:ss') // Hora de fin del slot (para comparación)
                    ]
                );

                // Si no hay citas para ese slot, lo agregamos a la lista de slots disponibles
                if (citas.length === 0) {
                    slots.push({
                        horaInicio: slotInicio.format('h:mm A'), // Hora de inicio del slot en formato 'h:mm AM/PM'
                        horaFin: slotFin.format('h:mm A'), // Hora de fin del slot en formato 'h:mm AM/PM'
                        horaInicio24: slotInicio.format('HH:mm:ss'), // Hora de inicio del slot en formato de 24 horas 'HH:mm:ss'
                    });
                }

                // Movemos el "current" para crear el siguiente slot, sumando la duración del servicio
                current.add(duracionMinutos, 'minutes');
            }

            // Devolvemos la lista de slots disponibles
            return slots;
        } catch (error) {
            // En caso de error, lo mostramos en la consola y lanzamos el error para que lo maneje el controlador de errores
            console.error('Error en obtenerHorariosDisponibles:', error);
            throw error; // Lanzamos el error
        } finally {
            // Liberamos la conexión a la base de datos para evitar bloqueos
            connection.release();
        }
    }
}

module.exports = CrudControllerCitas;
