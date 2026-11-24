<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <link rel="preconnect" href="https://accuracyappapi.onrender.com" crossorigin>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Aportes - Accuracy</title>

    <link rel="stylesheet" href="css/Loading.css">

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/dashboard.css">

    <!-- CSS do formulário, da lista e do detalhe do ativo -->
    <link rel="stylesheet" href="css/aportes.css?v=2">
    <link rel="stylesheet" href="css/Aportesprodutos.css?v=11">
    <link rel="stylesheet" href="css/Aportesdetalhe.css">

    <!-- Animações -->
    <link rel="stylesheet" href="css/Animacoes.css">

    <!-- Janelas de carteira -->
    <link rel="stylesheet" href="css/carteiras.css?v=2">

    <!-- Novo layout (precisa vir por último) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">

    <style>
        /* Pesquisa única do seletor de Aportes */
        .aportes-search-container {
            display: flex;
            align-items: center;
            gap: 10px;
            width: min(100%, 440px);
            min-height: 44px;
            box-sizing: border-box;
            margin: 14px 0 20px;
            padding: 0 14px;
            border: 1px solid #263a5c;
            border-radius: 10px;
            background: #0e1f3d;
            color: #93b4e6;
        }
        .aportes-search-container:focus-within { border-color: #3b82f6; }
        .aportes-search-container input {
            width: 100%;
            min-width: 0;
            border: 0;
            outline: 0;
            background: transparent;
            color: #fff;
            font: inherit;
            font-size: 13px;
        }
        .aportes-search-container input::placeholder { color: #93a9cf; }
        /* Mantém saldo e foto alinhados à direita, sem campo no topo */
        body.v2 .v2-topbar { display: flex; align-items: center; justify-content: flex-end; }
        body.v2 .v2-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 14px; }
        /* Preserva o ajuste anterior: sem resumos abaixo dos produtos */
        body.v2 .v2-mine { display: none !important; }

        .asset-price {
            display: block;
            margin: 6px 0 14px;
            font-size: 13px;
            opacity: .85;
        }

        .asset-price.up,
        .aporte-now.up {
            color: #22c55e;
        }

        .asset-price.down,
        .aporte-now.down {
            color: #ef4444;
        }

        .aporte-now {
            display: block;
            font-size: 12px;
            opacity: .85;
        }
        /* Formulário de compra no padrão do aplicativo */
        body.v2 #formStep.aporte-form {max-width: 680px;}
        .ac-compra-preco {display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px;margin:16px 0;background:#2256da;border-radius:14px;color:white;}
        .ac-compra-preco[hidden],#quantidadeAporteBox[hidden],#valorAporteBox[hidden],.ac-compra-linha[hidden],.ac-compra-aviso[hidden] {display:none!important;}
        .ac-compra-preco span {color:#dce8ff;font-size:13px;}
        .ac-compra-preco strong {font-size:23px;}
        .ac-compra-ajuda {margin:2px 0 12px;color:#94a9ca;font-size:13px;}
        .ac-compra-qtd-row {display:grid;grid-template-columns:minmax(0,1fr) 46px 46px;gap:10px;align-items:stretch;}
        body.v2 #formStep .ac-compra-qtd-row input {min-width:0;font-size:22px;}
        .ac-compra-qtd-row button {border:1px solid #2a4366;border-radius:12px;background:#142640;color:white;font-size:28px;cursor:pointer;}
        .ac-compra-qtd-row button:hover {background:#23406a;}
        .ac-compra-resumo {background:#0c1b30;border:1px solid #283e5b;border-radius:14px;padding:22px;margin:24px 0 12px;}
        .ac-compra-resumo h4 {font-size:17px;color:#fff;margin:0 0 18px;}
        .ac-compra-linha,.ac-compra-total {display:flex;justify-content:space-between;gap:18px;align-items:center;padding:7px 0;color:#94a9ca;font-size:14px;}
        .ac-compra-linha strong,.ac-compra-total strong {text-align:right;color:#fff;font-size:15px;}
        .ac-compra-total {border-top:1px solid #293e5b;margin-top:15px;padding-top:19px;color:#fff;font-weight:700;}
        .ac-compra-total strong {font-size:21px;}
        .ac-compra-saldo {font-size:13px;color:#a9c4ed;margin:13px 0;}
        .ac-compra-aviso {font-size:13px;color:#fb7185;background:#351b2b;border:1px solid #74354a;border-radius:10px;padding:12px;margin:12px 0;}
        body.v2 #formStep #confirmBtn:disabled {opacity:.45;cursor:not-allowed;}
        @media(max-width:520px) {.ac-compra-resumo{padding:16px}.ac-compra-qtd-row{grid-template-columns:minmax(0,1fr) 42px 42px;gap:6px}.ac-compra-preco strong{font-size:19px}}
    </style>

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

<body class="v2">

    <div class="v2-app">

        <!-- =========================
             SIDEBAR
        ========================== -->

        <aside class="v2-sidebar">

            <a href="dashboard.php" class="v2-logo">Accuracy</a>

            <nav class="v2-nav">
                <a href="dashboard.php">Início</a>
                <a href="carteira.php">Carteira</a>
                <a href="aportes.php" class="active">Aportes</a>
                <a href="historico.php">Histórico</a>
                <a href="Cursos.php">Cursos</a>
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
                        <h1>Aportes</h1>
                        <p>Escolha onde investir.</p>
                        <span id="currentDate" hidden></span>
                    </div>
                </div>


                <!-- Busca principal: permanece visível em todas as categorias -->
                <div class="aportes-search-container">
                    <i class="bi bi-search" aria-hidden="true"></i>
                    <input type="search" id="pesquisaAtivosAportes"
                           placeholder="Buscar empresa, ativo ou título"
                           aria-label="Buscar empresa, ativo ou título"
                           autocomplete="off">
                </div>

                <!-- Seletor de produtos / detalhe / formulário -->

                <div class="v2-picker">

                    <!-- preenchido por js/Aportesprodutos.js -->
                    <div id="ppRoot"></div>

                    <div id="formStep" class="aporte-form hidden">

                    <h3>Novo aporte</h3>

                    <div class="pp-selected" id="ppSelected"></div>

                    <label for="asset">Ativo</label>

                    <select id="asset">
                        <option value="PETR4">PETR4 — Petrobras</option>
                        <option value="Bitcoin">Bitcoin</option>
                        <option value="CDB Nubank">CDB Nubank</option>
                        <option value="XPML11">XPML11</option>
                        <option value="Outro">Outro</option>
                    </select>

                    <small id="assetPrice" class="asset-price"></small>

                    <div class="ac-compra-preco" id="compraCotacaoBox" hidden>
                        <span>Preço atual</span>
                        <strong id="compraCotacao">Consultando cotação...</strong>
                    </div>

                    <div id="quantidadeAporteBox" hidden>
                        <label for="quantidadeAporte">Quantidade</label>
                        <p class="ac-compra-ajuda" id="quantidadeAjuda">Informe quantas unidades deseja comprar.</p>
                        <div class="ac-compra-qtd-row">
                            <input id="quantidadeAporte" type="text" inputmode="decimal" autocomplete="off" value="1" aria-label="Quantidade do ativo">
                            <button id="diminuirQuantidade" type="button" aria-label="Diminuir quantidade">−</button>
                            <button id="aumentarQuantidade" type="button" aria-label="Aumentar quantidade">+</button>
                        </div>
                    </div>

                    <div id="valorAporteBox">
                    <label for="amount">Valor do aporte</label>

                    <input
                        type="text"
                        id="amount"
                        value="R$ 500,00"
                        inputmode="decimal">

                    <label>Valores rápidos</label>

                    <div class="quick-values">
                        <button type="button" data-value="100">R$ 100</button>
                        <button type="button" data-value="250">R$ 250</button>
                        <button type="button" data-value="500">R$ 500</button>
                        <button type="button" data-value="750">R$ 750</button>
                        <button type="button" data-value="1000">R$ 1.000</button>
                        <button type="button" id="otherValue">Outro</button>
                    </div>
                    </div><!-- /valorAporteBox -->

                    <div class="ac-compra-resumo" id="compraResumo">
                        <h4>Detalhes da ordem</h4>
                        <div class="ac-compra-linha" id="compraResumoQuantidade" hidden><span>Quantidade</span><strong id="compraQtdResumo">—</strong></div>
                        <div class="ac-compra-linha" id="compraResumoPreco" hidden><span>Preço por unidade</span><strong id="compraPrecoResumo">—</strong></div>
                        <div class="ac-compra-linha"><span id="compraValorRotulo">Valor do investimento</span><strong id="compraValorResumo">R$ 0,00</strong></div>
                        <div class="ac-compra-linha"><span>Taxas estimadas</span><strong>R$ 0,00</strong></div>
                        <div class="ac-compra-total"><span id="compraTotalRotulo">Total estimado da compra</span><strong id="compraTotalResumo">R$ 0,00</strong></div>
                    </div>
                    <p id="compraSaldo" class="ac-compra-saldo">Consultando saldo da carteira...</p>
                    <p id="compraAviso" class="ac-compra-aviso" role="status" aria-live="polite" hidden></p>

                    <!-- CAMPOS INTERNOS DA COMPRA -->
<div class="ac-campos-internos" hidden style="display:none!important;">

    <select id="type">
        <option value="Compra" selected>Compra</option>
    </select>

    <input type="date" id="date">

    <select id="recurrence">
        <option value="none" selected>Nenhuma (unico)</option>
    </select>

    <div id="recurrenceDayBox" class="hidden">
        <input type="number" id="recurrenceDay">
    </div>

    <input type="text" id="observation" value="">

</div>

                    <button
                        class="confirm-btn"
                        id="confirmBtn"
                        type="button">

                        <i class="bi bi-check-circle"></i>
                        Confirmar aporte

                    </button>

                    </div>

                </div>


                <!-- Resumo e histórico dos aportes -->

                <div class="v2-mine">

                    <section class="cards-top">

                        <div class="info-card">
                            <span>TOTAL APORTADO ESTE MÊS</span>

                            <h3 id="totalMonth">R$ 0,00</h3>

                            <small class="green">
                                ▲ Aportes realizados
                            </small>
                        </div>

                        <div class="info-card">
                            <span>APORTES RECORRENTES ATIVOS</span>

                            <h3 id="activeRecurring">0 ativos</h3>

                            <small class="blue" id="nextContribution">
                                Nenhum aporte programado
                            </small>
                        </div>

                        <div class="info-card">
                            <span>MÉDIA MENSAL</span>

                            <h3 id="monthlyAverage">R$ 0,00</h3>

                            <small class="green">
                                Média dos aportes
                            </small>
                        </div>

                    </section>

                    <div class="aporte-list">

                        <div class="list-header">

                            <div>
                                <h3>Meus aportes</h3>

                                <p class="list-subtitle">
                                    Histórico dos aportes realizados
                                </p>
                            </div>

                            <div class="list-header-actions">

                                <span id="contributionCount">
                                    0 aportes
                                </span>

                                <button
                                    class="clear-btn"
                                    id="clearAllBtn"
                                    type="button"
                                    title="Excluir todos os aportes">

                                    <i class="bi bi-trash3"></i>
                                    Excluir aportes

                                </button>

                            </div>

                        </div>

                        <div id="contributionList"></div>

                        <div class="empty-state" id="emptyState">

                            <i class="bi bi-wallet2"></i>

                            <strong>
                                Nenhum aporte realizado
                            </strong>

                            <p>
                                Seus aportes aparecerão aqui.
                            </p>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    </div>

    <div class="toast" id="toast">
        <i class="bi bi-check-circle-fill"></i>
        <span id="toastMessage"></span>
    </div>

    <script src="js/carteiras.js?v=20261124191750"></script>
    <script src="js/cotacoes.js?v=12"></script>
    <script src="js/Aportes.js?v=20261124191750"></script>
    <script src="js/Loading.js"></script>
    <script src="js/aportesExtra.js?v=2"></script>
    <script src="js/resumoCarteiras.js?v=3"></script>
    <script src="js/Aportesdetalhe.js?v=12"></script>
    <script src="js/accuracy-saldos-rapidos.js?v=1"></script>
<script src="js/shell-v2.js?v=22"></script>
    <script src="js/Aportesprodutos.js?v=20261124191750"></script>
    <script src="js/Animacoes.js"></script>

</body>

</html>
