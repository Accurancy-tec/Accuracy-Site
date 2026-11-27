<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <script src="js/config.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar senha — Accuracy</title>
  <link rel="stylesheet" href="css/confirmacodigo.css">
  <link rel="stylesheet" href="css/forgot-password.css?v=1">
  <link rel="stylesheet" href="css/password-toggle.css?v=1">
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
          <circle cx="7.5" cy="15.5" r="4.5"></circle>
          <path d="M10.7 12.3 20 3"></path>
          <path d="m16 7 3 3"></path>
          <path d="m18 5 2 2"></path>
        </svg>
      </div>

      <!-- 1) e-mail da conta -->
      <form id="emailForm" novalidate>
        <h1>Recuperar senha</h1>
        <p class="subtitle">
          Informe o e-mail da sua conta. Vamos enviar um código de 6 números
          para você criar uma senha nova.
        </p>

        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" type="email" autocomplete="email" maxlength="254" placeholder="seu@email.com" required>
        </div>

        <div class="status-row" id="emailStatus" role="status" aria-live="polite"></div>

        <button class="btn" type="submit" id="sendCodeButton">Enviar código</button>
      </form>

      <!-- 2) código + senha nova -->
      <form id="passwordForm" novalidate hidden>
        <h1>Crie uma senha nova</h1>
        <p class="subtitle">
          Se houver uma conta com <strong id="sentToEmail"></strong>, o código chegou
          nesse e-mail (confira também o spam). Ele vale por 10 minutos.
        </p>

        <div class="field">
          <label for="code">Código</label>
          <input id="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" placeholder="000000">
        </div>

        <div class="field">
          <label for="newPassword">Nova senha</label>
          <input id="newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="72" placeholder="Mínimo de 8 caracteres" data-password-toggle>
        </div>

        <div class="field">
          <label for="confirmPassword">Confirme a nova senha</label>
          <input id="confirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="72" placeholder="Repita a nova senha" data-password-toggle>
        </div>

        <div class="status-row" id="passwordStatus" role="status" aria-live="polite"></div>

        <button class="btn" type="submit" id="resetButton">Redefinir senha</button>

        <div class="resend">
          Não chegou? <a href="#" id="resendCode">Reenviar código</a>
          · <a href="#" id="otherEmail">Usar outro e-mail</a>
        </div>
      </form>
    </div>

    <a href="login.php" class="back-link">← Voltar ao login</a>
  </div>

  <script src="js/password-toggle.js?v=1"></script>
  <script src="js/forgot-password.js?v=1"></script>

</body>

</html>
