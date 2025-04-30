<?php
// Proxy za Etherscan API pozive
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

// Etherscan API konfiguracija
$etherscanApiKey = 'KSSPW994NM9BG7N7I9MZV8A4M766MED5CZ'; // Etherscan API ključ
$etherscanBaseUrl = 'https://api.etherscan.io/api';

// Provjeri je li zahtjev OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Dohvati parametre iz zahtjeva
$action = isset($_GET['action']) ? $_GET['action'] : '';
$address = isset($_GET['address']) ? $_GET['address'] : '';
$txhash = isset($_GET['txhash']) ? $_GET['txhash'] : '';
$blockno = isset($_GET['blockno']) ? $_GET['blockno'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;

// Logiraj parametre (samo za debug)
error_log("Etherscan proxy parametri: action=$action, address=$address, txhash=$txhash, blockno=$blockno, limit=$limit");

// Izgradi URL za Etherscan API ovisno o akciji
$url = $etherscanBaseUrl . '?apikey=' . $etherscanApiKey;

switch ($action) {
    case 'txlist':
        // Dohvati transakcije za adresu
        $url .= '&module=account&action=txlist&address=' . $address . '&startblock=0&endblock=99999999&sort=desc&page=1&offset=' . $limit;
        break;
    case 'balance':
        // Dohvati stanje računa
        $url .= '&module=account&action=balance&address=' . $address . '&tag=latest';
        break;
    case 'tx':
        // Dohvati detalje transakcije
        $url .= '&module=proxy&action=eth_getTransactionByHash&txhash=' . $txhash;
        break;
    case 'block':
        // Dohvati detalje bloka
        if ($blockno === 'latest') {
            $url .= '&module=proxy&action=eth_blockNumber';
        } else {
            // Ako je blockno broj, pretvori ga u hex
            if (is_numeric($blockno)) {
                $blockno_hex = '0x' . dechex((int)$blockno);
                $url .= '&module=proxy&action=eth_getBlockByNumber&tag=' . $blockno_hex . '&boolean=true';
            } else {
                $url .= '&module=proxy&action=eth_getBlockByNumber&tag=' . $blockno . '&boolean=true';
            }
        }
        break;
    case 'blocktx':
        // Dohvati transakcije u bloku
        if (is_numeric($blockno)) {
            $blockno_hex = '0x' . dechex((int)$blockno);
            $url .= '&module=proxy&action=eth_getBlockByNumber&tag=' . $blockno_hex . '&boolean=true';
        } else {
            $url .= '&module=proxy&action=eth_getBlockByNumber&tag=' . $blockno . '&boolean=true';
        }
        break;
    case 'ethprice':
        // Dohvati cijenu Ethereuma
        $url .= '&module=stats&action=ethprice';
        break;
    case 'gastracker':
        // Dohvati cijenu gasa
        $url .= '&module=gastracker&action=gasoracle';
        break;
    case 'tokentx':
        // Dohvati ERC-20 token transakcije za adresu
        $url .= '&module=account&action=tokentx&address=' . $address . '&startblock=0&endblock=99999999&sort=desc&page=1&offset=' . $limit;
        break;
    case 'tokennfttx':
        // Dohvati ERC-721 (NFT) transakcije za adresu
        $url .= '&module=account&action=tokennfttx&address=' . $address . '&startblock=0&endblock=99999999&sort=desc&page=1&offset=' . $limit;
        break;
    case 'getminedblocks':
        // Dohvati izrudarene blokove za adresu
        $url .= '&module=account&action=getminedblocks&address=' . $address . '&blocktype=blocks&page=1&offset=' . $limit;
        break;
    case 'stats':
        // Dohvati statistiku mreže
        $url .= '&module=stats&action=ethsupply';
        break;
    case 'blocks':
        // Dohvati zadnje blokove (koristimo getBlockNumber za dohvaćanje zadnjeg broja bloka,
        // a zatim ćemo u JavaScript-u dohvatiti nekoliko prethodnih blokova)
        $url .= '&module=proxy&action=eth_blockNumber';
        break;
    case 'getblockreward':
        // Dohvati nagradu za blok
        $url .= '&module=block&action=getblockreward&blockno=' . $blockno;
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Nedostaje action parametar']);
        exit;
}

// Logiraj zahtjev (samo za debug)
error_log("Etherscan proxy zahtjev: " . $url);

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
    echo json_encode(['error' => 'Greška pri dohvaćanju podataka: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Zatvori cURL sesiju
curl_close($ch);

// Provjeri HTTP status kod
if ($httpCode >= 400) {
    error_log("HTTP greška: " . $httpCode);
    http_response_code($httpCode);
    echo json_encode(['error' => 'API greška: ' . $httpCode]);
    exit;
}

// Logiraj odgovor (samo za debug)
error_log("Etherscan proxy odgovor: " . substr($response, 0, 200) . "...");

// Vrati odgovor klijentu
echo $response;
?>
