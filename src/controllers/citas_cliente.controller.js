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

            // NUEVO: VALIDACIÓN CRUZADA - Chequear overlaps con Horarios INACTIVOS
            const checkHorarioQuery = `
                SELECT COUNT(*) as count 
                FROM Horarios h 
                WHERE h.idProfesional = ? AND DATE(h.fecha) = ? 
                AND h.estado = 'inactivo'
                AND ((h.hora_inicio < ? AND h.hora_fin > ?) OR 
                     (h.hora_inicio >= ? AND h.hora_inicio < ?))
            `;
            const [checkHorarioResult] = await connection.query(checkHorarioQuery, [
                data.idProfesional,
                data.fechaCita,
                finCita, data.horaCita,  // Overlap: inicio < fin_cita AND fin > inicio_cita
                data.horaCita, finCita
            ]);
            if (checkHorarioResult[0].count > 0) {
                console.log('DEBUG BACKEND crearCita: Bloqueado por horario inactivo');
                throw new Error('No se puede agendar: El profesional tiene agenda cerrada (inactivo) en este horario. Elige otro slot o fecha.');
            }

            // Validamos si el horario solicitado para la cita ya está ocupado (citas existentes)
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

        // Obtenemos rangos INACTIVOS para excluirlos después
        const [horariosInactivos] = await connection.query(
            `SELECT hora_inicio, hora_fin FROM Horarios 
             WHERE idProfesional = ? AND fecha = ? AND estado = 'inactivo' ORDER BY hora_inicio`,
            [idProfesional, fechaCita]
        );

        // Consultamos los horarios disponibles para el profesional en la fecha solicitada
        const [horarios] = await connection.query(
            `SELECT hora_inicio, hora_fin FROM Horarios 
             WHERE idProfesional = ? AND fecha = ? AND estado = 'activo'`,
            [idProfesional, fechaCita]
        );

        // Si no hay horarios definidos para ese día, devolvemos vacío
        if (!horarios || horarios.length === 0) {
            return [];
        }

        // Tomamos el primer rango de horario disponible
        const horario = horarios[0];
        let horaInicio = moment(`${fechaCita} ${horario.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
        let horaFin = moment(`${fechaCita} ${horario.hora_fin}`, 'YYYY-MM-DD HH:mm:ss');

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
        let current = horaInicio.clone();

        while (current < horaFin) {
            const slotInicio = current.clone();
            const slotFin = current.clone().add(duracionMinutos, 'minutes');

            if (slotFin > horaFin || slotFin <= slotInicio) break;

            // Validar que el slot NO overlap con horarios inactivos
            let overlapInactivo = false;
            for (const inactivo of horariosInactivos) {
                const inactivoInicio = moment(`${fechaCita} ${inactivo.hora_inicio}`, 'YYYY-MM-DD HH:mm:ss');
                const inactivoFin = moment(`${fechaCita} ${inactivo.hora_fin}`, 'YYYY-MM-DD HH:mm:ss');
                if (slotInicio.isBefore(inactivoFin) && slotFin.isAfter(inactivoInicio)) {
                    overlapInactivo = true;
                    break;
                }
            }
            if (overlapInactivo) {
                current.add(duracionMinutos, 'minutes');
                continue;
            }

            // Validamos que no haya citas que ya ocupen el horario
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
                    slotFin.format('HH:mm:ss')
                ]
            );

            if (citas.length === 0) {
                slots.push({
                    horaInicio: slotInicio.format('h:mm A'),
                    horaFin: slotFin.format('h:mm A'),
                    horaInicio24: slotInicio.format('HH:mm:ss'),
                });
            }

            current.add(duracionMinutos, 'minutes');
        }

        return slots;
    } catch (error) {
        console.error('Error en obtenerHorariosDisponibles:', error);
        throw error;
    } finally {
        connection.release();
    }
}
}

module.exports = CrudControllerCitas;