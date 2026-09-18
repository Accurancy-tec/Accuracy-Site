<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once "configs/conexao.php";
require_once "classes/aporte.class.php";

if (!isset($_SESSION["id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Não autenticado."
    ]);

    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Método de requisição inválido."
    ]);

    exit;
}

$ativo = $_POST["ativo"] ?? "";
$valor = $_POST["valor"] ?? "";
$tipo = $_POST["tipo"] ?? "";
$recorrencia = $_POST["recorrencia"] ?? "none";
$data = $_POST["data"] ?? "";
$diaRecorrencia = $_POST["dia_recorrencia"] ?? "";
$observacao = $_POST["observacao"] ?? "";

if ($ativo === "") {

    echo json_encode([
        "success" => false,
        "message" => "Selecione um ativo."
    ]);

    exit;
}

if ($valor === "" || !is_numeric($valor) || $valor <= 0) {

    echo json_encode([
        "success" => false,
        "message" => "Digite um valor válido."
    ]);

    exit;
}

if ($data === "") {

    echo json_encode([
        "success" => false,
        "message" => "Informe a data do aporte."
    ]);

    exit;
}

$aporte = new aporte();

$aporte->ativo_aporte = $ativo;
$aporte->preco_aporte = (float) $valor;
$aporte->tipo_aporte = $tipo;
$aporte->recorrencia_aporte = $recorrencia;
$aporte->data_aporte = $data;

$aporte->dia_recorrencia =
    $diaRecorrencia !== ""
        ? (int) $diaRecorrencia
        : null;

$aporte->observacao_aporte =
    $observacao !== ""
        ? $observacao
        : null;

$aporte->id_usuario = $_SESSION["id"];

$aporte->cadastrar();