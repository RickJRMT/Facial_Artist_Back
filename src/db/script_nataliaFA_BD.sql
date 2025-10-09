-- Crear base de datos
CREATE DATABASE IF NOT EXISTS nataliaFacialArtist;

USE nataliaFacialArtist;

-- Tabla Cliente
CREATE TABLE
    IF NOT EXISTS Cliente (
        idCliente INT AUTO_INCREMENT PRIMARY KEY,
        nombreCliente VARCHAR(100) NOT NULL,
        celularCliente VARCHAR(20) UNIQUE NOT NULL,
        fechaNacCliente DATE,
        fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Tabla Profesional
CREATE TABLE
    IF NOT EXISTS Profesional (
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
CREATE TABLE
    IF NOT EXISTS Servicios (
        idServicios INT AUTO_INCREMENT PRIMARY KEY,
        servNombre VARCHAR(100) NOT NULL,
        servDescripcion TEXT,
        servFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        servCosto DECIMAL(10, 2),
        servImagen LONGBLOB
    );

-- Tabla Cursos
CREATE TABLE
    IF NOT EXISTS Cursos (
        idCurso INT AUTO_INCREMENT PRIMARY KEY,
        nombreCurso VARCHAR(100) NOT NULL,
        cursoDescripcion TEXT,
        cursoDuracion VARCHAR(50),
        cursoCosto DECIMAL(10, 2),
        cursoImagen LONGBLOB,
        fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Tabla Citas
CREATE TABLE
    IF NOT EXISTS Citas (
        idCita INT AUTO_INCREMENT PRIMARY KEY,
        idCliente INT NOT NULL,
        idServicios INT NOT NULL,
        fechaCita DATE NOT NULL,
        horaCita TIME NOT NULL,
        fin_cita TIME,
        estadoPago ENUM ('pendiente', 'pagado') DEFAULT 'pendiente',
        FOREIGN KEY (idCliente) REFERENCES Cliente (idCliente),
        FOREIGN KEY (idServicios) REFERENCES Servicios (idServicios)
    );

-- Tabla Hv
CREATE TABLE
    IF NOT EXISTS Hv (
        idHv INT AUTO_INCREMENT PRIMARY KEY,
        idCita INT NOT NULL UNIQUE,
        hvDesc TEXT,
        hvFechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        hvImagen LONGBLOB,
        FOREIGN KEY (idCita) REFERENCES Citas (idCita)
    );

-- Tabla Profesional_Servicio
CREATE TABLE
    IF NOT EXISTS Profesional_Servicio (
        idProfServ INT AUTO_INCREMENT PRIMARY KEY,
        idProfesional INT NOT NULL,
        idServicios INT NOT NULL,
        FOREIGN KEY (idProfesional) REFERENCES Profesional (idProfesional),
        FOREIGN KEY (idServicios) REFERENCES Servicios (idServicios)
    );