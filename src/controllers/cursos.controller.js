const pool = require('../config/conexion.db');

const crearCurso = async (req, res) => {
    try {
        const { idProfesional, nombreCurso, cursoDesc, cursoDuracion, cursoCosto, imagenBase64 } = req.body;

        if (!idProfesional || !nombreCurso) {
            return res.status(400).json({ message: 'El Profesional y Nombre del curso son requeridos' });
        }

        if (cursoDuracion && cursoDuracion.length > 100) {
            return res.status(400).json({ message: 'los caracteres de la deracion del curso no deben superar los 100 ' });
        }


        if (cursoCosto < 0) {
            return res.status(400).json({ message: 'el costo no debe ser negativo' });
        }

        const [result] = await pool.execute(
            'INSERT INTO Cursos (idProfesional, nombreCurso, cursoDescripcion, cursoDuracion, cursoCosto) VALUES (?, ?, ?, ?, ?)',
            [idProfesional, nombreCurso, cursoDesc, cursoDuracion, cursoCosto]
        );

        const idCurso = result.insertId;

        if (imagenBase64) {
            const imagenResult = await imagenesController.subirImagen('Cursos', 'idCurso', idCurso, imagenBase64);
            if (imagenResult.error) {
                return res.status(400).json({ message: imagenResult.error });
            }
        }

        const [nuevoCursoRows] = await pool.execute(
            'SELECT * FROM Cursos WHERE idCurso = ?',
            [idCurso]
        );

        let curso = nuevoCursoRows[0];

        if (curso.cursoImagen) {

            const imagenData = await imagenesController.obtenerImagen('Cursos', 'idCurso', idCurso);
            curso.cursoImagen = imagenData.cursoImagen || null;
        }

        return res.status(201).json(curso);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el curso', detalles: error.message });
    }
};

const obtenerCurso = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Cursos');
        const cursos = await Promise.all(rows.map(async (curso) => {
            if (curso.cursoImagen) {
                const imagenData = await imagenesController.obtenerImagen('Cursos', 'idCurso', curso.idCurso);
                curso.cursoImagen = imagenData.cursoImagen || null;
            }
            return curso;
        }));
        return res.status(200).json(cursos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los cursos', detalles: error.message });
    }
};

const obtenerCursoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM Cursos WHERE idCurso = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        let curso = rows[0];

        if (curso.cursoImagen) {
            const imagenData = await imagenesController.obtenerImagen('Cursos', 'idCurso', curso.idCurso);
            curso.cursoImagen = imagenData.cursoImagen || null;
        }
        return res.status(200).json(curso);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el curso', detalles: error.message });
    }
};

const actualizarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const { idProfesional, nombreCurso, cursoDesc, cursoDuracion, cursoCosto, imagenBase64 } = req.body;

        const [cursoExistenteRows] = await pool.execute('SELECT * FROM Cursos WHERE idCurso = ?', [id]);
        if (cursoExistenteRows.length === 0) {
            console.log('curso no encontrado con ID:', id);
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        if (!idProfesional || !nombreCurso) {
            return res.status(400).json({ message: 'El Profesional y Nombre del curso son requeridos' });
        }

        if (cursoDuracion && cursoDuracion.length > 100) {
            return res.status(400).json({ message: 'los caracteres de la descripcion del curso no deben superar los 100 ' });
        }


        if (cursoCosto < 0) {
            return res.status(400).json({ message: 'el costo no debe ser negativo' });
        }


        await pool.execute('UPDATE Cursos SET idProfesional = ?, nombreCurso = ?, cursoDescripcion = ?, cursoDuracion = ?, cursoCosto = ? WHERE idCurso = ?',
            [idProfesional, nombreCurso, cursoDesc, cursoDuracion, cursoCosto, id]
        );

        if (imagenBase64) {
            console.log('Intentando subir imagen para el curso ID:', id);
            const imagenResult = await imagenesController.subirImagen('Cursos', 'idCurso', id, imagenBase64);
            if (imagenResult.error) {
                console.log('Error al subir la imagen', imagenResult.error);
                return res.status(400).json({ error: imagenResult.error });
            }
        }

        const [updateCursoRows] = await pool.execute('SELECT * FROM Cursos WHERE idCurso = ?', [id]);
        let curso = updateCursoRows[0];

        if(curso.cursoImagen) {
            const imagenData = await imagenesController.obtenerImagen('Cursos', 'idCurso', id);
            curso.cursoImagen = imagenData.cursoImagen || null;
        }

        console.log('Curso actualizado con éxito:', curso);
        return res.status(200).json(curso);
    }catch (error) {
        console.error('Error al actualizar el curso:', error);
        return res.status(500).json({ message: 'Error al actualizar el curso', detalles: error.message });
    }
};

const eliminarCurso = async (req, res) => {
    try{
        const { id } = req.params;
        const [cursoRows] = await pool.execute('SELECT * FROM Cursos WHERE idCurso = ?', [id]);
        
        if (cursoRows.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        
        await pool.execute('DELETE FROM Cursos WHERE idCurso = ?', [id]);
        return res.status(200).json({ message: 'Curso eliminado exitosamente' });
    }catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al eliminar el curso', detalles: error.message });
    }
};

module.exports = {crearCurso, obtenerCurso, obtenerCursoPorId, actualizarCurso, eliminarCurso};