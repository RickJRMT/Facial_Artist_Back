const db = require('../config/conexion.db');

class ClienteController {
  
  // Obtener todos los clientes
  async obtenerClientes(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM Cliente');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ mensaje: 'Error al obtener los clientes' });
    }
  }

  // Obtener cliente por ID
  async obtenerClientePorId(req, res) {
    const { id } = req.params;
    try {
      const [rows] = await db.query('SELECT * FROM Cliente WHERE idCliente = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ mensaje: 'Error al obtener cliente' });
    }
  }
}

module.exports = new ClienteController();
