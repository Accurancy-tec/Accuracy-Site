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

            <div class="field">
                <label>Nome Completo</label>
                <input type="text" name="nomeCadastro" placeholder="João da Silva">
            </div>

            <div class="field">
                <label>E-mail</label>
                <input type="email" name="emailCadastro" placeholder="seu@email.com">

            </div>

            <div class="row">

                <div class="field">

                    <label>Senha</label>

                    <input

                        type="password"
                        placeholder="Mín. 8 caracteres"
                        name="senhaCadastro">

                </div>

                <div class="field">

                    <label>telefone</label>

                    <input
                        type="number"
                        placeholder="Telefone"
                        name="telefoneCadastro">

                        <label for="">CPF</label>
                        <input type="number" name="cpfCadastro">

                </div>

            </div>

            <label class="check">

                <input type="checkbox">

                <span>

                    Concordo com os

                    <a href="#">Termos de Uso</a>

                    e a

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
<?php
require_once 'configs/conexao.php';

if($_SERVER["REQUEST_METHOD"]== "POST"){
     
    $nome = $_POST["nomeCadastro"];
    $email = $_POST["emailCadastro"];
    $senha = $_POST["senhaCadastro"];
    $cpf = $_POST["cpfCadastro"];
    $telefone = $_POST["telefoneCadastro"];
    
    try{
        // primeiro verificar se o email ja existe

        $verificar = "SELECT * FROM usuarios_info WHERE email_usuario = ? ";

        $stmt = $conexao->prepare($verificar);
        $stmt->bindParam(1,$email);
        $stmt->execute();

        if($stmt->rowCount() > 0){
            
            
        } else{
            // se o email nao existir no banco cadastra o usuario
            $sql = "INSERT INTO usuarios_info
            (email_usuario, senha_usuario, nome_usuario, telefone_usuario, cpf_usuario)
            VALUES(?, ?, ?, ?, ?)";

            $stmt = $conexao->prepare($sql);

            $stmt->bindParam(1,$email);
            $stmt->bindParam(2,$senha);
            $stmt->bindParam(3,$nome);
            $stmt->bindParam(4,$telefone);
            $stmt->bindParam(5,$cpf);
            if($stmt->execute()){
                

                header("Location: login.php");
                exit;
            }
        

        }
    }
      catch(PDOException $erro){

        echo "Erro: ".$erro->getMessage();

    }
}



?>




     
 
         
    

    
        
    
    


  
             


        
    

  


