<?php
function buscarAcao($ticker)
{
    $url = getenv('BRAPI_BASE_URL') . "/v2/stocks/quote?symbols=" . urlencode($ticker);

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    
    curl_setopt_array($curl, [
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . getenv("BRAPI_TOKEN"),
            "Accept: application/json",
            
        ],
    ]);

    $inicio = microtime(true);

    $response = curl_exec($curl);

    $fim = microtime(true);

    error_log("Tempo de execução da requisição: " . ($fim - $inicio));

    if($response ===  false) {
        die("Erro na requisição: " . curl_error($curl). "-" . curl_error($curl));
        
        
    }

    curl_close($curl);
    return $response;

    function buscarSymbols()
    {
        $url = getenv('BRAPI_BASE_URL') . "/v2/tickers";

        $curl = curl_init($url);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        curl_setopt_array($curl, [
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer " . getenv("BRAPI_TOKEN"),
                "Accept: application/json"
            ]
        ]);

        $inicio = microtime(true);

        $response = curl_exec($curl);
        $fim = microtime(true);

        error_log("Tempo de execução da requisição: " . ($fim - $inicio));

        if($response === false) {
            die("Erro na requisição: " . curl_error($curl));
        }
        curl_close($curl);
        return $response;

    }

    function buscarMoedas($moedas)
    {
        $url = getenv('BRAPI_BASE   _URL') . "/v2/currency?currency=" . urlencode($moedas);

        $curl = curl_init($url);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        curl_setopt_array($curl, [
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer " . getenv("BRAPI_TOKEN"),
                "Accept: application/json"
            ]
        ]);

        $inicio = microtime(true);

        $response = curl_exec($curl);
        $fim = microtime(true);

        error_log("Tempo de execução da requisição: " . ($fim - $inicio));

        if($response === false) {
            die("Erro na requisição: " . curl_error($curl));
        }
        curl_close($curl);
        return $response;
    }

    function buscarCripto($cripto)
    {
        $url = getenv('BRAPI_BASE_URL') . "/v2/crypto?coin=" . urlencode($cripto) ."&currency=BRL";

        $curl = curl_init($url);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        curl_setopt_array($curl, [
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer " . getenv("BRAPI_TOKEN"),
                "Accept: application/json"
            ]
        ]);

        $inicio = microtime(true);

        $response = curl_exec($curl);
        $fim = microtime(true);

        error_log("Tempo de execução da requisição: " . ($fim - $inicio));

        if($response === false) {
            die("Erro na requisição: " . curl_error($curl));
        }
        curl_close($curl);
        return $response;
    }

}
?>