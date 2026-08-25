<?php
// Endpoint: obtener_evaluaciones.php
// Devuelve evaluaciones filtradas por id_usuario y/o archivo o id_cancion

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../../connDB.php';

function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$data = $_GET;
if (!$data && $raw) {
    $json = json_decode($raw, true);
    if (is_array($json)) $data = $json;
}

$id_usuario = isset($data['id_usuario']) ? intval($data['id_usuario']) : null;
$id_cancion = isset($data['id_cancion']) ? intval($data['id_cancion']) : null;
$archivo = isset($data['archivo']) ? trim($data['archivo']) : null;

// If archivo provided and id_cancion missing, try to resolve
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

// Build base query
$sql = "SELECT id_evaluacion, id_cancion, id_usuario, total, nota_evaluacion, terminado, nivel, fecha_hora FROM evaluaciones_vr WHERE id_usuario = '$id_usuario' and id_cancion = '$id_cancion' ";
$params = [];
$types = '';

if ($id_usuario !== null && $id_usuario !== 0) {
    $sql .= ' AND id_usuario = ?';
    $types .= 'i';
    $params[] = $id_usuario;
}

if ($id_cancion !== null && $id_cancion !== 0) {
    $sql .= ' AND id_cancion = ?';
    $types .= 'i';
    $params[] = $id_cancion;
}

$sql .= ' ORDER BY fecha_hora DESC LIMIT 50';

$stmt = $conn->prepare($sql);
if (!$stmt) {
    respond(500, ['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
}

if (!empty($params)) {
    $bind_names[] = $types;
    for ($i=0; $i<count($params); $i++) {
        $bind_name = 'param' . $i;
        $$bind_name = $params[$i];
        $bind_names[] = &$$bind_name;
    }
    call_user_func_array([$stmt, 'bind_param'], $bind_names);
}

if (!$stmt->execute()) {
    respond(500, ['status' => 'error', 'message' => 'Execute failed: ' . $stmt->error]);
}

$res = $stmt->get_result();
$evaluaciones = [];
if ($res) {
    while ($r = $res->fetch_assoc()) {
        $evaluaciones[] = [
            'id_evaluacion' => (int)$r['id_evaluacion'],
            'id_cancion' => (int)$r['id_cancion'],
            'id_usuario' => (int)$r['id_usuario'],
            'total' => (int)$r['total'],
            'nota_evaluacion' => $r['nota_evaluacion'],
            'terminado' => (int)$r['terminado'],
            'nivel' => (int)$r['nivel'],
            'fecha_hora' => $r['fecha_hora']
        ];
    }
}

$stmt->close();

respond(200, ['status' => 'success', 'evaluations' => $evaluaciones]);

?>
