<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <script src="js/config.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Entrar - Accuracy</title>

    <link rel="stylesheet" href="css/login.css?v=7">
    <link rel="stylesheet" href="css/password-toggle.css?v=1">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>

<body>

    <!-- botão para voltar ao início (fixo no topo da página) -->
    <a href="index.php" class="back-btn" aria-label="Voltar para o início">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
        </svg>
        Voltar
    </a>

    <div class="container">

        <aside class="left">

            <div class="logo">
                <div class="logo-box"></div>
                <h2>Accuracy</h2>
            </div>

            <div class="hero">
                <h1>
                    Invista com
                    <br>
                    inteligência
                    <br>
                    real
                </h1>

                <p>
                    Acompanhe sua carteira,
                    descubra oportunidades e
                    tome decisões baseadas
                    em dados — tudo em um só lugar.
                </p>
            </div>

            <div class="cards">

                <div class="info-card">
                    <span>Carteiras reais e simuladas</span>
                    <h3>Pratique sem arriscar</h3>
                </div>

                <div class="info-card">
                    <span>Ações, FIIs, renda fixa e cripto</span>
                    <h3>Cotações do mercado</h3>
                </div>

                <div class="info-card">
                    <span>Trilhas em vídeo</span>
                    <h3>Aprenda no seu ritmo</h3>
                </div>

            </div>

        </aside>

        <main class="right">


            <form id="formLogin">
                <div class="login">

                    <h2>Bem-vindo de volta</h2>

                    <p>Acesse sua conta para ver sua carteira</p>

                    <p class="aviso-login" id="avisoLogin" role="status" hidden></p>

                    <label>E-mail</label>
                    <input type="email" placeholder="seu@email.com" name="email_usuario" id="email_usuario" autocomplete="email">
                    <small id="erroEmail" class="mensagem-erro"></small>

                    <label>Senha</label>
                    <input type="password" placeholder="••••••••" name="senha_usuario" id="senha_usuario" autocomplete="current-password" data-password-toggle>
                    <small id="erroSenha" class="mensagem-erro"></small>

                    <a href="forgot-password.php" id="linkEsqueciSenha">Esqueci minha senha</a>

                    <button class="login-btn" name="btnLogin" type="submit">
                        Entrar na conta
                    </button>


                    <div class="divider">
                        <span>ou continue com</span>
                    </div>

                    <div class="social social-google-only">
                        <div class="google-wrap" id="googleWrap">
                            <div id="googleBtn" aria-label="Entrar com Google"></div>
                        </div>
                    </div>

                    <small id="erroGoogle" class="mensagem-erro"></small>

                    <div class="register">
                        Não tem conta?
                        <a href="cadastro.php">Cadastre-se grátis</a>
                    </div>

                </div>
            </form>

        </main>

    </div>

    <script src="js/password-toggle.js?v=1"></script>
    <script src="js/usuario.js?v=5"></script>
    <script src="js/google-login.js?v=6"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</body>

</html>
