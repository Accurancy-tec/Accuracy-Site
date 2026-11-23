<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suporte - Accuracy</title>

    <script src="js/usuario-global.js"></script>

    <link rel="stylesheet" href="css/admin.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="app">

        <!-- ================= MENU LATERAL ================= -->
        <aside class="lateral">
            <div>
                <div class="logo">Accuracy</div>

                <nav class="menu">
                    <a href="dashboard.php">Início</a>
                    <a href="carteira.php">Carteira</a>
                    <a href="aportes.php">Aportes</a>
                    <a href="historico.php">Histórico</a>
                    <a href="Cursos.php">Cursos</a>
                    <a href="perfil.php">Perfil</a>
                    <a href="suporte.php" class="ativo">Suporte</a>
                </nav>
            </div>
        </aside>

        <!-- ================= COLUNA PRINCIPAL ================= -->
        <div class="coluna">

            <header class="topo">
                <span></span>
                <div class="topo-direita">
                    <span class="txt-topo" id="nomeTopo"></span>
                    <span class="avatar" id="inicialTopo">U</span>
                </div>
            </header>

            <main class="conteudo">
                <p id="aviso" class="aviso" hidden></p>

                <div class="titulo">
                    <div>
                        <h1>Suporte</h1>
                        <p>Tire suas dúvidas com a equipe Accuracy.</p>
                    </div>
                </div>

                <form id="formPergunta" class="card formulario">
                    <h3>Nova pergunta</h3>
                    <input class="campo" name="assunto" placeholder="Assunto" required maxlength="150">
                    <textarea class="campo" name="mensagem_pergunta" placeholder="Escreva sua pergunta" rows="5" required maxlength="2000"></textarea>
                    <div class="botoes">
                        <button class="btn" type="submit">Enviar pergunta</button>
                    </div>
                </form>

                <div class="titulo"><div><h1 style="font-size:19px">Minhas perguntas</h1></div></div>
                <div id="listaPerguntas"></div>
            </main>
        </div>
    </div>

    <script src="js/suporte.js"></script>
</body>

</html>