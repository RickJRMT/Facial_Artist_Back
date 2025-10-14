-- Crear base de datos

-- esta base de datos la estoy utilizando para todo el agendamiento de citas, la versión 2 es para una prueba


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

-- Tabla Servicios (con duración)
CREATE TABLE IF NOT EXISTS Servicios (
    idServicios INT AUTO_INCREMENT PRIMARY KEY,
    servNombre VARCHAR(100) NOT NULL,
    servDescripcion TEXT,
    servFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    servCosto DECIMAL(10,2),
    servImagen LONGBLOB,
    servDuracion INT NOT NULL DEFAULT 60 -- duración en minutos
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
    idProfesional INT NOT NULL,
    fechaCita DATE NOT NULL,
    horaCita TIME NOT NULL,
    fin_cita TIME,
    estadoPago ENUM('pendiente','pagado') DEFAULT 'pendiente',
    estadoCita ENUM('confirmada', 'pendiente', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    FOREIGN KEY (idServicios) REFERENCES Servicios(idServicios),
    FOREIGN KEY (idProfesional) REFERENCES Profesional(idProfesional)
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

-- INSERTS para Cliente
INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente)
VALUES 
('Laura Méndez', '3001234567', '1990-05-20'),
('Carlos Ruiz', '3009876543', '1985-11-15'),
('Ana Salazar', '3008889991', '1995-03-22'),
('Miguel Herrera', '3011112233', '1989-07-30'),
('Tatiana Ríos', '3014445566', '1992-12-10');

-- INSERTS para Profesional
INSERT INTO Profesional (nombreProfesional, correoProfesional, telefonoProfesional, contraProfesional, hora_inicio, hora_fin)
VALUES 
('Natalia Torres', 'natalia@facialartist.com', '3101122334', 'n4t4l14', '09:00:00', '18:00:00'),
('Juliana Pérez', 'juliana@facialartist.com', '3102233445', 'juli@123', '10:00:00', '17:00:00'),
('Andrea Gómez', 'andrea@facialartist.com', '3103344556', 'andrea22', '08:00:00', '16:00:00');

-- INSERTS para Servicios con duración
INSERT INTO Servicios (servNombre, servDescripcion, servCosto, servDuracion)
VALUES 
('Limpieza facial profunda', 'Tratamiento para limpiar impurezas y puntos negros', 85000.00, 60),
('Microblading de cejas', 'Técnica semipermanente para diseño de cejas', 120000.00, 90),
('Masaje relajante', 'Masaje terapéutico para reducir el estrés', 60000.00, 60),
('Peeling químico', 'Eliminación de células muertas con ácidos suaves', 95000.00, 45),
('Terapia con luz LED', 'Tratamiento rejuvenecedor con luz roja y azul', 70000.00, 30);

-- INSERTS para Cursos
INSERT INTO Cursos (nombreCurso, cursoDescripcion, cursoDuracion, cursoCosto)
VALUES
('Curso de limpieza facial', 'Aprende técnicas profesionales de limpieza facial', '4 semanas', 250000.00),
('Curso de microblading', 'Capacitación intensiva en microblading', '6 semanas', 400000.00),
('Curso de masaje facial', 'Masajes relajantes y drenaje linfático facial', '3 semanas', 180000.00);

-- INSERTS para Citas (sin hora fin fija, para calcular desde backend)
INSERT INTO Citas (idCliente, idServicios, idProfesional, fechaCita, horaCita, estadoPago, estadoCita)
VALUES 
(1, 1, 1, '2025-10-10', '10:00:00', 'pendiente', 'confirmada'),
(2, 3, 2, '2025-10-12', '15:00:00', 'pagado', 'pendiente'),
(3, 2, 1, '2025-10-15', '13:00:00', 'pendiente', 'cancelada'),
(4, 4, 3, '2025-10-16', '11:00:00', 'pagado', 'confirmada'),
(5, 5, 2, '2025-10-17', '09:30:00', 'pagado', 'pendiente'),
(1, 3, 3, '2025-10-18', '14:00:00', 'pendiente', 'pendiente'),
(2, 1, 1, '2025-10-19', '10:00:00', 'pendiente', 'confirmada');

-- INSERTS para Hv
INSERT INTO Hv (idCita, hvDesc)
VALUES 
(1, 'Piel con impurezas. Se aplicó exfoliación mecánica y mascarilla de carbón activado.'),
(2, 'Masaje relajante completo. Paciente presentó leve tensión en la espalda.'),
(3, 'Microblading realizado con pigmento natural. Buen resultado.'),
(4, 'Peeling químico suave. Ligero enrojecimiento posterior al tratamiento.'),
(5, 'Sesión de luz LED roja para rejuvenecimiento. Cliente satisfecho.'),
(6, 'Masaje facial con aceites esenciales. Mejoró elasticidad de la piel.'),
(7, 'Limpieza profunda con extracción manual y vapor ozono.');

-- Verificar que se creó correctamente
SELECT * FROM Servicios;
SELECT * FROM Citas;
