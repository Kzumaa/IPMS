<?php
require 'vendor/autoload.php';

use Firebase\JWT\JWT;

// --- CẤU HÌNH ---
$clientId = '1129323055317'; // Lấy từ App ID của bạn
$keyId    = 'L6FVXzkO_CyIY-cZBrAZPi5wcGt0cQM7nx2fC53VANU'; // Lấy từ Key ID của bạn
$pemPath  = 'storage/app/keys/coze_1.pem'; // Đường dẫn file key

// 1. Kiểm tra file key
if (!file_exists($pemPath)) {
    die("Lỗi: Không tìm thấy file private key tại $pemPath\n");
}
$privateKey = file_get_contents($pemPath);
if (strpos($privateKey, 'BEGIN PRIVATE KEY') === false) {
    die("Lỗi: File key có vẻ không đúng định dạng PEM.\n");
}

// 2. Tạo JWT
$now = time();
$payload = [
    'iss' => $clientId,
    'sub' => $clientId,
    'aud' => 'api.coze.com',
    'iat' => $now,
    'exp' => $now + 3600,
    'jti' => bin2hex(random_bytes(16)),
];

try {
    // Lưu ý: Phiên bản mới của firebase/php-jwt yêu cầu tham số chính xác
    $jwt = JWT::encode($payload, $privateKey, 'RS256', $keyId);
    echo "JWT đã tạo thành công (ký tự đầu): " . substr($jwt, 0, 50) . "...\n";
} catch (Exception $e) {
    die("Lỗi tạo JWT: " . $e->getMessage() . "\n");
}

// 3. Gửi Curl thủ công
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.coze.com/open/oauth/token");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'duration_seconds' => 86400
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $jwt
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Tắt check SSL tạm thời để loại trừ lỗi mạng local
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";
