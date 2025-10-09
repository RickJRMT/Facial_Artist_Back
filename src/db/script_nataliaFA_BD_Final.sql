-- Crear base de datos
CREATE DATABASE IF NOT EXISTS nataliaFacialArtist;
USE nataliaFacialArtist;

-- Tabla Cliente
CREATE TABLE IF NOT EXISTS Cliente (
    idCliente INT AUTO_INCREMENT PRIMARY KEY,
    nombreCliente VARCHAR(100) NOT NULL,
    celularCliente VARCHAR(20) UNIQUE NOT NULL,
    fechaNacCliente DATE,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Profesional
CREATE TABLE IF NOT EXISTS Profesional (
    idProfesional INT AUTO_INCREMENT PRIMARY KEY,
    nombreProfesional VARCHAR(100) NOT NULL,
    correoProfesional VARCHAR(100) NOT NULL,
    telefonoProfesional VARCHAR(20) NOT NULL,
    contraProfesional VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    fechaCreacionProf DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Servicios
CREATE TABLE IF NOT EXISTS Servicios (
    idServicios INT AUTO_INCREMENT PRIMARY KEY,
    servNombre VARCHAR(100) NOT NULL,
    servDescripcion TEXT,
    servFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    servCosto DECIMAL(10,2),
    servImagen LONGBLOB
);

-- Tabla Cursos
CREATE TABLE IF NOT EXISTS Cursos (
    idCurso INT AUTO_INCREMENT PRIMARY KEY,
    nombreCurso VARCHAR(100) NOT NULL,
    cursoDescripcion TEXT,
    cursoDuracion VARCHAR(50),
    cursoCosto DECIMAL(10,2),
    cursoImagen LONGBLOB,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Citas
CREATE TABLE IF NOT EXISTS Citas (
    idCita INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    idServicios INT NOT NULL,
    fechaCita DATE NOT NULL,
    horaCita TIME NOT NULL,
    fin_cita TIME,
    estadoPago ENUM('pendiente','pagado') DEFAULT 'pendiente',
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    FOREIGN KEY (idServicios) REFERENCES Servicios(idServicios)
);

-- Tabla Hv
CREATE TABLE IF NOT EXISTS Hv (
    idHv INT AUTO_INCREMENT PRIMARY KEY,
    idCita INT NOT NULL UNIQUE,
    hvDesc TEXT,
    hvFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    hvImagen LONGBLOB,
    FOREIGN KEY (idCita) REFERENCES Citas(idCita)
);

-- Tabla Profesional_Servicio
CREATE TABLE IF NOT EXISTS Profesional_Servicio (
    idProfServ INT AUTO_INCREMENT PRIMARY KEY,
    idProfesional INT NOT NULL,
    idServicios INT NOT NULL,
    FOREIGN KEY (idProfesional) REFERENCES Profesional(idProfesional),
    FOREIGN KEY (idServicios) REFERENCES Servicios(idServicios)
);

-- --------------------------------------------------------
-- INSERTS DE DATOS
-- --------------------------------------------------------

-- Clientes
INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente)
VALUES 
('Laura Méndez', '3001234567', '1990-05-20'),
('Carlos Ruiz', '3009876543', '1985-11-15'),
('Ana Salazar', '3008889991', '1995-03-22'),
('Miguel Herrera', '3011112233', '1989-07-30'),
('Tatiana Ríos', '3014445566', '1992-12-10');

-- Profesionales
INSERT INTO Profesional (nombreProfesional, correoProfesional, telefonoProfesional, contraProfesional, hora_inicio, hora_fin)
VALUES 
('Natalia Torres', 'natalia@facialartist.com', '3101122334', 'n4t4l14', '09:00:00', '18:00:00'),
('Juliana Pérez', 'juliana@facialartist.com', '3102233445', 'juli@123', '10:00:00', '17:00:00'),
('Andrea Gómez', 'andrea@facialartist.com', '3103344556', 'andrea22', '08:00:00', '16:00:00');

-- Servicios
INSERT INTO Servicios (servNombre, servDescripcion, servCosto)
VALUES 
('Limpieza facial profunda', 'Tratamiento para limpiar impurezas y puntos negros', 85000.00),
('Microblading de cejas', 'Técnica semipermanente para diseño de cejas', 120000.00),
('Masaje relajante', 'Masaje terapéutico para reducir el estrés', 60000.00),
('Peeling químico', 'Eliminación de células muertas con ácidos suaves', 95000.00),
('Terapia con luz LED', 'Tratamiento rejuvenecedor con luz roja y azul', 70000.00);

-- Profesional_Servicio
INSERT INTO Profesional_Servicio (idProfesional, idServicios)
VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 3),
(2, 5),
(3, 1),
(3, 3),
(3, 4);

-- Cursos
INSERT INTO Cursos (nombreCurso, cursoDescripcion, cursoDuracion, cursoCosto)
VALUES
('Curso de limpieza facial', 'Aprende técnicas profesionales de limpieza facial', '4 semanas', 250000.00),
('Curso de microblading', 'Capacitación intensiva en microblading', '6 semanas', 400000.00),
('Curso de masaje facial', 'Masajes relajantes y drenaje linfático facial', '3 semanas', 180000.00);

-- Citas
INSERT INTO Citas (idCliente, idServicios, fechaCita, horaCita, fin_cita, estadoPago)
VALUES 
(1, 1, '2025-10-10', '10:00:00', '11:00:00', 'pendiente'),
(2, 3, '2025-10-12', '15:00:00', '16:00:00', 'pagado'),
(3, 2, '2025-10-15', '13:00:00', '14:30:00', 'pendiente'),
(4, 4, '2025-10-16', '11:00:00', '12:00:00', 'pagado'),
(5, 5, '2025-10-17', '09:30:00', '10:30:00', 'pagado'),
(1, 3, '2025-10-18', '14:00:00', '15:00:00', 'pendiente'),
(2, 1, '2025-10-19', '10:00:00', '11:00:00', 'pendiente');

-- Hv (Hoja de Vida de Citas)
INSERT INTO Hv (idCita, hvDesc)
VALUES 
(1, 'Piel con impurezas. Se aplicó exfoliación mecánica y mascarilla de carbón activado.'),
(2, 'Masaje relajante completo. Paciente presentó leve tensión en la espalda.'),
(3, 'Microblading realizado con pigmento natural. Buen resultado.'),
(4, 'Peeling químico suave. Ligero enrojecimiento posterior al tratamiento.'),
(5, 'Sesión de luz LED roja para rejuvenecimiento. Cliente satisfecho.'),
(6, 'Masaje facial con aceites esenciales. Mejoró elasticidad de la piel.'),
(7, 'Limpieza profunda con extracción manual y vapor ozono.');
