<?php // Inicio del script PHP: punto de entrada para el endpoint de registro de usuarios

// Incluir el archivo central de conexión. Usamos __DIR__ para construir la ruta relativa
// El archivo `connDB.php` crea y deja disponible la variable $conn
require_once __DIR__ . '/../../connDB.php';

// Si por alguna razón $conn no está definida, detenemos la ejecución con un mensaje
if (!isset($conn)) {
    die("No se pudo establecer la conexión a la base de datos.");
}

// Comprobación: si la petición HTTP es de tipo POST, procesamos los datos enviados por el formulario
// Esto evita que el script intente insertar datos cuando se accede con GET u otros métodos
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recuperar los campos enviados desde el formulario HTML
    // NOTA: aquí se asume que los campos vienen con los nombres 'nombre', 'email', 'password' y 'nivel'
    $nombre = $_POST['nombre']; // Nombre completo enviado por el usuario
    $email = $_POST['email'];   // Email enviado por el usuario

    // Recuperar la contraseña en crudo para, opcionalmente, reenviarla al front
    // NOTA: reenviar la contraseña por la URL es inseguro (se almacenará en logs/historial).
    // Mejor alternativa: usar sesión o iniciar sesión automáticamente en el servidor.
    $raw_password = $_POST['password'];
    // Hashear la contraseña recibida antes de guardarla en la base de datos
    // password_hash aplica un algoritmo seguro (bcrypt por defecto) y evita guardar contraseñas en texto plano
    $password = password_hash($raw_password, PASSWORD_DEFAULT);

    $nivel = $_POST['nivel']; // Nivel de inglés seleccionado por el usuario

    // Preparar la consulta SQL para insertar un nuevo usuario
    // Aquí se usan placeholders (?) para prevenir inyección SQL al usar declaraciones preparadas
    $sql = "INSERT INTO usuarios (name, email, password, level) VALUES (?, ?, ?, ?)";

    // Preparar la sentencia usando la conexión; $stmt será el statement preparado
    $stmt = $conn->prepare($sql);

    // Comprobar que la preparación fue exitosa antes de vincular parámetros
    if (!$stmt) {
        // Si falló la preparación, redirigimos al front con código de error y mensaje
        $msg = urlencode('Error al preparar la consulta: ' . $conn->error);
        header('Location: /A-frame/Proyecto/frontend/inicio/index.html?status=error&message=' . $msg);
        exit;
    }

    // Vincular las variables PHP a los parámetros de la sentencia preparada
    // "ssss" indica que los cuatro parámetros son strings (s = string)
    $stmt->bind_param("ssss", $nombre, $email, $password, $nivel);

    // Ejecutar la sentencia preparada; manejamos errores de ejecución y excepciones
    $ok = false;
    try {
        $ok = $stmt->execute();
    } catch (mysqli_sql_exception $e) {
        // Manejar error de clave duplicada (código MySQL 1062) o mensaje que contenga 'Duplicate'
        if ($e->getCode() == 1062 || stripos($e->getMessage(), 'Duplicate') !== false) {
            $msg = urlencode('Email ya existe');
            // Reenviar nombre y email para que el front pueda rellenar el formulario y no perder los datos
            $nombre_q = urlencode($nombre);
            $email_q = urlencode($email);
            header('Location: /A-frame/Proyecto/frontend/inicio/index.html?status=error&message=' . $msg . '&nombre=' . $nombre_q . '&email=' . $email_q);
        } else {
            $msg = urlencode('Error: ' . $e->getMessage());
            header('Location: /A-frame/Proyecto/frontend/inicio/index.html?status=error&message=' . $msg);
        }
        $stmt->close();
        $conn->close();
        exit;
    }

    if ($ok) {
        // Redirigir al front indicando éxito
        // Incluir email y password en la URL para que el frontend pueda prellenar el formulario de login.
        // ADVERTENCIA: esto expone la contraseña en la URL (historial, logs). Considerar usar sesiones o
        // un POST-redirect para mayor seguridad. Aquí se hace por simplicidad según el pedido.
        $msg = urlencode('Registro exitoso');
        $email_q = urlencode($email);
        $pwd_q = urlencode($raw_password);
        header('Location: /A-frame/Proyecto/frontend/inicio/index.html?status=success&message=' . $msg . '&email=' . $email_q . '&password=' . $pwd_q);
        $stmt->close();
        $conn->close();
        exit;
    } else {
        // Si execute devolvió false sin lanzar excepción, tomar el error del statement
        $msg = urlencode('Error: ' . $stmt->error);
        header('Location: /A-frame/Proyecto/frontend/inicio/index.html?status=error&message=' . $msg);
        $stmt->close();
        $conn->close();
        exit;
    }
}

// Cerrar la conexión a la base de datos al finalizar el script
$conn->close();

?>