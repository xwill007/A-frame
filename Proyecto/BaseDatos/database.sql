CREATE DATABASE FormularioRegistro;

USE FormularioRegistro;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nivel VARCHAR(50) NOT NULL
);