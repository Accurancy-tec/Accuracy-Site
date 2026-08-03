<?php
define ('Banco','db_Acurracy');
define ('Usuario','root');
define ('Senha','');

try{
    $conexao = new PDO('mysql:host=localhost; dbname='.Banco, Usuario, Senha);
    $conexao->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conexao->exec('set names utf8');
}
catch(PDOException $erro){
    echo 'Erro de conexão ' . $erro->getMessage();
}
?>