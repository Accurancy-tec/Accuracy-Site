<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InvestFlow</title>

    <link rel="stylesheet" href="css/login.css?v=5">

    <style>
        /* botão voltar ao início: fixo no topo da página */
        .back-btn{
            position:fixed;
            top:24px;
            left:28px;
            z-index:10;
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding:9px 16px;
            border:1px solid rgba(255,255,255,.1);
            border-radius:10px;
            background:rgba(255,255,255,.04);
            color:#9bb0d1;
            font-family:'Inter',sans-serif;
            font-size:13px;
            font-weight:500;
            text-decoration:none;
            transition:color .2s ease, background .2s ease, border-color .2s ease, transform .18s ease;
            animation:fadeUp .7s cubic-bezier(.2,.8,.2,1) .4s backwards;
        }
        .back-btn svg{ transition:transform .2s ease; }
        .back-btn:hover{ color:#fff; background:rgba(37,99,235,.18); border-color:#2563eb; }
        .back-btn:hover svg{ transform:translateX(-3px); }
        .back-btn:active{ transform:scale(.96); }
        .back-btn:focus-visible{ outline:2px solid #3b82f6; outline-offset:3px; }
        @media(max-width:900px){ .back-btn{ top:16px; left:16px; } }
    </style>

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
                    <span>Rendimento médio mensal</span>
                    <h3>+2.4% ao mês</h3>
                </div>

                <div class="info-card">
                    <span>Ativos monitorados</span>
                    <h3>BTC · USD · PETR4 · IBOV +38</h3>
                </div>

                <div class="info-card">
                    <span>Usuários ativos</span>
                    <h3>+14.000 investidores</h3>
                </div>

            </div>

        </aside>

        <main class="right">


            <form id="formLogin">
                <div class="login">

                    <h2>Bem-vindo de volta</h2>

                    <p>Acesse sua conta para ver sua carteira</p>

                    <label>E-mail</label>
                    <input type="email" placeholder="seu@email.com" name="email_usuario" id="email_usuario">
                    <small id="erroEmail" class="mensagem-erro"></small>

                    <label>Senha</label>
                    <input type="password" placeholder="••••••••" name="senha_usuario" id="senha_usuario">
                    <small id="erroSenha" class="mensagem-erro"></small>

                    <a href="#">Esqueci minha senha</a>

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

    <script src="js/usuario.js?v=3"></script>
    <script src="js/google-login.js?v=5"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</body>

</html>
