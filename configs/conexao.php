<?php

require_once __DIR__ . '/config.php';

try {

    $dsn = "pgsql:host=" . DB_HOST .
           ";port=" . DB_PORT .
           ";dbname=" . DB_NAME;

    $conexao = new PDO($dsn, DB_USER, DB_PASSWORD);

    $conexao->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION
    );

} catch (PDOException $erro) {

    echo json_encode([
        "success" => false,
        "message" => "Erro de conexão com o banco",
        "error" => $erro->getMessage()
    ]);

    exit;
}