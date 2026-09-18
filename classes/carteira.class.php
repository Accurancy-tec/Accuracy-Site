<?php

class carteira
{
    private $id_usuario;

    private $acoesPermitidas = [
        "PETR4",
        "XPML11"
    ];

    public function __construct($id_usuario)
    {
        $this->id_usuario = $id_usuario;
    }

    public function obterCarteira()
    {
        global $conexao;

        require_once __DIR__ . '/../configs/config.php';

        $sql = "SELECT
                    id_aporte,
                    ativo_aporte,
                    preco_aporte,
                    tipo_aporte,
                    data_aporte,
                    preco_unitario_compra
                FROM tb_aporte
                WHERE id_usuario = ?
                ORDER BY data_aporte DESC, id_aporte DESC";

        $stmt = $conexao->prepare($sql);
        $stmt->execute([$this->id_usuario]);

        $aportes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $carteira = [];
        $totalInvestido = 0;
        $precosAtuais = [];

        foreach ($aportes as $aporte) {

            $ativo = $aporte["ativo_aporte"];

            $valorAporte = (float) $aporte["preco_aporte"];

            $precoCompra = $aporte["preco_unitario_compra"] !== null
                ? (float) $aporte["preco_unitario_compra"]
                : 0;

            $totalInvestido += $valorAporte;

            if (!isset($carteira[$ativo])) {

                $carteira[$ativo] = [
                    "ativo" => $ativo,
                    "quantidade" => 0,
                    "total_investido" => 0,
                    "preco_compra" => 0,
                    "preco_atual" => null,
                    "valor_atual" => 0,
                    "rendimento" => 0,
                    "rentabilidade" => 0,
                    "porcentagem" => 0
                ];
            }

            $carteira[$ativo]["total_investido"] += $valorAporte;

            if ($precoCompra > 0) {

                $quantidade = $valorAporte / $precoCompra;

                $carteira[$ativo]["quantidade"] += $quantidade;

                if ($carteira[$ativo]["quantidade"] > 0) {

                    $carteira[$ativo]["preco_compra"] =
                        $carteira[$ativo]["total_investido"] /
                        $carteira[$ativo]["quantidade"];
                }
            }
        }

        foreach ($carteira as $ativo => &$item) {

            if (in_array($ativo, $this->acoesPermitidas)) {

                if (!isset($precosAtuais[$ativo])) {
                    $precosAtuais[$ativo] =
                        $this->buscarPrecoAtual($ativo);
                }

                $precoAtual = $precosAtuais[$ativo];

                $item["preco_atual"] = $precoAtual;

                if (
                    $precoAtual !== null &&
                    $item["quantidade"] > 0
                ) {

                    $item["valor_atual"] =
                        $item["quantidade"] * $precoAtual;

                    $item["rendimento"] =
                        $item["valor_atual"] -
                        $item["total_investido"];

                    if ($item["total_investido"] > 0) {

                        $item["rentabilidade"] =
                            (
                                $item["rendimento"] /
                                $item["total_investido"]
                            ) * 100;
                    }
                }
            }
        }

        unset($item);

        $patrimonioTotal = 0;
        $rendimentoTotal = 0;

        foreach ($carteira as $item) {

            if ($item["preco_atual"] !== null) {

                $patrimonioTotal += $item["valor_atual"];
                $rendimentoTotal += $item["rendimento"];

            } else {

                $patrimonioTotal += $item["total_investido"];
            }
        }

        $rentabilidadeTotal = 0;

        if ($totalInvestido > 0) {

            $rentabilidadeTotal =
                (
                    $rendimentoTotal /
                    $totalInvestido
                ) * 100;
        }

        foreach ($carteira as &$item) {

            $valorDistribuicao =
                $item["valor_atual"] > 0
                    ? $item["valor_atual"]
                    : $item["total_investido"];

            $item["porcentagem"] =
                $patrimonioTotal > 0
                    ? (
                        $valorDistribuicao /
                        $patrimonioTotal
                    ) * 100
                    : 0;
        }

        unset($item);

        return [
            "carteira" => $carteira,
            "totalInvestido" => $totalInvestido,
            "patrimonioTotal" => $patrimonioTotal,
            "rendimentoTotal" => $rendimentoTotal,
            "rentabilidadeTotal" => $rentabilidadeTotal,
            "totalAtivos" => count($carteira)
        ];
    }

    private function buscarPrecoAtual($ticker)
    {
        $url =
            BRAPI_BASE_URL .
            "/v2/stocks/quote?symbols=" .
            urlencode($ticker);

        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer " . BRAPI_TOKEN,
                "Accept: application/json"
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $resposta = curl_exec($curl);

        if ($resposta === false) {

            curl_close($curl);

            return null;
        }

        $codigoHTTP =
            curl_getinfo(
                $curl,
                CURLINFO_HTTP_CODE
            );

        curl_close($curl);

        if ($codigoHTTP !== 200) {
            return null;
        }

        $dados = json_decode(
            $resposta,
            true
        );

        if (
            !isset(
                $dados["results"][0]["regularMarketPrice"]
            )
        ) {
            return null;
        }

        return (float)
            $dados["results"][0]["regularMarketPrice"];
    }
}