// Test para verificar que se crea automáticamente una HV al agendar una cita
const db = require('../config/conexion.db');
const CrudControllerCitas = require('../controllers/citas_cliente.controller');
const HvController = require('../controllers/hv.controller');

async function testCreacionHvAutomatica() {
    console.log('🧪 Iniciando test de creación automática de HV...');
    
    const controllerCitas = new CrudControllerCitas();
    
    // Datos de prueba para crear una cita
    const datosCoitaPrueba = {
        nombreCliente: 'Cliente Prueba HV',
        celularCliente: '3001234567',
        fechaNacCliente: '1990-01-15',
        idProfesional: 1, // Asume que existe un profesional con ID 1
        idServicios: 1,   // Asume que existe un servicio con ID 1
        fechaCita: '2025-11-15',
        horaCita: '10:00:00',
        numeroReferencia: 'TEST-HV-' + Date.now()
    };
    
    try {
        console.log('📅 Creando cita de prueba...');
        const resultadoCita = await controllerCitas.crearCita(datosCoitaPrueba);
        
        console.log('✅ Cita creada exitosamente:', {
            idCita: resultadoCita.idCita,
            idCliente: resultadoCita.idCliente,
            hvCreada: resultadoCita.hvCreada
        });
        
        // Verificar que se creó la HV automáticamente
        console.log('🔍 Buscando HV asociada...');
        const hvCreada = await HvController.obtenerPorIdCita(resultadoCita.idCita);
        
        if (hvCreada) {
            console.log('✅ HV creada automáticamente:', {
                idHv: hvCreada.idHv,
                idCita: hvCreada.idCita,
                hvDesc: hvCreada.hvDesc,
                hvFechaCreacion: hvCreada.hvFechaCreacion
            });
        } else {
            console.log('❌ Error: No se encontró HV para la cita creada');
        }
        
        // Obtener información completa de la HV
        console.log('📋 Obteniendo información completa de HV...');
        const hvCompleta = await HvController.obtenerHvCompletaPorId(hvCreada.idHv);
        
        if (hvCompleta) {
            console.log('✅ Información completa de HV:', hvCompleta);
        }
        
        return {
            success: true,
            cita: resultadoCita,
            hv: hvCreada,
            hvCompleta: hvCompleta
        };
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para limpiar datos de prueba (opcional)
async function limpiarDatosPrueba(idCita) {
    try {
        const connection = await db.getConnection();
        
        // Eliminar HV asociada
        await connection.query('DELETE FROM Hv WHERE idCita = ?', [idCita]);
        
        // Eliminar cita
        await connection.query('DELETE FROM Citas WHERE idCita = ?', [idCita]);
        
        console.log('🧹 Datos de prueba limpiados');
        
        connection.release();
    } catch (error) {
        console.error('Error al limpiar datos de prueba:', error);
    }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
    testCreacionHvAutomatica()
        .then(resultado => {
            console.log('\n📊 Resultado del test:', resultado);
            
            if (resultado.success && resultado.cita) {
                console.log('\n¿Deseas limpiar los datos de prueba? (Presiona Ctrl+C para mantener, o espera 5 segundos para limpiar)');
                setTimeout(() => {
                    limpiarDatosPrueba(resultado.cita.idCita)
                        .then(() => process.exit(0))
                        .catch(() => process.exit(1));
                }, 5000);
            }
        })
        .catch(error => {
            console.error('Error ejecutando test:', error);
            process.exit(1);
        });
}

module.exports = { testCreacionHvAutomatica, limpiarDatosPrueba };