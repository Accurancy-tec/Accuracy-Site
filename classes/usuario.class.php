<?php

class usuario
{
    public $nome_usuario;
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
    public function alterarDados()
    {
        global $conexao;

        try {

            $sql = "UPDATE usuarios_info
                SET nome_usuario = :nome,
                    email_usuario = :email
                WHERE id_usuario = :id";
            $stmt = $conexao->prepare($sql);

            $stmt->bindParam(":nome", $this->nome_usuario);


            $stmt->bindParam(":email", $this->email_usuario);

            $stmt->bindParam(":id", $_SESSION["id"]);

            $stmt->execute();

            if ($stmt->rowCount() > 0) {

                $_SESSION["nome"] = $this->nome_usuario;
                $_SESSION["email"] = $this->email_usuario;
            } else {

                echo json_encode([
                    "success" => false,
                    "message" => "Nenhum dado foi alterado."
                ]);
            }
        } catch (PDOException $e) {

            echo json_encode([
                "success" => false,
                "message" => "Erro ao alterar dados: " . $e->getMessage()
            ]);
        }
    }

    public function excluirPerfil()
    {
        global $conexao;

        try {

            $sql = "DELETE FROM usuarios_info WHERE id_usuario = :id";
            $stmt = $conexao->prepare($sql);
            $stmt->bindParam(":id", $_SESSION["id"]);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                session_destroy();
                echo json_encode([
                    "success" => true,
                    "message" => "Perfil excluído com sucesso."
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Nenhum perfil foi excluído."
                ]);
            }
        } catch (PDOException $e) {
            echo json_encode([
                "success" => false,
                "message" => "Erro ao excluir perfil: " . $e->getMessage()
            ]);
        }
    }

    public function cadastrar(){
        global $conexao;

        try {
            //Gera um código de 6 digitos
            $codigo = random_int(100000, 999999);

            $expira = date("Y-m-d H:i:s", time()+ 600);

            //cria o SQL
            $sql = "INSERT INTO usuarios_info(nome_usuario, email_usuario, senha_usuario, codigo_verificacao, email_verificado, codigo_expira) VALUES (
            ?, ?, ?, ? false, ?)";

            //prepara o comado
            $stmt = $conexao->prepare($sql);

            //passa os valores

            $stmt->bindParam(1,$this->nome_usuario);
            $stmt->bindParam(2,$this->email_usuario);
            $stmt->bindParam(3,$this->senha_usuario);
            $stmt->bindParam(4,$this->$codigo);
            $stmt->bindParam(5,$this->$expira);

            $stmt->execute();

            //retorna o codigo para o cadastro.php
            return $codigo;

        }

        catch(PDOException $erro){
            echo "Erro ao cadastrar:" . $erro->getMessage();
            return false;

        }

    }

    public function verificarEmail($codigo){
        global $conexao;

        try{
            //Procura o usuario pelo ID e pelo codigo
            // verifica se o codigo esta expirado
            $sql = "SELECT id_usuario FROM usuarios_info WHERE id_usuario = ? AND codigo_verificacao = ?
            AND codigo_expira > NOW() AND email_verificado =  false";

            $stmt = $conexao->prepare($sql);

            $stmt->bindParam(1,$_SESSION["id_verificacao"]);

            $stmt->bindParam(2,$codigo);

            $stmt->execute();

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if($usuario){
                $sql = "UPDATE usuarios_info SET email_verificacao = true, codigo_verificacao = NULL, codigo_epira = NULL WHERE id_usuario = ?";

                $stmt->bindParam(1,$_SESSION["idi_verificacao"]);

                $stmt->execute();
                return true;


            }
            return false;
        }
        catch (PDOException $erro){
            echo "Erro ao verificar email:" . $erro->getMessage();
            return false;
        }

    }
}
