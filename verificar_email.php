<?php
session_start();

require_once "configs/conexao.php";
require_once "classes/usuario.class.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    //pega o codigo digitado

    $codigo = $_POST["codigo"];

    //cria o  objeto usuario

    $usuario = new usuario();

    //verifica o codigo
    $resultado = $usuario->verificarEmail($codigo);

    if ($resultado) {
        echo "Email verificado com sucesso!";

        //apaga o ID usado apenas durante a verificacao

        unset($_SESSION["id_verificacao"]);
    } else {
        echo "Codigo invalido ou expirado";
    }
}
