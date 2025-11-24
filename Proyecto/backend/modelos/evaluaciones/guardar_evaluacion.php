<?php
// Endpoint: guardar_evaluacion.php
// Crea la tabla evaluaciones_vr si no existe y registra una evaluación enviada por POST.

header('Content-Type: application/json; charset=utf-8');
// permitir llamadas desde el front-end local (ajusta según necesidad)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // CORS preflight
    http_response_code(204);
    exit;
}

// incluir archivo de conexión (ajusta la ruta si es necesario)
// ruta relativa desde: Proyecto/backend/modelos/evaluaciones -> Proyecto/backend/connDB.php
require_once __DIR__ . '/../../connDB.php';

// Helper para devolver JSON y terminar
function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// parámetros esperados (POST)
$raw = file_get_contents('php://input');
$data = $_POST;
// si se envía JSON en el body
if (!$data && $raw) {
    $json = json_decode($raw, true);
    if (is_array($json)) $data = $json;
}

// Accept either id_cancion or archivo; id_usuario optional (0 = anonymous)
$id_cancion = isset($data['id_cancion']) ? intval($data['id_cancion']) : null;
$archivo = isset($data['archivo']) ? trim($data['archivo']) : null;
$id_usuario = isset($data['id_usuario']) ? intval($data['id_usuario']) : 0; // default anonymous (0)
$total = isset($data['total']) ? intval($data['total']) : null;
$nota_evaluacion = isset($data['nota_evaluacion']) ? trim($data['nota_evaluacion']) : null; // palabra con error
$terminado = isset($data['terminado']) ? (intval($data['terminado']) ? 1 : 0) : 0;

// validar datos mínimos
if ($total === null) {
    respond(400, ['status' => 'error', 'message' => 'Faltan parámetros: total es obligatorio']);
}

// If id_cancion isn't provided but archivo is, try to resolve it
if (($id_cancion === null || $id_cancion === 0) && $archivo) {
    $archivoBase = basename($archivo);
    $q = $conn->prepare('SELECT id_cancion FROM canciones_vr WHERE archivo_cancion = ? LIMIT 1');
    if ($q) {
        $q->bind_param('s', $archivoBase);
        $q->execute();
        $res = $q->get_result();
        if ($res && $res->num_rows) {
            $r = $res->fetch_assoc();
            $id_cancion = intval($r['id_cancion']);
        }
        $q->close();
    }
}

// ensure we have numeric id_cancion (default 0 allowed)
if ($id_cancion === null) $id_cancion = 0;

// crear tabla si no existe
$createSql = "CREATE TABLE IF NOT EXISTS `evaluaciones_vr` (
    `id_evaluacion` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_cancion` INT UNSIGNED NOT NULL,
    `id_usuario` INT UNSIGNED NOT NULL,
    `total` INT NOT NULL DEFAULT 0,
    `nota_evaluacion` TEXT NULL,
    `terminado` TINYINT(1) NOT NULL DEFAULT 0,
    `fecha_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_evaluacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if (!$conn->query($createSql)) {
    respond(500, ['status' => 'error', 'message' => 'Error creando la tabla: ' . $conn->error]);
}

// insertar registro
$stmt = $conn->prepare("INSERT INTO evaluaciones_vr (id_cancion, id_usuario, total, nota_evaluacion, terminado) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) {
    respond(500, ['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
}

$stmt->bind_param('iiisi', $id_cancion, $id_usuario, $total, $nota_evaluacion, $terminado);

if (!$stmt->execute()) {
    respond(500, ['status' => 'error', 'message' => 'Execute failed: ' . $stmt->error]);
}

$insertId = $stmt->insert_id;
$stmt->close();

respond(200, ['status' => 'success', 'id_evaluacion' => $insertId]);

?>
