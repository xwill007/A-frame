<?php
// Devuelve información del usuario en sesión si existe
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../connDB.php';

if (session_status() !== PHP_SESSION_ACTIVE) session_start();

if (isset($_SESSION['user_id'])) {
    $id = intval($_SESSION['user_id']);
    // Intentar recuperar info mínima del usuario
    $stmt = $conn->prepare('SELECT id, email, nombre FROM usuarios WHERE id = ? LIMIT 1');
    if ($stmt) {
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $res->num_rows) {
            $row = $res->fetch_assoc();
            echo json_encode(['status' => 'success', 'user' => ['id' => (int)$row['id'], 'email' => $row['email'] ?? null, 'nombre' => $row['nombre'] ?? null]], JSON_UNESCAPED_UNICODE);
            $stmt->close();
            $conn->close();
            exit;
        }
        $stmt->close();
    }
    // fallback: return id only
    echo json_encode(['status' => 'success', 'user' => ['id' => $id]]);
    $conn->close();
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'No user in session']);
$conn->close();
exit;

?>
