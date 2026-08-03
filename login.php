
<?php
include('conexao.php');

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

        

        <div class="login">

            <h2>Bem-vindo de volta</h2>

            <p>Acesse sua conta para ver sua carteira</p>

            <label>E-mail</label>
            <input type="email" placeholder="seu@email.com">

            <label>Senha</label>
            <input type="password" placeholder="••••••••">

            <a href="#">Esqueci minha senha</a>

            <a href="dashboard.html"><button class="login-btn">
                Entrar na conta
            </button>
            </a>

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

    </main>

</div>

</body>
</html>
<?php
session_start();



class usuario{
    
    public $nome_usuario;
    public $email_usuario;
    public $senha_usuario;

    
    public function logar(){
        global $conexao;
       
        

        try{
            $sql = "SELECT id_usuario, nome_usuario, email_usuario FROM tb_usuario WHERE email_usuario = ? AND senha_usuario = ?";

 $stmt = $conexao->prepare($sql);
 $stmt->bindParam(1, $this->email_usuario);
 $stmt->bindParam(2,$this->senha_usuario);
 if($stmt->execute()){




 if($stmt->rowCount() > 0){
   $dados = $stmt->fetch(PDO::FETCH_ASSOC);
   $_SESSION["id"] = $dados["id_usuario"];
   $_SESSION["nome"]= $dados["nome_usuario"];
   $_SESSION["email"]=$dados["email_usuario"];

   header("Location: ");
   exit;



 }else{
    echo "Email ou senha invalidos";
 } }
        }

 catch(PDOException $erro){
 }
    }
}
if (isset($_POST['emailCadastro'], $_POST['senhaCadastro'])) {

    $usuario = new usuario();
    $usuario->email_usuario = $_POST['emailCadastro'];
    $usuario->senha_usuario = $_POST['senhaCadastro'];
    $usuario->logar();

}
?>