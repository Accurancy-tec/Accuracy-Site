
<?php
include 'config.php'; 
include 'brapiService.php'; 

header("Content-Type: application/json"); 

$url = BRAPI_BASE_URL . "/v2/stocks/quote?symbols=PETR4";

$curl = curl_init($url); 

curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);

curl_setopt($curl, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . BRAPI_TOKEN,
    "Accept: application/json"
]);

$resposta = curl_exec($curl);

if ($resposta === false) {
    echo "ERRO CURL: " . curl_error($curl);
} else {
    echo $resposta;
}

curl_close($curl);


?>