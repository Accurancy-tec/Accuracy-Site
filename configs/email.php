<?php
use PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

//carrega o PHPMailer instalado pelo composer

require_once __DIR__ . "/../vendor/autoload.php";

function enviarCodigo($email, $codigo){
    $mail = new PHPMailer(true);

    try{
        //Utiliza SMTP
        $mail->isSMTP();

        //Servidor do gmail
        $mail->Host = "smtp.gmail.com";

        //ativa a autenticacao
        $mail->SMTPAuth = true;

        //email que irá enviar
        $mail->Username = "accuracytcc@gmail.com";
        $mail->Password = "kkie mzch rlpt qozz";

        //segurança
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

        //PORTA GMAIL
        $mail->PORT = 587;

        //remetente
        $mail->setFrom("tccaccuracy@gmail.com", "Accuracy");

        //destinatario

        $mail->addAddress($email);

        //define que o email terá html
        $mail->isHTML(true);

        //assunto
        $mail->Subject = "Verificacao de email - Accuracy";

        //corpo do email

        $mail->Bofy = 
        "<h2>Verificaçâo de email</h2>
        <p>Olá!</p>
        <p>Seu código para verificaçâo de email: </p>
        <h1>$codigo</h1>";

        //envia o email
        $mail->send();
        return true;

        


    }
    catch(PDOException $erro){
        return false;
    }
}
?>