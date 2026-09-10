<?php
require_once "configs/email.php";

$emailteste = "enzogaeta30@gmail.com";
$codigo = "123456";

$resultado = enviarCodigo($emailteste, $codigo);

if($resultado){
    echo "Email enviado com sucesso!";
}
else{
    echo "Erro ao enviar email.";
}
