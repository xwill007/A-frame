<?php
// Endpoint: obtener_palabras.php
// Devuelve las palabras de `palabras_vr`. Acepta GET o POST con:
// - id_frase  OR id_frase_palabra  (opcional). Si no se pasa, devuelve todas las palabras.

require_once __DIR__ . '/../../connDB.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($conn)) {
    error_log('[obtener_palabras] DB connection missing');
    echo json_encode(['status' => 'error', 'message' => 'No se pudo establecer la conexión a la base de datos.']);
    exit;
}

// soporte opcional de debug en querystring o body
$debug = false;
if (isset($_GET['debug']) && ($_GET['debug'] === '1' || $_GET['debug'] === 'true')) $debug = true;

// Sólo soportamos búsqueda por songTitle + author
$songTitle = null;
$author = null;
$archivo = null;
// Soportar GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['debug']) && ($_GET['debug'] === '1' || $_GET['debug'] === 'true')) $debug = true;
    if (isset($_GET['songTitle'])) $songTitle = trim($_GET['songTitle']);
    if (isset($_GET['author'])) $author = trim($_GET['author']);
    if (isset($_GET['archivo'])) $archivo = trim($_GET['archivo']);
} else {
    // Soportar POST con JSON o form-encoded
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
    // Allow using either 'archivo' (preferred) OR songTitle+author.
    // If neither archivo nor songTitle is provided, return an error.
    if (($archivo === null || $archivo === '') && ($songTitle === null || $songTitle === '')) {
        if ($debug) error_log('[obtener_palabras] Missing songTitle and archivo');
        echo json_encode(['status' => 'error', 'message' => 'Se requieren songTitle o archivo (y author si no usa archivo)']);
        $conn->close();
        exit;
    }

    $originalSongTitle = $songTitle;
    if (strpos($songTitle, '_') !== false) {
        list($titlePart, $authorPart) = explode('_', $songTitle, 2);
        // remove extension from both parts
        $titlePart = preg_replace('/\.[^.]+$/', '', $titlePart);
        $authorPart = preg_replace('/\.[^.]+$/', '', $authorPart);
        $titlePart = trim($titlePart);
        $authorPart = trim($authorPart);
        if ($titlePart !== '') $songTitle = $titlePart;
        if (($author === null || $author === '') && $authorPart !== '') {
            $author = str_replace('_', ' ', $authorPart);
        }
    }

    // If archivo is not provided, author is required (we need title+author to match)
    if (($archivo === null || $archivo === '') && ($author === null || $author === '')) {
        if ($debug) error_log('[obtener_palabras] Missing author after parsing songTitle: ' . var_export($originalSongTitle, true));
        echo json_encode(['status' => 'error', 'message' => 'Se requieren songTitle y author']);
        $conn->close();
        exit;
    }
    // Normalize title and author for comparison: lowercase, remove punctuation and extra spaces
    $normalize = function($s) {
        $s = mb_strtolower($s, 'UTF-8');
        $s = preg_replace('/\.[^.]+$/', '', $s); // remove extension
        $s = str_replace(['_', '-'], ' ', $s);
        $s = preg_replace('/[^\p{L}\p{N}\s]/u', '', $s); // remove punctuation
        $s = preg_replace('/\s+/', ' ', trim($s));
        return $s;
    };

    $normTitle = $normalize($songTitle);
    $normAuthor = $normalize($author);
    $pattern = '%' . $normTitle . '%';

    // Decide whether to match by archivo_cancion (filename) or by title+author.
    // The user requested to search "tal cual" (exact) and to use SQL with variables directly
    // (no prepared/bind). We will escape inputs with real_escape_string and insert them into
    // the query string. This removes the previous normalization/REPLACE filters.
    if ($archivo !== null && $archivo !== '') {
        // Use the provided archivo parameter as-is (basename)
        $archivo = basename($archivo);
           $archivoEsc = $conn->real_escape_string($archivo);
           $sql = "SELECT p.id_palabra, p.esp_palabra, p.ing_palabra, p.id_frase_palabra, p.id_cancion_palabra "
               . "FROM palabras_vr p "
               . "JOIN canciones_vr c ON p.id_cancion_palabra = c.id_cancion "
               . "WHERE c.archivo_cancion = '" . $archivoEsc . "' "
               . "ORDER BY p.id_palabra ASC";
        $match_type = 'archivo';
        error_log('[obtener_palabras] Searching by archivo_cancion: ' . $archivo);
    } else {
        // Fallback: exact match by title and author (no transformations)
        $songTitleEsc = $conn->real_escape_string($songTitle);
        $authorEsc = $conn->real_escape_string($author);
        $sql = "SELECT p.id_palabra, p.esp_palabra, p.ing_palabra, p.id_frase_palabra, p.id_cancion_palabra "
             . "FROM palabras_vr p "
             . "JOIN canciones_vr c ON p.id_cancion_palabra = c.id_cancion "
             . "WHERE c.titulo_cancion = '" . $songTitleEsc . "' "
             . "AND c.autor_cancion = '" . $authorEsc . "' "
             . "ORDER BY p.id_palabra ASC";
        $match_type = 'title_author';
    }

    if ($debug) {
        $debugParams = ['songTitle' => $songTitle, 'author' => $author, 'archivo' => $archivo];
        error_log('[obtener_palabras] Params: ' . var_export($debugParams, true));
        error_log('[obtener_palabras] SQL: ' . $sql);
    }

    $res = $conn->query($sql);
    if ($res === false) throw new Exception('Error en la consulta: ' . $conn->error);
    $words = [];
    while ($row = $res->fetch_assoc()) {
        $words[] = [
            'id_palabra' => (int)$row['id_palabra'],
            'esp_palabra' => $row['esp_palabra'],
            'ing_palabra' => $row['ing_palabra'],
            'id_frase_palabra' => isset($row['id_frase_palabra']) ? (int)$row['id_frase_palabra'] : null,
            'id_cancion_palabra' => isset($row['id_cancion_palabra']) ? (int)$row['id_cancion_palabra'] : null
        ];
    }
    if ($debug) {
        error_log('[obtener_palabras] Found rows: ' . count($words));
    }

    $resp = ['status' => 'success', 'words' => $words];
    if ($debug) {
        $debugInfo = [ 'params' => ['songTitle' => $songTitle, 'author' => $author, 'archivo' => $archivo], 'sql' => $sql, 'rows' => count($words) ];
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
