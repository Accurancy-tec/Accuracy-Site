
<?php
session_start();

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
            $sql = "UPDATE usuarios_info SET nome_usuario = :nome, email_usuario = :email, senha_usuario = :senha WHERE id_usuario = :id";
            $stmt = $conexao->prepare($sql);
            $stmt->bindParam(':nome', $this->nome_usuario);
            $stmt->bindParam(':email', $this->email_usuario);
            $stmt->bindParam(':senha', $this->senha_usuario);
            $stmt->bindParam(':id', $_SESSION["id"]);
            $stmt->execute();

        } catch (PDOException $e) {
            echo "Erro ao alterar dados: " . $e->getMessage();
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
