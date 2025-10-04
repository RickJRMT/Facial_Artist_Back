-- Base de datos con flujo cerrado

-- Crear base de datos
CREATE DATABASE nataliaFacialArtist;
USE nataliaFacialArtist;

CREATE TABLE IF NOT EXISTS Cliente (
    idCliente INT AUTO_INCREMENT PRIMARY KEY,
    nombreCliente VARCHAR(100) NOT NULL,
    celularCliente VARCHAR(20) UNIQUE NOT NULL,
    fechaNacCliente DATE,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Profesional (
    idProfesional INT AUTO_INCREMENT PRIMARY KEY,
    nombreProfesional VARCHAR(100) NOT NULL,
    correoProfesional VARCHAR(100) NOT NULL,
    telefonoProfesional VARCHAR(20) NOT NULL,
    contraProfesional VARCHAR(50) NOT NULL,
    fechaCreacionProf DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Servicios (
    idServicios INT AUTO_INCREMENT PRIMARY KEY,
    servNombre VARCHAR(100) NOT NULL,
    servDescripcion TEXT,
    servFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    servCosto DECIMAL(10,2),
    servImagen LONGBLOB
);

CREATE TABLE IF NOT EXISTS Cursos (
    idCurso INT AUTO_INCREMENT PRIMARY KEY,
    idProfesional INT NOT NULL,
    nombreCurso VARCHAR(100) NOT NULL,
    cursoDescripcion TEXT,
    cursoDuracion VARCHAR(50),
    cursoCosto DECIMAL(10,2),
    cursoImagen LONGBLOB,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProfesional) REFERENCES Profesional(idProfesional)
);

CREATE TABLE Horarios (
    idHorario INT AUTO_INCREMENT PRIMARY KEY,
    dias VARCHAR(50),
    horaInicio TIME,
    horaFinal TIME
);

CREATE TABLE Citas (
    idCita INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    idProfesional INT NOT NULL,
    idHorario INT NOT NULL,
    fechaCita DATE NOT NULL,
    horaCita TIME NOT NULL,
    estadoCita ENUM('solicitada','confirmada','en curso','finalizada','cancelada') DEFAULT 'solicitada',
    estadoPago ENUM('pendiente','pagado') DEFAULT 'pendiente',
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    FOREIGN KEY (idProfesional) REFERENCES Profesional(idProfesional),
    FOREIGN KEY (idHorario) REFERENCES Horarios(idHorario)
);

CREATE TABLE Hv (
    idHv INT AUTO_INCREMENT PRIMARY KEY,
    idCita INT NOT NULL,
    hvDesc TEXT,
    hvFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    servDescripcion TEXT,
    hvImagen LONGBLOB,
    FOREIGN KEY (idCita) REFERENCES Cita(idCita)
);

CREATE TABLE IF NOT EXISTS Profesional_Servicio (
    idProfServ INT AUTO_INCREMENT PRIMARY KEY,
    idProfesional INT,
    idServicios INT,
    FOREIGN KEY (idProfesional) REFERENCES Profesional(idProfesional),
    FOREIGN KEY (idServicios) REFERENCES Servicios(idServicios)
);

-- INSERTs en orden estricto (originales + nuevos)

-- Horarios
INSERT INTO Horarios (dias, horaInicio, horaFinal)
VALUES 
('Lunes', '09:00:00', '18:00:00'),
('Martes', '09:00:00', '18:00:00'),
('Miercoles', '09:00:00', '18:00:00'),
('Jueves', '09:00:00', '18:00:00'),
('Viernes', '09:00:00', '18:00:00'),
('Sábados', '10:00:00', '16:00:00'),
('Lunes - Sabados', '11:00:00', '16:00:00'),
('Domingos - Cerrado', NULL, NULL),

-- Clientes (originales 1-5 + nuevos 6-10)
INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente)
VALUES 
('Laura Pérez', '3001234567', '1992-05-10'),
('Carlos Martínez', '3012345678', '1987-08-22'),
('Ana Torres', '3025551122', '1995-03-14'),
('Julián Herrera', '3137896543', '1988-11-02'),
('María López', '3149998877', '1990-01-25'),
('Diego Ramírez', '3151112233', '1998-07-15'),
('Valeria Sánchez', '3162223344', '1993-12-08'),
('Andrés Vargas', '3173334455', '1985-04-20'),
('Lucía Fernández', '3184445566', '1996-09-11'),
('Miguel Castro', '3195556677', '1991-02-28');

-- Profesionales (1-6)
INSERT INTO Profesional (nombreProfesional, correoProfesional, telefonoProfesional, contraProfesional)
VALUES 
('Natalia Rodríguez', 'natalia@example.com', '3107654321', 'contrasena123'),
('Sofía Gómez', 'sofia@example.com', '3119876543', 'pass456'),
('Camila Ríos', 'camila.rios@example.com', '3208887766', 'camila123'),
('Paula Mendoza', 'paula.mendoza@example.com', '3216665544', 'paula321'),
('Elena Duarte', 'elena.duarte@example.com', '3227778899', 'elena456'),
('Roberto Silva', 'roberto.silva@example.com', '3238889900', 'roberto789');

-- Servicios (originales 1-6 + nuevos 7-9)
INSERT INTO Servicios (servNombre, servDescripcion, servCosto)
VALUES 
('Limpieza Facial Profunda', 'Elimina impurezas y células muertas con productos especializados.', 120000.00),
('Diseño de Cejas', 'Perfilado y depilación de cejas con técnica personalizada.', 45000.00),
('Microblading', 'Técnica semipermanente para cejas perfectas.', 250000.00),
('Peeling Químico', 'Tratamiento para renovar la piel y reducir manchas.', 180000.00),
('Masaje Facial', 'Estimula circulación y relaja músculos faciales.', 80000.00),
('Limpieza Facial Express', 'Limpieza rápida para pieles normales.', 60000.00),
('Hidratación Facial con Ácido Hialurónico', 'Tratamiento intensivo de hidratación profunda para piel seca.', 95000.00),
('Depilación Láser Facial', 'Sesión de depilación láser para rostro, segura y efectiva.', 150000.00),
('Tratamiento Antiedad con Botox', 'Aplicación básica de botox para reducir arrugas finas.', 300000.00);

-- Cursos (originales 1-4 + nuevos 5-7)
INSERT INTO Cursos (idProfesional, nombreCurso, cursoDescripcion, cursoDuracion, cursoCosto)
VALUES 
(1, 'Curso de Diseño de Cejas', 'Aprende técnicas profesionales para diseño y perfilado de cejas.', '3 semanas', 350000.00),
(2, 'Curso de Microblading', 'Técnicas modernas para microblading en cejas.', '4 semanas', 500000.00),
(3, 'Curso Peeling Avanzado', 'Curso profesional de aplicación de peeling químico.', '2 semanas', 400000.00),
(4, 'Curso Masajes Faciales', 'Aprende técnicas de masaje facial relajante y terapéutico.', '1 semana', 250000.00),
(5, 'Curso de Hidratación Facial', 'Técnicas avanzadas de hidratación con sérums y máscaras.', '2 semanas', 300000.00),
(6, 'Curso de Depilación Láser', 'Entrenamiento en uso de láser para tratamientos faciales.', '3 semanas', 450000.00),
(1, 'Curso Actualizado de Microblading 2025', 'Versión actualizada con nuevas pigmentaciones.', '5 semanas', 550000.00);

-- Insertar Citass
INSERT INTO Citas (idCliente, idProfesional, idHorario, fechaCita, horaCita, estadoCita, estadoPago)
VALUES 
(1, 1, 1, '2025-10-03', '14:30:00', 'confirmada', 'pagado'),
(2, 2, 1, '2025-10-04', '10:00:00', 'en curso', 'pagado'),
(3, 3, 1, '2025-10-05', '09:30:00', 'finalizada', 'pagado'),
(4, 4, 2, '2025-10-06', '11:00:00', 'solicitada', 'pendiente'),
(5, 1, 1, '2025-10-07', '13:00:00', 'confirmada', 'pendiente');

-- Insertar HV (hoja de vida profesional de la cita)
INSERT INTO Hv (idCita, hvDesc, servDescripcion)
VALUES 
(1, 'Piel mixta, se aplicó limpieza con enfoque en zona T.', 'Limpieza Facial Profunda'),
(2, 'Cejas irregulares, diseño asimétrico corregido.', 'Diseño de Cejas'),
(3, 'Piel madura con manchas, peeling moderado.', 'Peeling Químico'),
(4, 'Estrés acumulado, masaje extendido 10 min extra.', 'Masaje Facial'),
(5, 'Piel grasa, limpieza con control de sebo.', 'Limpieza Facial Express');

-- Profesional_Servicio (originales + nuevos, con IDs servicios correctos 1-9)
INSERT INTO Profesional_Servicio (idProfesional, idServicios)
VALUES 
(1, 1),
(1, 2),
(2, 2),
(2, 3),
(3, 4),
(4, 5),
(1, 6),
(2, 6),
(5, 7),
(6, 8),
(1, 9),
(3, 7),
(4, 8);

-- Dashboard Query (actualizada, filtra desde hoy)
SELECT 
    c.idCita,
    c.fechaCita,
    c.horaCita,
    cl.nombreCliente,
    p.nombreProfesional,
    GROUP_CONCAT(DISTINCT s.servNombre SEPARATOR ', ') AS serviciosDisponibles,
    COALESCE(h.servDescripcion, 'Por asignar') AS servicioElegido,
    c.estadoCita,
    c.estadoPago
FROM 
    Citas c
JOIN 
    Cliente cl ON c.idCliente = cl.idCliente
JOIN 
    Profesional p ON c.idProfesional = p.idProfesional
LEFT JOIN 
    Profesional_Servicio ps ON p.idProfesional = ps.idProfesional
LEFT JOIN 
    Servicios s ON ps.idServicios = s.idServicios
LEFT JOIN 
    Hv h ON c.idCita = h.idCita
WHERE 
    c.fechaCita >= '2025-10-03'
GROUP BY 
    c.idCita, cl.nombreCliente, p.nombreProfesional, h.servDescripcion, c.estadoCita, c.estadoPago
ORDER BY 
    c.fechaCita DESC, c.horaCita ASC;