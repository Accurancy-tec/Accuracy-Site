<?php
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


            <form action="login.php" method="POST" class="usuario">
                <div class="login">

                    <h2>Bem-vindo de volta</h2>

                    <p>Acesse sua conta para ver sua carteira</p>

                    <label>E-mail</label>
                    <input type="email" placeholder="seu@email.com" name="email">

                    <label>Senha</label>
                    <input type="password" placeholder="••••••••" name="senha">

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
                        <a href="cadastro.html">Cadastre-se grátis</a>
                    </div>

                </div>
            </form>

        </main>

    </div>

</body>

</html>
<?php
session_start();




class usuario
{


    public $email_usuario;
    public $senha_usuario;



    public function logar()
    {
        global $conexao;





        try {
            $sql = "SELECT email_usuario, senha_usuarios FROM usuarios_info WHERE email_usuario = ? AND senha_usuario = ?";

            $stmt = $conexao->prepare($sql);
            $stmt->bindParam(1, $this->email_usuario);
            $stmt->bindParam(2, $this->senha_usuario);
            if ($stmt->execute()) {


                $dados = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($dados) {

                    $_SESSION["senha"] = $dados["senha_usuario"];
                    $_SESSION["email"] = $dados["email_usuario"];


                    header('dashboard.php');
                    echo "ajsoidjasioj";

                    
                } else {
                    echo "Email ou senha invalidos";
                }
            }
        } catch (PDOException $erro) {
        }
    }
}
if (isset($_POST['email'])  && isset($_POST['senha'])) {

    $usuario = new usuario();
    $usuario->email_usuario = $_POST['email'];
    $usuario->senha_usuario = $_POST['senha'];
    $usuario->logar();

    echo "Login feito";
}
?>