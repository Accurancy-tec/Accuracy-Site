<?php

    session_start();

require_once 'configs/conexao.php';
require_once 'configs/email.php';
include_once 'classes/usuario.class.php';
$erroCadastro = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Cria o objeto usuário
    $usuario = new usuario();

    // Pega os dados enviados pelo formulário
    $usuario->nome_usuario = $_POST["nomeCadastro"];
    $usuario->email_usuario = $_POST["emailCadastro"];
    $usuario->senha_usuario = $_POST["senhaCadastro"];
    $usuario->cpf_usuario = $_POST["cpfCadastro"];
    $usuario->telefone_usuario = $_POST["telefoneCadastro"];

    // Faz o cadastro
    $codigo = $usuario->cadastrar();

    // Verifica se o cadastro deu certo
    if ($codigo !== false) {

        // Procura o ID do usuário recém-cadastrado
        $sql = "SELECT id_usuario
                FROM usuarios_info
                WHERE email_usuario = ?";

        $stmt = $conexao->prepare($sql);

        $stmt->bindParam(1, $usuario->email_usuario);

        $stmt->execute();

        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica se encontrou o usuário
        if ($dados) {

            // Guarda o ID temporariamente na sessão
            $_SESSION["id_verificacao"] = $dados["id_usuario"];

            // Envia o código por e-mail
            $enviado = enviarCodigo(
                $usuario->email_usuario,
                $codigo
            );

            // Verifica se o e-mail foi enviado
            if ($enviado) {

                header("Location: verificar_email.php");
                exit;

            } else {

                $erroCadastro = "Erro ao enviar e-mail.";
            }

        } else {

            $erroCadastro = "Usuário não encontrado.";
        }

    } else {

        $erroCadastro = "Erro ao cadastrar o usuário.";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Cadastro - InvestFlow</title>

    <link rel="stylesheet" href="css\cadastro.css">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

</head>

<body>

<div class="container">

    <aside class="sidebar">

        <div class="logo">

            <div class="logo-icon">
                
            </div>

            <span>Accuracy</span>

        </div>

        <div class="timeline">

            <div class="item active">

                <div class="circle">1</div>

                <div>

                    <h3>Crie sua conta</h3>

                    <p>
                        Preencha seus dados básicos
                        para começar
                    </p>

                </div>

            </div>

            <div class="line"></div>

            <div class="item">

                <div class="circle">2</div>

                <div>

                    <h3>Confirme seu e-mail</h3>

                    <p>
                        Vamos verificar seu endereço
                        de e-mail
                    </p>

                </div>

            </div>

            <div class="line"></div>

            <div class="item">

                <div class="circle">3</div>

                <div>

                    <h3>Monte sua carteira</h3>

                    <p>
                        Adicione seus ativos e comece
                        a acompanhar
                    </p>

                </div>

            </div>

        </div>

    </aside>

    <main class="content">

        <form class="register" method="POST" action="cadastro.php">

            <h1>Criar conta gratuita</h1>

            <span class="subtitle">
                Leva menos de 2 minutos para começar
            </span>

            <?php if (!empty($erroCadastro)): ?>
                <p class="erro-cadastro"><?= htmlspecialchars($erroCadastro) ?></p>
            <?php endif; ?>

            <div class="field">
                <label>Nome Completo</label>
                <input type="text" name="nomeCadastro" placeholder="João da Silva" id="nome">
            </div>

            <div class="field">
                <label>E-mail</label>
                <input type="email" name="emailCadastro" placeholder="seu@email.com" id="email">

            </div>

            <div class="row">

                <div class="field">

                    <label>Senha</label>

                    <input

                        type="password"
                        placeholder="Mín. 8 caracteres"
                        name="senhaCadastro" id="senha">

                </div>

                <div class="field">

                    <label>telefone</label>

                    <input
                        type="number"
                        placeholder="Telefone"
                        name="telefoneCadastro">

                        <label for="cpf">CPF</label>
                        <input type="number" name="cpfCadastro" placeholder="CPF" id="cpf">

                </div>

            </div>

            <label class="check">

                <input type="checkbox">

                <span>

                    Concordo com os

                    <a href="#">Termos de Uso</a>

                    

                    <a href="#">Política de Privacidade</a>

                </span>

            </label>

            <button type="submit" name="btnCadastro">

                Criar minha conta

            </button>

            <p class="login">

                Já tem conta?

                <a href="login.html">Entrar</a>

            </p>

        </form>

    </main>

</div>

</body>
</html>