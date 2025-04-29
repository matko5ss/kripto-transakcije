<?php
// Proxy za CoinGecko API pozive
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

// CoinGecko API konfiguracija
$coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';

// Provjeri je li zahtjev OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Dohvati parametre iz zahtjeva
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Izgradi URL za CoinGecko API ovisno o akciji
switch ($action) {
    case 'price':
        // Dohvati cijenu Ethereuma
        $url = $coingeckoBaseUrl . '/simple/price?ids=ethereum&vs_currencies=usd,eur,hrk&include_24hr_change=true';
        break;
    case 'market':
        // Dohvati podatke o tržištu
        $url = $coingeckoBaseUrl . '/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false';
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Nedostaje action parametar']);
        exit;
}

// Logiraj zahtjev (samo za debug)
error_log("CoinGecko proxy zahtjev: " . $url);

// Postavi cURL zahtjev
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

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
