<?php
session_start();
include('configs/conexao.php');



class usuario
{
    public $email_usuario;
    public $senha_usuario;

    public function logar()
    {
        global $conexao;

        try {

            // Procura o usuário apenas pelo e-mail
            $sql = "SELECT id_usuario,
                           nome_usuario,
                           email_usuario,
                           senha_usuario
                    FROM usuarios_info
                    WHERE email_usuario = ?";

            // Prepara a consulta
            $stmt = $conexao->prepare($sql);

            // Substitui o ? pelo e-mail
            $stmt->bindParam(1, $this->email_usuario);

            // Executa
            $stmt->execute();

            // Obtém o usuário
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verifica se encontrou
            if ($dados) {
               

                // Compara a senha
                if ($this->senha_usuario == $dados["senha_usuario"]) {

                    // Guarda as informações na sessão
                    $_SESSION["id"] = $dados["id_usuario"];
                    $_SESSION["nome"] = $dados["nome_usuario"];
                    $_SESSION["email"] = $dados["email_usuario"];

                    // Retorna sucesso
                    echo json_encode([
                        "success" => true
                    ]);
                    exit;

                } else {

                    // Senha incorreta
                    echo json_encode([
                        "success" => false,
                        "message" => "Senha incorreta."
                    ]);
                    exit;

                }

            } else {

                // Usuário não encontrado
                echo json_encode([
                    "success" => false,
                    "message" => "Usuário não encontrado."
                ]);
                exit;

            }

        } catch (PDOException $erro) {

            // Erro no banco
            echo json_encode([
                "success" => false,
                "message" => $erro->getMessage()
            ]);
            exit;

        }
    }
}

// Verifica se a requisição foi enviada via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $usuario = new usuario();

    $usuario->email_usuario = $_POST["emailLogin"];
    $usuario->senha_usuario = $_POST["senhaLogin"];

    $usuario->logar();
}

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
