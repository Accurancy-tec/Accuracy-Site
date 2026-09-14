<?php

session_start();

require_once "configs/conexao.php";
require_once "classes/usuario.class.php";

$emailOculto = "e-mail não encontrado";

$id = $_SESSION["id_verificacao"] ?? null;

if ($id) {

    $sql = "SELECT email_usuario
            FROM usuarios_info
            WHERE id_usuario = :id";

    $stmt = $conexao->prepare($sql);
    $stmt->bindValue(":id", $id);
    $stmt->execute();

    $dados = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($dados) {

        $email = $dados["email_usuario"];

        $partes = explode("@", $email);

        if (count($partes) == 2) {

            $primeiraLetra = substr($partes[0], 0, 1);
            $dominio = $partes[1];

            $emailOculto = $primeiraLetra . "****@" . $dominio;
        }
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    header("Content-Type: application/json");

    $codigo = $_POST["codigo"] ?? "";

    $id = $_SESSION["id_verificacao"] ?? null;

    if (!$id) {

        echo json_encode([
            "success" => false,
            "message" => "Sessão de verificação inválida."
        ]);

        exit;
    }

    $usuario = new usuario();

    if ($usuario->verificarEmail($id, $codigo)) {

        unset($_SESSION["id_verificacao"]);

        echo json_encode([
            "success" => true,
            "message" => "E-mail verificado com sucesso!"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Código inválido ou expirado."
        ]);
    }

    exit;
}

?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme seu código — Accuracy</title>
  <link rel="stylesheet" href="css/confirmacodigo.css">
</head>

<body>

  <div class="wrap">
    <div class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 17 9 11 13 15 21 7" />
        </svg>
      </div>
      <div class="brand-name">Accuracy</div>
    </div>

    <div class="card">
      <div class="icon-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h1>Confirme seu código</h1>
      <p class="subtitle">Enviamos um código de 6 dígitos para<br><strong>
          <?= htmlspecialchars($emailOculto) ?>
        </strong></p>

      <div class="code-row" id="codeRow">
        <input class="code-input" type="text" inputmode="numeric" maxlength="1" data-index="0">
        <input class="code-input" type="text" inputmode="numeric" maxlength="1" data-index="1">
        <input class="code-input" type="text" inputmode="numeric" maxlength="1" data-index="2">
        <input class="code-input" type="text" inputmode="numeric" maxlength="1" data-index="3">
        <input class="code-input" type="text" inputmode="numeric" maxlength="1" data-index="4">
        <input class="code-input" type="text" inputmode="numeric" maxlength="1" data-index="5">
      </div>

      <div class="status-row" id="statusRow"></div>

      <button class="btn" id="confirmBtn" disabled>Confirmar código</button>

      <div class="resend">
        Não recebeu o código? <a href="#" id="resendLink">Reenviar (<span class="timer" id="timer">30s</span>)</a>
      </div>
    </div>

    <a href="#" class="back-link">← Voltar ao login</a>
  </div>
  <script src="js/verificar_email.js"></script>

</body>

</html>