<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <script src="js/config.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel do administrador - Accuracy</title>

    <!-- Sem token de administrador -> volta para o login -->
    <script>
        if (!localStorage.getItem("admin_token")) {
            window.location.href = "login.php";
        }
    </script>

    <link rel="stylesheet" href="css/admin.css?v=2">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="app">

        <!-- ================= MENU LATERAL ================= -->
        <aside class="lateral">
            <div>
                <div class="logo">Accuracy <small>Admin</small></div>

                <nav class="menu" id="menu">
                    <a data-sec="usuarios" class="ativo">Usuários</a>
                    <a data-sec="cursos">Cursos</a>
                    <a data-sec="quiz">Quiz</a>
                    <a data-sec="perguntas">Perguntas <span id="contadorPerguntas" class="contador" hidden>0</span></a>
                    <a data-sec="admins">Administradores</a>
                </nav>
            </div>

            <div class="cartao-sessao">
                <small>Conectado como</small>
                <strong id="admNome">Administrador</strong>
                <span class="chip" id="admNivel">Editor</span>
                <button id="btnSair" class="btn btn-claro btn-bloco">Sair</button>
            </div>
        </aside>

        <!-- ================= COLUNA PRINCIPAL ================= -->
        <div class="coluna">

            <header class="topo">
                <input id="busca" class="busca" type="search" placeholder="Buscar usuário por nome ou e-mail">
                <div class="topo-direita">
                    <span class="txt-topo">Usuários <b id="topoTotal">0</b></span>
                    <button id="btnSairTopo" class="btn btn-claro btn-pq sair-topo">Sair</button>
                    <span class="avatar" id="admInicial">A</span>
                </div>
            </header>

            <main class="conteudo">
                <p id="aviso" class="aviso" hidden></p>

                <!-- ============ USUÁRIOS ============ -->
                <section id="sec-usuarios" class="secao">
                    <div class="titulo">
                        <div>
                            <h1>Usuários</h1>
                            <p>Contas cadastradas na plataforma.</p>
                        </div>
                    </div>

                    <div class="numeros">
                        <div class="card numero"><span>Total de contas</span><strong id="numTotal">0</strong></div>
                        <div class="card numero"><span>Contas ativas</span><strong class="verde" id="numAtivos">0</strong></div>
                        <div class="card numero"><span>Contas desativadas</span><strong class="vermelho" id="numInativos">0</strong></div>
                    </div>

                    <div class="card">
                        <div class="pilulas" id="filtroUsuarios">
                            <button class="pilula ativa" data-f="todos">Todos</button>
                            <button class="pilula" data-f="ativos">Ativos</button>
                            <button class="pilula" data-f="inativos">Desativados</button>
                        </div>
                        <div class="rolagem">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>E-mail</th>
                                        <th>Desde</th>
                                        <th>Status</th>
                                        <th class="dir"></th>
                                    </tr>
                                </thead>
                                <tbody id="tabelaUsuarios"></tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <!-- ============ CURSOS ============ -->
                <section id="sec-cursos" class="secao" hidden>
                    <div class="titulo">
                        <div>
                            <h1>Cursos</h1>
                            <p>Cadastre e organize os vídeos da plataforma.</p>
                        </div>
                        <div class="acoes-topo">
                            <button class="btn" id="btnNovoCurso">Novo curso</button>
                        </div>
                    </div>

                    <form id="formCurso" class="card formulario" hidden>
                        <h3 id="tituloFormCurso">Novo curso</h3>
                        <input type="hidden" name="id_curso">
                        <input class="campo" name="titulo_curso" placeholder="Título" required maxlength="200">
                        <textarea class="campo" name="descricao_curso" placeholder="Descrição (opcional)" rows="3"></textarea>
                        <div class="duas">
                            <select class="campo" name="categoria_curso" id="categoriaCurso" required></select>
                            <select class="campo" name="nivel_curso" id="nivelCurso" required></select>
                        </div>
                        <input class="campo" name="duracao_minutos_curso" type="number" min="1" max="32767" placeholder="Duração (minutos)" required>
                        <input class="campo" name="url_video_curso" type="url" placeholder="URL do vídeo (https://...)" required>
                        <input class="campo" name="url_thumb_curso" type="url" placeholder="URL da miniatura (opcional)">
                        <div class="botoes">
                            <button class="btn" type="submit" id="salvarCurso">Cadastrar curso</button>
                            <button class="btn btn-claro" type="button" id="cancelarCurso">Cancelar</button>
                        </div>
                    </form>

                    <div id="gradeCursos" class="grade"></div>
                </section>

                <!-- ============ QUIZ ============ -->
                <section id="sec-quiz" class="secao" hidden>
                    <div class="titulo">
                        <div>
                            <h1>Quiz das trilhas</h1>
                            <p>Perguntas que aparecem para os alunos no fim de cada trilha.</p>
                        </div>
                        <div class="acoes-topo">
                            <select class="campo" id="quizTrail" aria-label="Trilha do quiz"></select>
                            <button class="btn" id="btnNewQuizQuestion">Nova pergunta</button>
                        </div>
                    </div>

                    <form id="formQuizQuestion" class="card formulario" hidden>
                        <h3>Nova pergunta</h3>
                        <textarea class="campo" name="question" placeholder="Pergunta" rows="2" minlength="5" maxlength="500" required></textarea>
                        <p class="dica">Escreva de 2 a 5 alternativas e marque a correta.</p>
                        <div class="quiz-options">
                            <label class="quiz-option-row">
                                <input type="radio" name="correct_option" value="0" checked aria-label="Alternativa A é a correta">
                                <input class="campo" name="option" placeholder="Alternativa A" maxlength="200">
                            </label>
                            <label class="quiz-option-row">
                                <input type="radio" name="correct_option" value="1" aria-label="Alternativa B é a correta">
                                <input class="campo" name="option" placeholder="Alternativa B" maxlength="200">
                            </label>
                            <label class="quiz-option-row">
                                <input type="radio" name="correct_option" value="2" aria-label="Alternativa C é a correta">
                                <input class="campo" name="option" placeholder="Alternativa C (opcional)" maxlength="200">
                            </label>
                            <label class="quiz-option-row">
                                <input type="radio" name="correct_option" value="3" aria-label="Alternativa D é a correta">
                                <input class="campo" name="option" placeholder="Alternativa D (opcional)" maxlength="200">
                            </label>
                            <label class="quiz-option-row">
                                <input type="radio" name="correct_option" value="4" aria-label="Alternativa E é a correta">
                                <input class="campo" name="option" placeholder="Alternativa E (opcional)" maxlength="200">
                            </label>
                        </div>
                        <textarea class="campo" name="explanation" placeholder="Explicação mostrada depois da resposta (opcional)" rows="2" maxlength="500"></textarea>
                        <div class="botoes">
                            <button class="btn" type="submit">Adicionar pergunta</button>
                            <button class="btn btn-claro" type="button" id="cancelQuizQuestion">Cancelar</button>
                        </div>
                    </form>

                    <div id="quizQuestions" class="quiz-list"></div>
                </section>

                <!-- ============ PERGUNTAS ============ -->
                <section id="sec-perguntas" class="secao" hidden>
                    <div class="titulo">
                        <div>
                            <h1>Perguntas</h1>
                            <p>Dúvidas enviadas pelos usuários.</p>
                        </div>
                    </div>

                    <div class="pilulas" id="filtroPerguntas">
                        <button class="pilula ativa" data-f="pendentes">Pendentes</button>
                        <button class="pilula" data-f="respondidas">Respondidas</button>
                        <button class="pilula" data-f="todas">Todas</button>
                    </div>

                    <div id="listaPerguntas"></div>
                </section>

                <!-- ============ ADMINISTRADORES ============ -->
                <section id="sec-admins" class="secao" hidden>
                    <div class="titulo">
                        <div>
                            <h1>Administradores</h1>
                            <p>Quem tem acesso a este painel.</p>
                        </div>
                        <div class="acoes-topo">
                            <button class="btn" id="btnNovoAdmin">Novo administrador</button>
                        </div>
                    </div>

                    <form id="formAdmin" class="card formulario" hidden>
                        <h3>Novo administrador</h3>
                        <div class="duas">
                            <input class="campo" name="nome_administrador" placeholder="Nome" required>
                            <input class="campo" name="email_administrador" type="email" placeholder="E-mail" required>
                        </div>
                        <div class="duas">
                            <input class="campo" name="senha_administrador" type="password" placeholder="Senha (mín. 8 caracteres)" minlength="8" required>
                            <select class="campo" name="nivel">
                                <option value="Editor">Editor</option>
                                <option value="Master">Master</option>
                            </select>
                        </div>
                        <div class="botoes">
                            <button class="btn" type="submit">Criar administrador</button>
                            <button class="btn btn-claro" type="button" id="cancelarAdmin">Cancelar</button>
                        </div>
                    </form>

                    <p id="dicaMaster" class="dica" hidden>Só administradores Master podem criar outros administradores.</p>

                    <div class="card">
                        <div class="rolagem">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>E-mail</th>
                                        <th>Nível</th>
                                        <th>Desde</th>
                                    </tr>
                                </thead>
                                <tbody id="tabelaAdmins"></tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <!-- Janela de edição de usuário -->
    <dialog id="modalUsuario">
        <form id="formUsuario" method="dialog" class="card formulario">
            <h3>Editar usuário</h3>
            <input type="hidden" name="id_usuario">
            <input class="campo" name="nome_usuario" placeholder="Nome" required>
            <input class="campo" name="email_usuario" type="email" placeholder="E-mail" required>
            <input class="campo" name="telefone_usuario" placeholder="Telefone">
            <div class="botoes">
                <button class="btn" type="submit">Salvar alterações</button>
                <button class="btn btn-claro" type="button" id="cancelarEdicao">Cancelar</button>
            </div>
        </form>
    </dialog>

    <script src="js/admin-quiz.js?v=1"></script>
    <script src="js/admin.js?v=3"></script>
</body>

</html>