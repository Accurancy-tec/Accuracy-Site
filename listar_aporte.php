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

$aporte = new aporte();

$aporte->id_usuario = $_SESSION["id"];

$aporte->listar();