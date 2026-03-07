<?php
// Endpoint para registrar y listar canciones para el módulo VR (karaoke)

// Incluir conexión central (usa la misma ruta que en otros modelos)
require_once __DIR__ . '/../../connDB.php';

if (!isset($conn)) {
	header('Content-Type: application/json; charset=utf-8');
	http_response_code(500);
	echo json_encode(['error' => 'No se pudo establecer la conexión a la base de datos.']);
	exit;
}

// Nombre de la tabla a usar
$tableName = 'canciones_vr';

// Comprobar si la tabla existe. Si no existe, crearla (esto ocurrirá solo la primera vez).
$tableExists = false;
$checkSql = "SHOW TABLES LIKE '" . $conn->real_escape_string($tableName) . "'";
$res = $conn->query($checkSql);
if ($res && $res->num_rows > 0) {
	$tableExists = true;
}

if (!$tableExists) {
	$create_table_sql = "CREATE TABLE IF NOT EXISTS `" . $tableName . "` ("
		. "`id_cancion` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,"
		. "`titulo_cancion` VARCHAR(255) NOT NULL,"
		. "`autor_cancion` VARCHAR(255) NOT NULL,"
		. "`archivo_cancion` VARCHAR(255) NOT NULL,"
		. "`fecha_hora_cancion` DATETIME DEFAULT CURRENT_TIMESTAMP,"
		. "`idioma_cancion` VARCHAR(50) DEFAULT 'ingles',"
		. "UNIQUE KEY `unique_song` (`titulo_cancion`,`autor_cancion`)"
		. ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

	if (!$conn->query($create_table_sql)) {
		header('Content-Type: application/json; charset=utf-8');
		http_response_code(500);
		echo json_encode(['error' => 'Error al crear la tabla "' . $tableName . '": ' . $conn->error]);
		$conn->close();
		exit;
	}
}
else {
	// If table exists but column archivo_cancion is missing, add it.
	$colCheck = "SHOW COLUMNS FROM `" . $tableName . "` LIKE 'archivo_cancion'";
	$colRes = $conn->query($colCheck);
	if ($colRes && $colRes->num_rows === 0) {
		$alterSql = "ALTER TABLE `" . $tableName . "` ADD COLUMN `archivo_cancion` VARCHAR(255) NOT NULL AFTER `autor_cancion`";
		if (!$conn->query($alterSql)) {
			header('Content-Type: application/json; charset=utf-8');
			http_response_code(500);
			echo json_encode(['error' => 'Error al agregar columna archivo_cancion: ' . $conn->error]);
			$conn->close();
			exit;
		}
	}
}

// Helper: parsear un nombre de archivo y extraer titulo y autor.
function parseFilenameToSong($filename) {
	// Eliminar ruta si viene incluida
	$base = basename($filename);
	// Guardar el nombre del archivo sin la extensión en una variable
	$withoutExt = preg_replace('/\.[^.]+$/', '', $base);

	// Separar buscando el PRIMER guion bajo. La primera parte es el título (CamelCase),
	// la segunda parte (si existe) es el autor. Usamos límite 2 para mantener el resto en artista.
	$parts = explode('_', $withoutExt, 2);
	$title = isset($parts[0]) ? $parts[0] : '';
	$author = isset($parts[1]) ? $parts[1] : '';

	// Normalizar: convertir CamelCase a palabras con espacios y reemplazar '_' por espacios
	$camelToWords = function($s) {
		// Reemplazar underscores por espacio
		$s = str_replace('_', ' ', $s);
		// Insertar espacio entre minúscula/dígito y mayúscula: 'itsMyLife' -> 'its My Life'
		$s = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', $s);
		// Insertar espacio entre mayúscula seguida de mayúscula+minúscula: 'BenEKing' -> 'Ben E King'
		$s = preg_replace('/([A-Z])([A-Z][a-z])/', '$1 $2', $s);
		// Colapsar múltiples espacios y trim
		$s = preg_replace('/\s+/', ' ', trim($s));
		return $s;
	};

	$title = $camelToWords($title);
	$author = $camelToWords($author);
	return ['titulo' => $title, 'autor' => $author];
}

// Recoger parámetros: soportamos GET/POST
$inputList = null;
if (isset($_REQUEST['list'])) {
	// Lista de archivos separados por comas
	$inputList = $_REQUEST['list'];
} elseif (isset($_REQUEST['file'])) {
	// Un único archivo
	$inputList = $_REQUEST['file'];
} elseif (isset($_REQUEST['files']) && is_array($_REQUEST['files'])) {
	// Array de files desde un formulario
	$inputList = implode(',', $_REQUEST['files']);
}

// Si se recibió una lista, procesarla (insertar canciones si no existen)
if ($inputList !== null && trim($inputList) !== '') {
	// Normalizar: convertir a array
	$items = array_filter(array_map('trim', explode(',', $inputList)));

	// Preparar statement de inserción con ON DUPLICATE KEY IGNORE por unique key
	$insertSql = "INSERT INTO `" . $tableName . "` (`titulo_cancion`,`autor_cancion`,`archivo_cancion`) VALUES (?,?,?)"
		. " ON DUPLICATE KEY UPDATE titulo_cancion = titulo_cancion"; // no-op para evitar error
	$stmtInsert = $conn->prepare($insertSql);
	if (!$stmtInsert) {
		header('Content-Type: application/json; charset=utf-8');
		http_response_code(500);
		echo json_encode(['error' => 'Error al preparar inserción: ' . $conn->error]);
		$conn->close();
		exit;
	}

	foreach ($items as $it) {
		$parsed = parseFilenameToSong($it);
		$titulo = $parsed['titulo'];
		$autor = $parsed['autor'];
		$archivo = basename($it);

		// Si no hay título, saltar
		if ($titulo === '') continue;

		$stmtInsert->bind_param('sss', $titulo, $autor, $archivo);
		try {
			$stmtInsert->execute();
		} catch (mysqli_sql_exception $e) {
			// Ignorar errores de duplicado (deberían evitarse por UNIQUE)
			continue;
		}
	}
	$stmtInsert->close();
}

// Ahora recuperar la lista completa de canciones y devolver JSON
$songs = [];
$selSql = "SELECT id_cancion, titulo_cancion, autor_cancion, archivo_cancion, fecha_hora_cancion, idioma_cancion FROM `" . $tableName . "` ORDER BY id_cancion ASC";
$res2 = $conn->query($selSql);
if ($res2) {
	while ($row = $res2->fetch_assoc()) {
		$songs[] = [
			'id_cancion' => (int)$row['id_cancion'],
			'titulo_cancion' => $row['titulo_cancion'],
				'autor_cancion' => $row['autor_cancion'],
				'archivo_cancion' => $row['archivo_cancion'],
			'fecha_hora_cancion' => $row['fecha_hora_cancion'],
			'idioma_cancion' => $row['idioma_cancion']
		];
	}
	$res2->free();
} else {
	header('Content-Type: application/json; charset=utf-8');
	http_response_code(500);
	echo json_encode(['error' => 'Error al consultar canciones: ' . $conn->error]);
	$conn->close();
	exit;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['songs' => $songs], JSON_UNESCAPED_UNICODE);

$conn->close();
exit;

?>

