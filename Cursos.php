<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <link rel="preconnect" href="https://accuracyappapi.onrender.com" crossorigin>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Cursos - Accuracy</title>

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/dashboard.css">

    <link rel="stylesheet" href="css/cursos-v2.css?v=4">

    <!-- Novo layout (sidebar, topo, cartões e tabelas) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">

    <script src="js/usuario-global.js"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
        rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <script src="js/Tema.js"></script>
    <script src="js/avatar-global.js"></script>
</head>

<body class="v2" data-v2-search="local">

<div class="v2-app">

    <!-- =========================
         SIDEBAR
    ========================== -->

    <aside class="v2-sidebar">

        <a href="dashboard.php" class="v2-logo">Accuracy</a>

        <nav class="v2-nav">
                <a href="dashboard.php">Início</a>
                <a href="carteira.php">Carteira</a>
                <a href="aportes.php">Aportes</a>
                <a href="historico.php">Histórico</a>
                <a href="Cursos.php" class="active">Cursos</a>
                <a href="perfil.php">Perfil</a>
        </nav>

        <div class="v2-balance">
            <span>Saldo disponível</span>
            <strong id="v2Saldo">—</strong>
            <button type="button" id="v2AddSaldo">Adicionar saldo</button>
        </div>

    </aside>


    <div class="v2-main">

        <!-- =========================
             TOPO
        ========================== -->

        <header class="v2-topbar">

            <div class="v2-search">
                <input type="text"
                       id="v2Search"
                       placeholder="Buscar empresa ou código do ativo"
                       autocomplete="off"
                       aria-label="Buscar empresa ou código do ativo">
            </div>

            <div class="v2-topbar-right">
                <div class="v2-total"><span>Saldo disponivel</span> <strong id="v2Total">—</strong></div>

                <a href="perfil.php" aria-label="Perfil">
                    <div class="avatar">U</div>
                </a>
            </div>

        </header>


        <main class="v2-content">

            <div class="v2-page-head">
                <div>
                    <h1>Cursos</h1>
                    <p>Aprenda a investir no seu ritmo.</p>
                </div>
            </div>


            <!-- DESTAQUE -->

            <section class="v2-hero">

                <div class="v2-thumb cat-iniciante" id="heroThumb">
                    <i class="bi bi-mortarboard-fill thumb-icon" id="heroIcon"></i>
                    <button class="play-button" id="heroPlay" type="button" aria-label="Abrir trilha">
                        <i class="bi bi-play-fill"></i>
                    </button>
                </div>

                <div class="v2-hero-info">
                    <span class="v2-tag" id="heroTag">Comece por aqui</span>
                    <h2 id="heroTitle">Carregando trilhas...</h2>
                    <div class="v2-course-meta" id="heroMeta">&nbsp;</div>
                    <div class="v2-progress" id="heroBar"><i style="width: 0%"></i></div>
                    <button class="v2-btn watch-btn" id="heroBtn" type="button">Carregando...</button>
                </div>

            </section>


            <!-- CURSOS -->

            <div class="v2-courses-head">
                <h2>Todos os cursos</h2>

                <div class="v2-pills">
                    <button type="button" class="filter active" data-category="all">Todos</button>
                    <button type="button" class="filter" data-category="iniciante">Iniciante</button>
                    <button type="button" class="filter" data-category="renda-fixa">Renda fixa</button>
                    <button type="button" class="filter" data-category="fiis">FIIs</button>
                    <button type="button" class="filter" data-category="acoes">Ações</button>
                    <button type="button" class="filter" data-category="cripto">Cripto</button>
                </div>
            </div>

            <div class="courses-grid" id="trilhasGrid">
                <div class="v2-empty-courses" id="coursesEmpty" hidden>Nenhum curso encontrado.</div>

            </div>


            <section class="invest-types">

                        <div class="section-header">

                            <div>
                                <h2>Tipos de investimento</h2>
                                <p>Clique em um card para entender o básico.</p>
                            </div>

                        </div>

                        <div class="invest-grid">

                            <button class="invest-card" type="button" data-info="iniciante">
                                <div class="invest-icon inicio">
                                    <i class="bi bi-mortarboard-fill"></i>
                                </div>
                                <div>
                                    <strong>Primeiros passos</strong>
                                    <small>Por onde começar</small>
                                </div>
                                <i class="bi bi-chevron-right invest-arrow"></i>
                            </button>

                            <button class="invest-card" type="button" data-info="renda-fixa">
                                <div class="invest-icon fixa">
                                    <i class="bi bi-bank"></i>
                                </div>
                                <div>
                                    <strong>Renda Fixa</strong>
                                    <small>Juros combinados</small>
                                </div>
                                <i class="bi bi-chevron-right invest-arrow"></i>
                            </button>

                            <button class="invest-card" type="button" data-info="fiis">
                                <div class="invest-icon fiis">
                                    <i class="bi bi-buildings-fill"></i>
                                </div>
                                <div>
                                    <strong>Fundos Imobiliários</strong>
                                    <small>Renda com imóveis</small>
                                </div>
                                <i class="bi bi-chevron-right invest-arrow"></i>
                            </button>

                            <button class="invest-card" type="button" data-info="acoes">
                                <div class="invest-icon acoes">
                                    <i class="bi bi-bar-chart-fill"></i>
                                </div>
                                <div>
                                    <strong>Ações</strong>
                                    <small>Sócio de empresas</small>
                                </div>
                                <i class="bi bi-chevron-right invest-arrow"></i>
                            </button>

                            <button class="invest-card" type="button" data-info="cripto">
                                <div class="invest-icon cripto">
                                    <i class="bi bi-currency-bitcoin"></i>
                                </div>
                                <div>
                                    <strong>Criptomoedas</strong>
                                    <small>Moedas digitais</small>
                                </div>
                                <i class="bi bi-chevron-right invest-arrow"></i>
                            </button>

                        </div>

                    </section>


                    <!-- CARDZINHO QUE ABRE AO CLICAR -->

                    <div class="info-overlay" id="infoOverlay" aria-hidden="true">

                        <div class="info-card" role="dialog" aria-modal="true" aria-labelledby="infoTitle">

                            <button class="info-close" id="infoClose" type="button" aria-label="Fechar">
                                <i class="bi bi-x-lg"></i>
                            </button>

                            <div class="invest-icon" id="infoIcon">
                                <i class="bi" id="infoIconI"></i>
                            </div>

                            <h3 id="infoTitle"></h3>

                            <p id="infoText"></p>

                            <ul class="info-list" id="infoList"></ul>

                            <div class="info-risk">
                                <span>Nível de risco: <strong id="infoRiskLabel"></strong></span>
                                <div class="info-risk-bars" id="infoRiskBars">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>

                            <p class="info-note">
                                Conteúdo educativo. Não é recomendação de investimento.
                            </p>

                        </div>

                    </div>

                    <script>
                    (function () {

                        var dados = {

                            iniciante: {
                                titulo: "Primeiros passos",
                                icone: "bi-mortarboard-fill",
                                classe: "inicio",
                                texto: "Antes de escolher onde investir, vale organizar as contas e entender seus objetivos e o prazo de cada um.",
                                itens: [
                                    "Monte uma reserva de emergência antes de arriscar.",
                                    "Comece com valores pequenos e aprenda aos poucos.",
                                    "Diversificar ajuda a não depender de um único investimento."
                                ],
                                risco: 0,
                                riscoTexto: "Depende do que escolher"
                            },

                            "renda-fixa": {
                                titulo: "Renda Fixa",
                                icone: "bi-bank",
                                classe: "fixa",
                                texto: "Você empresta dinheiro a um banco ou ao governo e recebe juros em troca, por um prazo combinado. Tesouro Direto, CDB, LCI e LCA são exemplos.",
                                itens: [
                                    "Pode ser pré-fixada (taxa combinada) ou pós-fixada (acompanha um índice).",
                                    "Cada título tem prazo e regras de resgate próprios.",
                                    "Costuma oscilar menos que ações e criptomoedas."
                                ],
                                risco: 1,
                                riscoTexto: "Baixo"
                            },

                            cripto: {
                                titulo: "Criptomoedas",
                                icone: "bi-currency-bitcoin",
                                classe: "cripto",
                                texto: "São moedas digitais que existem só na internet, sem controle de um banco central. O Bitcoin é a mais conhecida.",
                                itens: [
                                    "Negociadas 24 horas por dia, todos os dias.",
                                    "Os preços variam muito em pouco tempo.",
                                    "Invista só o que você aceita arriscar."
                                ],
                                risco: 3,
                                riscoTexto: "Alto"
                            },

                            fiis: {
                                titulo: "Fundos Imobiliários",
                                icone: "bi-buildings-fill",
                                classe: "fiis",
                                texto: "Vários investidores juntam dinheiro em um fundo que investe em imóveis, como shoppings e galpões, ou em títulos do setor.",
                                itens: [
                                    "Você compra cotas, a partir de valores baixos.",
                                    "Costumam pagar rendimentos todo mês.",
                                    "O valor da cota pode subir ou cair."
                                ],
                                risco: 2,
                                riscoTexto: "Médio"
                            },

                            acoes: {
                                titulo: "Ações",
                                icone: "bi-bar-chart-fill",
                                classe: "acoes",
                                texto: "Uma ação é uma pequena parte de uma empresa. Ao comprar, você passa a ser sócio dela.",
                                itens: [
                                    "Pode ganhar com a valorização da ação.",
                                    "Algumas empresas distribuem lucros (dividendos).",
                                    "Costuma funcionar melhor no longo prazo."
                                ],
                                risco: 2,
                                riscoTexto: "Médio a alto"
                            }

                        };

                        var overlay = document.getElementById("infoOverlay");
                        var fechar = document.getElementById("infoClose");

                        function abrir(chave) {

                            var d = dados[chave];
                            if (!d) { return; }

                            document.getElementById("infoTitle").textContent = d.titulo;
                            document.getElementById("infoText").textContent = d.texto;
                            document.getElementById("infoRiskLabel").textContent = d.riscoTexto;

                            document.getElementById("infoIcon").className = "invest-icon " + d.classe;
                            document.getElementById("infoIconI").className = "bi " + d.icone;

                            var lista = document.getElementById("infoList");
                            lista.innerHTML = "";

                            d.itens.forEach(function (item) {
                                var li = document.createElement("li");
                                li.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
                                var span = document.createElement("span");
                                span.textContent = item;
                                li.appendChild(span);
                                lista.appendChild(li);
                            });

                            var barras = document.querySelectorAll("#infoRiskBars span");
                            barras.forEach(function (b, i) {
                                b.classList.toggle("on", i < d.risco);
                            });

                            overlay.classList.add("show");
                            overlay.setAttribute("aria-hidden", "false");
                        }

                        function fecharCard() {
                            overlay.classList.remove("show");
                            overlay.setAttribute("aria-hidden", "true");
                        }

                        document.querySelectorAll(".invest-card").forEach(function (card) {
                            card.addEventListener("click", function () {
                                abrir(card.getAttribute("data-info"));
                            });
                        });

                        fechar.addEventListener("click", fecharCard);

                        overlay.addEventListener("click", function (e) {
                            if (e.target === overlay) { fecharCard(); }
                        });

                        document.addEventListener("keydown", function (e) {
                            if (e.key === "Escape") { fecharCard(); }
                        });

                    })();
                    </script>

        </main>

    </div>

</div>

<!-- =========================
     MODAL DO VÍDEO
========================= -->

<script src="js/cotacoes.js?v=12"></script>
<script src="js/resumoCarteiras.js?v=3"></script>
<script src="js/accuracy-saldos-rapidos.js?v=1"></script>
<script src="js/shell-v2.js?v=22"></script>
<script src="js/progresso.js?v=20261124progresso1"></script>
<script src="js/cursos.js?v=20261124progresso1"></script>

</body>
</html>
