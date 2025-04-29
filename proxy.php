<?php
// Proxy za Moralis API pozive
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

// Moralis API konfiguracija
$moralisApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZCI6IjUyNTgyN2I2LTVmYzQtNGJiMS04YzZiLWZkMTFhNTMyZTgwOCIsIm9yZ0lkIjoiNDQ0NDE1IiwidXNlcklkIjoiNDU3MjQ1IiwidHlwZUlkIjoiNDIxZDliYWYtZmQzZS00MWNjLWI2YmMtYzRjMDQzOGMzNTM5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDU5MTc1MDAsImV4cCI6NDkwMTY3NzUwMH0.33JOk4pd2Acz-aIt8kwBqnvgZ2IXf9fHpAK0o6AujOk';
$moralisBaseUrl = 'https://deep-index.moralis.io/api/v2';

// Provjeri je li zahtjev OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Provjeri je li zahtjev valjan
if (!isset($_GET['endpoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nedostaje endpoint parametar']);
    exit;
}

$endpoint = $_GET['endpoint'];
$params = [];

// Kopiraj sve GET parametre osim 'endpoint'
foreach ($_GET as $key => $value) {
    if ($key !== 'endpoint') {
        $params[$key] = $value;
    }
}

// Izgradi URL za Moralis API
$url = $moralisBaseUrl . '/' . $endpoint;
if (!empty($params)) {
    $url .= '?' . http_build_query($params);
}

// Postavi cURL zahtjev
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: ' . $moralisApiKey,
    'Accept: application/json'
]);

// Logiraj zahtjev (samo za debug)
error_log("Proxy zahtjev: " . $url);

// Izvrši zahtjev
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Provjeri greške
if (curl_errno($ch)) {
    error_log("cURL greška: " . curl_error($ch));
    http_response_code(500);
    echo json_encode(['error' => 'Greška pri povezivanju s API-jem: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Logiraj odgovor (samo za debug)
error_log("API odgovor kod: " . $httpCode);
error_log("API odgovor (prvih 200 znakova): " . substr($response, 0, 200));

// Vrati odgovor klijentu
http_response_code($httpCode);
echo $response;
?>
