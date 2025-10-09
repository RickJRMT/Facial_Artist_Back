const db = require('../config/conexion.db');

class CrudController {

    async obtenerTabla(tabla) {
        try {
            const [resultado] = await db.query(`SELECT * FROM ${tabla}`);
            return resultado;
        } catch (error) {
            throw error;
        }
    }

    async obtenerTablaId(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`SELECT * FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            return resultado[0];
        } catch (error) {
            throw error;
        }
    }

    async crear(tabla, data) {
        try {
            const [resultado] = await db.query(`INSERT INTO ?? SET ?`, [tabla, data]);
            return { ...data, id: resultado.insertId };
        } catch (error) {
            throw error;
        }
    }

    async actualizar(tabla, idCampo, id, data) {
        try {
            const [resultado] = await db.query(`UPDATE ?? SET ? WHERE ?? = ?`, [tabla, data, idCampo, id]);
            if (resultado.affectedRows === 0) {
                throw new Error('no se encuentra registro');
            }
            return await this.obtenerTablaId(tabla, idCampo, id);
        } catch (error) {
            throw error;
        }
    }

    async eliminar(tabla, idCampo, id) {
        try {
            const [resultado] = await db.query(`DELETE FROM ?? WHERE ?? = ?`, [tabla, idCampo, id]);
            if (resultado.affectedRows === 0) {
                throw new Error('no se encuentra registro');
            }
            return { mensaje: 'registro eliminado' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CrudController();