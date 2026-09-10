<?php

class aporte
{
    public $id_aporte;
    public $ativo_aporte;
    public $preco_aporte;
    public $tipo_aporte;
    public $recorrencia_aporte;
    public $data_aporte;
    public $dia_recorrencia;
    public $observacao_aporte;
    public $id_usuario;
    public $preco_unitario_compra;

    private $acoes = [
        "PETR4",
        "XPML11"
    ];

    private $criptos = [
        "Bitcoin" => "bitcoin"
    ];

    public function cadastrar()
    {
        global $conexao;

        try {

            $this->preco_unitario_compra =
                $this->buscarPrecoAtual($this->ativo_aporte);

            $sql = "INSERT INTO tb_aporte
                    (
                        ativo_aporte,
                        preco_aporte,
                        tipo_aporte,
                        recorrencia_aporte,
                        data_aporte,
                        id_usuario,
                        preco_unitario_compra,
                        dia_recorrencia,
                        observacao_aporte
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    RETURNING id_aporte";

            $stmt = $conexao->prepare($sql);

            $stmt->bindValue(1, $this->ativo_aporte);
            $stmt->bindValue(2, $this->preco_aporte);
            $stmt->bindValue(3, $this->tipo_aporte);
            $stmt->bindValue(4, $this->recorrencia_aporte);
            $stmt->bindValue(5, $this->data_aporte);
            $stmt->bindValue(6, $this->id_usuario);
            $stmt->bindValue(7, $this->preco_unitario_compra);

            if ($this->dia_recorrencia === null) {
                $stmt->bindValue(8, null, PDO::PARAM_NULL);
            } else {
                $stmt->bindValue(8, $this->dia_recorrencia);
            }

            if ($this->observacao_aporte === null) {
                $stmt->bindValue(9, null, PDO::PARAM_NULL);
            } else {
                $stmt->bindValue(9, $this->observacao_aporte);
            }

            $stmt->execute();

            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "message" => "Aporte cadastrado com sucesso.",
                "id_aporte" => $resultado["id_aporte"],
                "preco_unitario_compra" => $this->preco_unitario_compra
            ]);

            exit;

        } catch (PDOException $erro) {

            echo json_encode([
                "success" => false,
                "message" => "Erro ao cadastrar aporte.",
                "error" => $erro->getMessage()
            ]);

            exit;
        }
    }

    public function listar()
    {
        global $conexao;

        try {

            $sql = "SELECT
                        id_aporte,
                        ativo_aporte,
                        preco_aporte,
                        tipo_aporte,
                        recorrencia_aporte,
                        data_aporte,
                        preco_unitario_compra,
                        dia_recorrencia,
                        observacao_aporte
                    FROM tb_aporte
                    WHERE id_usuario = ?
                    ORDER BY data_aporte DESC, id_aporte DESC";

            $stmt = $conexao->prepare($sql);

            $stmt->bindValue(1, $this->id_usuario);

            $stmt->execute();

            $aportes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $cache = [];

            foreach ($aportes as &$item) {

                $item["preco_atual"] = null;
                $item["rentabilidade"] = null;

                if (
                    $item["preco_unitario_compra"] !== null &&
                    $item["preco_unitario_compra"] > 0
                ) {

                    $ativo = $item["ativo_aporte"];

                    if (!array_key_exists($ativo, $cache)) {
                        $cache[$ativo] =
                            $this->buscarPrecoAtual($ativo);
                    }

                    $precoAtual = $cache[$ativo];

                    if ($precoAtual !== null) {

                        $item["preco_atual"] = $precoAtual;

                        $item["rentabilidade"] = round(
                            (
                                (
                                    $precoAtual -
                                    $item["preco_unitario_compra"]
                                )
                                /
                                $item["preco_unitario_compra"]
                            ) * 100,
                            2
                        );
                    }
                }
            }

            echo json_encode([
                "success" => true,
                "aportes" => $aportes
            ]);

            exit;

        } catch (PDOException $erro) {

            echo json_encode([
                "success" => false,
                "message" => "Erro ao listar aportes.",
                "error" => $erro->getMessage()
            ]);

            exit;
        }
    }

    public function excluir()
    {
        global $conexao;

        try {

            $sql = "DELETE FROM tb_aporte
                    WHERE id_aporte = ?
                    AND id_usuario = ?";

            $stmt = $conexao->prepare($sql);

            $stmt->bindValue(1, $this->id_aporte);
            $stmt->bindValue(2, $this->id_usuario);

            $stmt->execute();

            echo json_encode([
                "success" => true,
                "message" => "Aporte excluído com sucesso."
            ]);

            exit;

        } catch (PDOException $erro) {

            echo json_encode([
                "success" => false,
                "message" => "Erro ao excluir aporte.",
                "error" => $erro->getMessage()
            ]);

            exit;
        }
    }

    private function buscarPrecoAtual($ativo)
    {
        if (in_array($ativo, $this->acoes)) {
            return $this->buscarPrecoAcao($ativo);
        }

        if (array_key_exists($ativo, $this->criptos)) {
            return $this->buscarPrecoCripto(
                $this->criptos[$ativo]
            );
        }

        return null;
    }

    private function buscarPrecoAcao($ticker)
    {
        require_once __DIR__ . '/../configs/config.php';

        $url = BRAPI_BASE_URL .
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

        $resposta = curl_exec($curl);

        if ($resposta === false) {

            error_log(
                "Erro BRAPI: " . curl_error($curl)
            );

            curl_close($curl);

            return null;
        }

        curl_close($curl);

        $dados = json_decode($resposta, true);

        return $dados["results"][0]["regularMarketPrice"] ?? null;
    }

    private function buscarPrecoCripto($idCoingecko)
    {
        $url =
            "https://api.coingecko.com/api/v3/simple/price" .
            "?ids=" . urlencode($idCoingecko) .
            "&vs_currencies=brl";

        $resposta = @file_get_contents($url);

        if ($resposta === false) {
            return null;
        }

        $dados = json_decode($resposta, true);

        return $dados[$idCoingecko]["brl"] ?? null;
    }
}