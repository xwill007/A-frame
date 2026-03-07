<?php
// Endpoint: login_usuario.php
// Accepts JSON {email, password} (or form-encoded) via POST and returns JSON result

require_once __DIR__ . '/../../connDB.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($conn)) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection not available']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if ($data && is_array($data)) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
} else {
    // Fallback to form-encoded POST
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
}

$email = trim($email);

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Email y contraseña son requeridos']);
    exit;
}

// Prepare and fetch user
$stmt = $conn->prepare('SELECT id, password FROM usuarios WHERE email = ? LIMIT 1');
if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Error al preparar la consulta']);
    exit;
}
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado']);
    $stmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();
$hash = $row['password'];

if (password_verify($password, $hash)) {
    // Successful login: start session and return redirect + user id
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    $_SESSION['user_id'] = $row['id'];

    echo json_encode(['status' => 'success', 'redirect' => '/A-frame/english-vr/VR/index.html', 'user_id' => (int)$row['id']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Contraseña incorrecta']);
}

$stmt->close();
$conn->close();
exit;

?>
