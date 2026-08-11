<?php
session_start();
include('configs/conexao.php');
?>






<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InvestFlow</title>

    <link rel="stylesheet" href="css\login.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>

<body>

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


            <form   id="formLogin">
                <div class="login">

                    <h2>Bem-vindo de volta</h2>

                    <p>Acesse sua conta para ver sua carteira</p>

                    <label>E-mail</label>
                    <input type="email" placeholder="seu@email.com" name="emailLogin" id="email">

                    <label>Senha</label>
                    <input type="password" placeholder="••••••••" name="senhaLogin" id="senha">

                    <a href="#">Esqueci minha senha</a>

                    <button class="login-btn" name="btnLogin" type="submit">
                        Entrar na conta
                    </button>


                    <div class="divider">
                        <span>ou continue com</span>
                    </div>

                    <div class="social">

                        <button>Google</button>
                        <button>GitHub</button>
                        <button>LinkedIn</button>

                    </div>

                    <div class="register">
                        Não tem conta?
                        <a href="cadastro.php">Cadastre-se grátis</a>
                    </div>

                </div>
            </form>

        </main>

    </div>

<script src="js/login.js"></script>
</body>

</html>
