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

CREATE TABLE Cita (
    idCita INT AUTO_INCREMENT PRIMARY KEY,
    idCliente INT NOT NULL,
    idProfesional INT NOT NULL,
    fechaCita DATE NOT NULL,
    horaCita TIME NOT NULL,
    estadoCita ENUM('solicitada','confirmada','en curso','finalizada','cancelada') DEFAULT 'solicitada',
    estadoPago ENUM('pendiente','pagado') DEFAULT 'pendiente',
    FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
    FOREIGN KEY (idProfesional) REFERENCES Profesional(idProfesional)
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