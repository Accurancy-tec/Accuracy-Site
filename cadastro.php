<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Cadastro - InvestFlow</title>

    <link rel="stylesheet" href="css/cadastro.css">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

</head>

<body>

<div class="container">

    <aside class="sidebar">

        <div class="logo">

            <div class="logo-icon"></div>

            <span>Accuracy</span>

        </div>

        <div class="timeline">

            <div class="item active">
                <div class="circle">1</div>
                <div>
                    <h3>Crie sua conta</h3>
                    <p>Preencha seus dados básicos para começar</p>
                </div>
            </div>

            <div class="line"></div>

            <div class="item">
                <div class="circle">2</div>
                <div>
                    <h3>Confirme seu e-mail</h3>
                    <p>Vamos verificar seu endereço de e-mail</p>
                </div>
            </div>

            <div class="line"></div>

            <div class="item">
                <div class="circle">3</div>
                <div>
                    <h3>Monte sua carteira</h3>
                    <p>Adicione seus ativos e comece a acompanhar</p>
                </div>
            </div>

        </div>

        <div class="benefits">

            <h4>O que você vai ter</h4>

            <ul>
                <li style="--d:1.5s;">
                    <span class="check-icon">
                        <svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>
                    </span>
                    Carteira ilimitada
                </li>

                <li style="--d:2.1s;">
                    <span class="check-icon">
                        <svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>
                    </span>
                    Alertas de preço
                </li>

                <li style="--d:2.7s;">
                    <span class="check-icon">
                        <svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>
                    </span>
                    Cotações em tempo real
                </li>
            </ul>

        </div>

    </aside>

    <main class="content">

        <div class="floaters" aria-hidden="true">

            <span class="floater up" style="--x:52%; --y:12%; --dur:9s; --delay:0s; --in:.4s;">
                <i>BTC</i> <b>+2,1%</b>
            </span>

            <span class="floater down" style="--x:74%; --y:20%; --dur:11s; --delay:-3s; --in:.6s;">
                <i>USD</i> <b>-0,4%</b>
            </span>

            <span class="floater up" style="--x:60%; --y:38%; --dur:10s; --delay:-5s; --in:.8s;">
                <i>PETR4</i> <b>+1,3%</b>
            </span>

            <span class="floater up" style="--x:82%; --y:46%; --dur:12s; --delay:-2s; --in:1s;">
                <i>IBOV</i> <b>+0,8%</b>
            </span>

            <span class="floater down" style="--x:50%; --y:62%; --dur:9.5s; --delay:-6s; --in:1.2s;">
                <i>ETH</i> <b>-1,2%</b>
            </span>

            <span class="floater up" style="--x:72%; --y:72%; --dur:11s; --delay:-1s; --in:1.4s;">
                <i>VALE3</i> <b>+0,6%</b>
            </span>

            <span class="floater up" style="--x:88%; --y:82%; --dur:10s; --delay:-4s; --in:1.6s;">
                <i>EUR</i> <b>+0,2%</b>
            </span>

            <!-- itens distantes (menores e desfocados) -->
            <span class="floater far" style="--x:66%; --y:6%; --dur:13s; --delay:-7s; --in:.5s;"><i>SOL</i></span>
            <span class="floater far" style="--x:90%; --y:30%; --dur:14s; --delay:-2s; --in:.7s;"><i>ITUB4</i></span>
            <span class="floater far" style="--x:56%; --y:52%; --dur:12s; --delay:-9s; --in:.9s;"><i>S&amp;P</i></span>
            <span class="floater far" style="--x:80%; --y:62%; --dur:15s; --delay:-5s; --in:1.1s;"><i>BBAS3</i></span>
            <span class="floater far" style="--x:62%; --y:88%; --dur:13s; --delay:-3s; --in:1.3s;"><i>XRP</i></span>

        </div>

        <form class="register" method="POST" action="cadastro.php" id="formCadastro">

            <h1>Criar conta gratuita</h1>

            <span class="subtitle">
                Leva menos de 2 minutos para começar
            </span>

            <?php if (!empty($erroCadastro)): ?>
                <p class="erro-cadastro"><?= htmlspecialchars($erroCadastro) ?></p>
            <?php endif; ?>

            <div class="field">
                <label for="nome">Nome Completo</label>
                <input type="text" name="nome_usuario" placeholder="João da Silva" id="nome">
            </div>

            <div class="field">
                <label for="email">E-mail</label>
                <input type="email" name="email_usuario" placeholder="seu@email.com" id="email">
            </div>

            <div class="row">

                <div class="field">
                    <label for="senha">Senha</label>
                    <input
                        type="password"
                        placeholder="Mín. 8 caracteres"
                        name="senha_usuario"
                        id="senha">
                </div>

                <div class="field">
                    <label for="telefone">Telefone</label>
                    <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        name="telefone_usuario"
                        id="telefone"
                        inputmode="numeric"
                        maxlength="15">
                </div>

            </div>

            <div class="field">
                <label for="cpf">CPF</label>
                <input
                    type="text"
                    placeholder="000.000.000-00"
                    name="cpf_usuario"
                    id="cpf"
                    inputmode="numeric"
                    maxlength="14">
            </div>

            <label class="check">

                <input type="checkbox">

                <span>
                    Concordo com os
                    <a href="#">Termos de Uso</a>
                    e
                    <a href="#">Política de Privacidade</a>
                </span>

            </label>

            <button type="submit" name="btnCadastro">
                Criar minha conta
            </button>

            <p class="login">
                Já tem conta?
                <a href="login.php">Entrar</a>
            </p>

        </form>

    </main>

</div>

<script src="js/usuario.js?v=3"></script>
<script src="js/mascara.js?v=3"></script>
</body>
</html>
