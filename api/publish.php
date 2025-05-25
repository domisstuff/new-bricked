<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = $input['username'];
    $indexHTML = $input['files']['index.html'];
    
    // Create folder
    $folderPath = "../$username";
    if (!file_exists($folderPath)) {
        mkdir($folderPath, 0755, true);
    }
    
    // Write index.html
    file_put_contents("$folderPath/index.html", $indexHTML);
    
    echo json_encode(['success' => true, 'url' => "/$username/"]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
