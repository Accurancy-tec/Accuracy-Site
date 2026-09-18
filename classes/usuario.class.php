<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


class usuario
{
    public $nome_usuario;
    public $email_usuario;
    public $senha_usuario;
    public $cpf_usuario;
    public $telefone_usuario;

    public function logar()
{
    global $conexao;

    try {

        $sql = "SELECT 
                    id_usuario,
                    nome_usuario,
                    email_usuario,
                    senha_usuario,
                    email_verificado
                FROM usuarios_info
                WHERE email_usuario = ?";

        $stmt = $conexao->prepare($sql);
        $stmt->bindParam(1, $this->email_usuario);
        $stmt->execute();

        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {

            echo json_encode([
                "success" => false,
                "message" => "Usuário não encontrado."
            ]);

            exit;
        }

        if (!$dados["email_verificado"]) {

            echo json_encode([
                "success" => false,
                "message" => "Você precisa verificar seu e-mail antes de entrar."
            ]);

            exit;
        }

        if ($this->senha_usuario != $dados["senha_usuario"]) {

            echo json_encode([
                "success" => false,
                "message" => "Senha incorreta."
            ]);

            exit;
        }

        $_SESSION["id"] = $dados["id_usuario"];
        $_SESSION["nome"] = $dados["nome_usuario"];
        $_SESSION["email"] = $dados["email_usuario"];

        echo json_encode([
            "success" => true
        ]);

        exit;

    } catch (PDOException $erro) {

        echo json_encode([
            "success" => false,
            "message" => "Erro no servidor."
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

    public function cadastrar()
    {
        global $conexao;

        try {
            //Gera um código de 6 digitos
            $codigo = random_int(100000, 999999);

            $expira = date("Y-m-d H:i:s", time() + 600);

            //cria o SQL
            $sql = "INSERT INTO usuarios_info(nome_usuario, email_usuario, senha_usuario, cpf_usuario, telefone_usuario, codigo_verificacao, email_verificado, codigo_expira) VALUES (
        ?, ?, ?, ?, ?, ?, false, ?)";

            //prepara o comado
            $stmt = $conexao->prepare($sql);

            //passa os valores

            $stmt->bindParam(1, $this->nome_usuario);
            $stmt->bindParam(2, $this->email_usuario);
            $stmt->bindParam(3, $this->senha_usuario);
            $stmt->bindParam(4, $this->cpf_usuario);
            $stmt->bindParam(5, $this->telefone_usuario);
            $stmt->bindParam(6, $codigo);
            $stmt->bindParam(7, $expira);

            $stmt->execute();

            //retorna o codigo para o cadastro.php
            return $codigo;
        } catch (PDOException $erro) {
            echo "Erro ao cadastrar:" . $erro->getMessage();
            return false;
        }
    }

    public function verificarEmail($id, $codigo)
{
    global $conexao;

    $sql = "SELECT *
            FROM usuarios_info
            WHERE id_usuario = :id
            AND codigo_verificacao = :codigo
            AND codigo_expira > NOW()
            AND email_verificado = FALSE";

    $stmt = $conexao->prepare($sql);

    $stmt->bindValue(":id", $id);
    $stmt->bindValue(":codigo", $codigo);

    $stmt->execute();

    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        return false;
    }

    $sql = "UPDATE usuarios_info
            SET email_verificado = TRUE,
                codigo_verificacao = NULL,
                codigo_expira = NULL
            WHERE id_usuario = :id";

    $stmt = $conexao->prepare($sql);

    $stmt->bindValue(":id", $id);

    $stmt->execute();

    return true;
}

}