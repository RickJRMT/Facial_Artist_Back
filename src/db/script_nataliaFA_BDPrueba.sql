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

CREATE TABLE Cita (
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

-- Datos de ejemplo para insertar

-- Insertar Clientes
INSERT INTO Cliente (nombreCliente, celularCliente, fechaNacCliente)
VALUES 
('Laura Pérez', '3001234567', '1992-05-10'),
('Carlos Martínez', '3012345678', '1987-08-22'),
('Ana Torres', '3025551122', '1995-03-14'),
('Julián Herrera', '3137896543', '1988-11-02'),
('María López', '3149998877', '1990-01-25');

-- Insertar Profesionales
INSERT INTO Profesional (nombreProfesional, correoProfesional, telefonoProfesional, contraProfesional)
VALUES 
('Natalia Rodríguez', 'natalia@example.com', '3107654321', 'contrasena123'),
('Sofía Gómez', 'sofia@example.com', '3119876543', 'pass456'),
('Camila Ríos', 'camila.rios@example.com', '3208887766', 'camila123'),
('Paula Mendoza', 'paula.mendoza@example.com', '3216665544', 'paula321');

-- Insertar Servicios
INSERT INTO Servicios (servNombre, servDescripcion, servCosto)
VALUES 
('Limpieza Facial Profunda', 'Elimina impurezas y células muertas con productos especializados.', 120000.00),
('Diseño de Cejas', 'Perfilado y depilación de cejas con técnica personalizada.', 45000.00),
('Microblading', 'Técnica semipermanente para cejas perfectas.', 250000.00),
('Peeling Químico', 'Tratamiento para renovar la piel y reducir manchas.', 180000.00),
('Masaje Facial', 'Estimula circulación y relaja músculos faciales.', 80000.00),
('Limpieza Facial Express', 'Limpieza rápida para pieles normales.', 60000.00);

-- Insertar Cursos
INSERT INTO Cursos (idProfesional, nombreCurso, cursoDescripcion, cursoDuracion, cursoCosto)
VALUES 
(1, 'Curso de Diseño de Cejas', 'Aprende técnicas profesionales para diseño y perfilado de cejas.', '3 semanas', 350000.00),
(2, 'Curso de Microblading', 'Técnicas modernas para microblading en cejas.', '4 semanas', 500000.00),
(3, 'Curso Peeling Avanzado', 'Curso profesional de aplicación de peeling químico.', '2 semanas', 400000.00),
(4, 'Curso Masajes Faciales', 'Aprende técnicas de masaje facial relajante y terapéutico.', '1 semana', 250000.00);

-- Insertar Citas
INSERT INTO Cita (idCliente, idServicios, idProfesional, fechaCita, horaCita, estadoCita, estadoPago)
VALUES 
(1, 1, 1, '2025-09-20', '14:30:00', 'solicitada', 'pendiente'),
(2, 2, 2, '2025-09-21', '10:00:00', 'confirmada', 'pagado'),
(3, 4, 3, '2025-09-22', '09:30:00', 'confirmada', 'pendiente'),
(4, 5, 4, '2025-09-22', '11:00:00', 'confirmada', 'pagado'),
(5, 6, 1, '2025-09-23', '13:00:00', 'solicitada', 'pendiente');

-- Insertar HV (hoja de vida profesional de la cita)
INSERT INTO Hv (idCita, hvDesc, servDescripcion)
VALUES 
(1, 'Piel sensible, se recomienda hidratación constante.', 'Limpieza facial profunda con productos hipoalergénicos.'),
(2, 'Cejas con poco vello, se hizo diseño suave.', 'Diseño de cejas con técnica personalizada.'),
(3, 'Manchas solares leves. Se aplicó peeling suave.', 'Peeling con ácido glicólico 20%.'),
(4, 'Tensión facial moderada. Se aplicó masaje relajante.', 'Masaje con aceite de lavanda.'),
(5, 'Piel normal sin alteraciones.', 'Limpieza básica con espuma neutra.');

-- Insertar Profesional_Servicio
INSERT INTO Profesional_Servicio (idProfesional, idServicios)
VALUES 
(1, 1),
(1, 2),
(2, 2),
(2, 3),
(3, 4),
(4, 5),
(1, 6),
(2, 6);

-- Dashboard

select * from cliente;
select * from cursos;
select * from Profesional_Servicio;

SELECT 
    c.idCita,
    c.fechaCita,
    c.horaCita,
    cl.nombreCliente,
    p.nombreProfesional,
    s.servNombre AS nombreServicio,
    s.servDescripcion,
    s.servCosto,
    c.estadoCita,
    c.estadoPago
FROM 
    Cita c
JOIN 
    Cliente cl ON c.idCliente = cl.idCliente
JOIN 
    Profesional p ON c.idProfesional = p.idProfesional
JOIN 
    Servicios s ON c.idServicios = s.idServicios
WHERE 
 idCita; 