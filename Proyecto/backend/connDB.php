<?php
// Archivo: Proyecto/backend/connDB.php
// Propósito: centralizar la configuración y la creación de la conexión a la base de datos

// Credenciales y configuración de la base de datos
$DB_HOST = 'localhost'; // Host de la DB
$DB_USER = 'root';      // Usuario de la DB
$DB_PASS = '';          // Contraseña (vacía en XAMPP por defecto)
$DB_NAME = 'english_vr';// Nombre de la base de datos

// Crear la conexión MySQLi y dejarla disponible en la variable $conn
$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

// Comprobar errores de conexión y detener la ejecución si hay un fallo
if ($conn->connect_error) {
    // En desarrollo podemos mostrar el error; en producción registrar en logs
    die("Conexión fallida: " . $conn->connect_error);
}

// Asegurar el uso de utf8mb4 para evitar problemas con caracteres especiales/emoji
$conn->set_charset('utf8mb4');

// Fin del archivo de conexión. Desde otros scripts se debe usar:
// require_once __DIR__ . '/connDB.php'; // (o la ruta relativa correcta)
?>