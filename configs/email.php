<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . "/../vendor/autoload.php";

function enviarCodigo($email, $codigo)
{
    $mail = new PHPMailer(true);

    try {

        $mail->isSMTP();

        $mail->Host = "smtp.gmail.com";
        $mail->SMTPAuth = true;

        $mail->Username = "tccaccuracy@gmail.com";

        // COLOQUE SUA NOVA SENHA DE APP AQUI
        $mail->Password = "admv flxn ibxm mvfd";

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->setFrom(
            "tccaccuracy@gmail.com",
            "Accuracy"
        );

        $mail->addAddress($email);

        $mail->isHTML(true);

        $mail->Subject = "Verificacao de email - Accuracy";

        $mail->Body = "
            <h2>Verificação de e-mail</h2>
            <p>Olá!</p>
            <p>Seu código de verificação é:</p>
            <h1>$codigo</h1>
            <p>Esse código é válido por 10 minutos.</p>
        ";

        $mail->send();

        return true;

    } catch (Exception $erro) {

        echo "Erro do PHPMailer: " . $mail->ErrorInfo;

        return false;
    }
}