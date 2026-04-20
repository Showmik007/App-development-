<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$appsScriptUrl = "https://script.google.com/macros/s/AKfycbx62UaKONFeQj3YrH9Y9RwOmTAYf0cOa_IlMvo8T2ppzXbMu3sDhVctlPo93uMekIrcpA/exec";

$input = file_get_contents("php://input");

if (!$input) {
    echo json_encode([
        "reply" => "No input received."
    ]);
    exit;
}

$ch = curl_init($appsScriptUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

if ($response === false) {
    echo json_encode([
        "reply" => "CURL ERROR: " . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode([
        "reply" => "Apps Script error. HTTP Code: " . $httpCode,
        "raw" => $response
    ]);
    exit;
}

echo $response;