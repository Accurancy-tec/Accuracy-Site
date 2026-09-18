<?php

function buscarAcao($ticker)
{
    require_once __DIR__ . "/config.php";

    $url =
        BRAPI_BASE_URL .
        "/v2/stocks/quote?symbols=" .
        urlencode($ticker);

    $curl = curl_init($url);

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . BRAPI_TOKEN,
            "Accept: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);

    $inicio = microtime(true);

    $response = curl_exec($curl);

    $fim = microtime(true);

    error_log(
        "Tempo de execução da requisição: " .
        ($fim - $inicio)
    );

    if ($response === false) {

        $erro = curl_error($curl);

        curl_close($curl);

        return json_encode([
            "success" => false,
            "message" => $erro
        ]);
    }

    curl_close($curl);

    return $response;
}

function buscarSymbols()
{
    require_once __DIR__ . "/config.php";

    $url =
        BRAPI_BASE_URL .
        "/v2/tickers";

    $curl = curl_init($url);

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . BRAPI_TOKEN,
            "Accept: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);

    $response = curl_exec($curl);

    if ($response === false) {

        $erro = curl_error($curl);

        curl_close($curl);

        return json_encode([
            "success" => false,
            "message" => $erro
        ]);
    }

    curl_close($curl);

    return $response;
}

function buscarMoedas($moedas)
{
    require_once __DIR__ . "/config.php";

    $url =
        BRAPI_BASE_URL .
        "/v2/currency?currency=" .
        urlencode($moedas);

    $curl = curl_init($url);

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . BRAPI_TOKEN,
            "Accept: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);

    $response = curl_exec($curl);

    if ($response === false) {

        $erro = curl_error($curl);

        curl_close($curl);

        return json_encode([
            "success" => false,
            "message" => $erro
        ]);
    }

    curl_close($curl);

    return $response;
}

function buscarCripto($cripto)
{
    require_once __DIR__ . "/config.php";

    $url =
        BRAPI_BASE_URL .
        "/v2/crypto?coin=" .
        urlencode($cripto) .
        "&currency=BRL";

    $curl = curl_init($url);

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . BRAPI_TOKEN,
            "Accept: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);

    $response = curl_exec($curl);

    if ($response === false) {

        $erro = curl_error($curl);

        curl_close($curl);

        return json_encode([
            "success" => false,
            "message" => $erro
        ]);
    }

    curl_close($curl);

    return $response;
}