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

    </aside>

    <main class="content">

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

<script src="js/usuario.js"></script>
<script src="js/mascara.js"></script>
</body>
</html>