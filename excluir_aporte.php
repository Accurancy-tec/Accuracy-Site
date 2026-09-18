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

if (!isset($_POST["id_aporte"])) {

    echo json_encode([
        "success" => false,
        "message" => "ID do aporte não informado."
    ]);

    exit;
}

$aporte = new aporte();

$aporte->id_aporte = (int) $_POST["id_aporte"];

$aporte->id_usuario = $_SESSION["id"];

$aporte->excluir();