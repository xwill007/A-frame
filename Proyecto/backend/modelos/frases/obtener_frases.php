<?php
// Endpoint: obtener_frases.php
// Devuelve las frases de `frases_vr` para el Nivel 3 (pronunciación de frases completas).
// Espejo de obtener_palabras.php: acepta GET o POST con 'archivo' (preferido) o 'songTitle'+'author'.

require_once __DIR__ . '/../../connDB.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($conn)) {
    error_log('[obtener_frases] DB connection missing');
    echo json_encode(['status' => 'error', 'message' => 'No se pudo establecer la conexión a la base de datos.']);
    exit;
}

// soporte opcional de debug en querystring o body
$debug = false;
if (isset($_GET['debug']) && ($_GET['debug'] === '1' || $_GET['debug'] === 'true')) $debug = true;

$songTitle = null;
$author = null;
$archivo = null;
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['debug']) && ($_GET['debug'] === '1' || $_GET['debug'] === 'true')) $debug = true;
    if (isset($_GET['songTitle'])) $songTitle = trim($_GET['songTitle']);
    if (isset($_GET['author'])) $author = trim($_GET['author']);
    if (isset($_GET['archivo'])) $archivo = trim($_GET['archivo']);
} else {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data && is_array($data)) {
        if (isset($data['debug']) && ($data['debug'] === 1 || $data['debug'] === '1' || $data['debug'] === true)) $debug = true;
        if (isset($data['songTitle'])) $songTitle = trim($data['songTitle']);
        if (isset($data['author'])) $author = trim($data['author']);
        if (isset($data['archivo'])) $archivo = trim($data['archivo']);
    } else {
        if (isset($_POST['debug']) && ($_POST['debug'] === '1' || $_POST['debug'] === 'true')) $debug = true;
        if (isset($_POST['songTitle'])) $songTitle = trim($_POST['songTitle']);
        if (isset($_POST['author'])) $author = trim($_POST['author']);
        if (isset($_POST['archivo'])) $archivo = trim($_POST['archivo']);
    }
}

try {
    if (($archivo === null || $archivo === '') && ($songTitle === null || $songTitle === '')) {
        if ($debug) error_log('[obtener_frases] Missing songTitle and archivo');
        echo json_encode(['status' => 'error', 'message' => 'Se requieren songTitle o archivo (y author si no usa archivo)']);
        $conn->close();
        exit;
    }

    $originalSongTitle = $songTitle;
    if (strpos($songTitle, '_') !== false) {
        list($titlePart, $authorPart) = explode('_', $songTitle, 2);
        $titlePart = preg_replace('/\.[^.]+$/', '', $titlePart);
        $authorPart = preg_replace('/\.[^.]+$/', '', $authorPart);
        $titlePart = trim($titlePart);
        $authorPart = trim($authorPart);
        if ($titlePart !== '') $songTitle = $titlePart;
        if (($author === null || $author === '') && $authorPart !== '') {
            $author = str_replace('_', ' ', $authorPart);
        }
    }

    if (($archivo === null || $archivo === '') && ($author === null || $author === '')) {
        if ($debug) error_log('[obtener_frases] Missing author after parsing songTitle: ' . var_export($originalSongTitle, true));
        echo json_encode(['status' => 'error', 'message' => 'Se requieren songTitle y author']);
        $conn->close();
        exit;
    }

    if ($archivo !== null && $archivo !== '') {
        $archivo = basename($archivo);
        $archivoEsc = $conn->real_escape_string($archivo);
        $sql = "SELECT f.id_frase, f.ingles_frase, f.español_frase, f.tiempo_frase, f.canciones_id_frase "
             . "FROM frases_vr f "
             . "JOIN canciones_vr c ON f.canciones_id_frase = c.id_cancion "
             . "WHERE c.archivo_cancion = '" . $archivoEsc . "' "
             . "ORDER BY f.id_frase ASC";
        $match_type = 'archivo';
        error_log('[obtener_frases] Searching by archivo_cancion: ' . $archivo);
    } else {
        $songTitleEsc = $conn->real_escape_string($songTitle);
        $authorEsc = $conn->real_escape_string($author);
        $sql = "SELECT f.id_frase, f.ingles_frase, f.español_frase, f.tiempo_frase, f.canciones_id_frase "
             . "FROM frases_vr f "
             . "JOIN canciones_vr c ON f.canciones_id_frase = c.id_cancion "
             . "WHERE c.titulo_cancion = '" . $songTitleEsc . "' "
             . "AND c.autor_cancion = '" . $authorEsc . "' "
             . "ORDER BY f.id_frase ASC";
        $match_type = 'title_author';
    }

    if ($debug) {
        $debugParams = ['songTitle' => $songTitle, 'author' => $author, 'archivo' => $archivo];
        error_log('[obtener_frases] Params: ' . var_export($debugParams, true));
        error_log('[obtener_frases] SQL: ' . $sql);
    }

    $res = $conn->query($sql);
    if ($res === false) throw new Exception('Error en la consulta: ' . $conn->error);
    $phrases = [];
    while ($row = $res->fetch_assoc()) {
        $phrases[] = [
            'id_frase' => (int)$row['id_frase'],
            'ingles_frase' => $row['ingles_frase'],
            'espanol_frase' => $row['español_frase'],
            'tiempo_frase' => $row['tiempo_frase'],
            'id_cancion' => isset($row['canciones_id_frase']) ? (int)$row['canciones_id_frase'] : null
        ];
    }
    if ($debug) {
        error_log('[obtener_frases] Found rows: ' . count($phrases));
    }

    $resp = ['status' => 'success', 'phrases' => $phrases];
    if ($debug) {
        $debugInfo = [ 'params' => ['songTitle' => $songTitle, 'author' => $author, 'archivo' => $archivo], 'sql' => $sql, 'rows' => count($phrases) ];
        $debugInfo['match_type'] = isset($match_type) ? $match_type : 'unknown';
        $resp['debug'] = $debugInfo;
    }

    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
    if (isset($res) && is_object($res)) $res->free();
    $conn->close();
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    if (isset($res) && is_object($res)) $res->free();
    if (isset($conn) && is_object($conn)) $conn->close();
    exit;
}

?>
