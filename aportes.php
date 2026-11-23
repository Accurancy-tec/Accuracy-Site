<!DOCTYPE html>
<html lang="pt-BR">

<head>
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
    <link rel="stylesheet" href="css/Aportesprodutos.css">
    <link rel="stylesheet" href="css/Aportesdetalhe.css">

    <!-- Animações -->
    <link rel="stylesheet" href="css/Animacoes.css">

    <!-- Janelas de carteira -->
    <link rel="stylesheet" href="css/carteiras.css?v=2">

    <!-- Novo layout (precisa vir por último) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">

    <style>
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

                <div class="v2-search">
                    <input type="text"
                           id="v2Search"
                           placeholder="Buscar empresa ou código do ativo"
                           autocomplete="off"
                           aria-label="Buscar empresa ou código do ativo">
                </div>

                <div class="v2-topbar-right">
                    <div class="v2-total"><span>Total</span> <strong id="v2Total">—</strong></div>

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

                    <div class="row">

                        <div>
                            <label for="type">Tipo</label>

                            <select id="type">
                                <option value="Compra">Compra</option>
                                <option value="Venda">Venda</option>
                            </select>
                        </div>

                        <div>
                            <label for="date">Data</label>
                            <input type="date" id="date">
                        </div>

                    </div>

                    <label for="recurrence">Recorrência</label>

                    <select id="recurrence">
                        <option value="none">Nenhuma (único)</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                    </select>

                    <div id="recurrenceDayBox" class="hidden">

                        <label for="recurrenceDay">
                            Dia da recorrência
                        </label>

                        <input
                            type="number"
                            id="recurrenceDay"
                            min="1"
                            max="31"
                            placeholder="Ex: 5">

                    </div>

                    <label for="observation">
                        Observação (opcional)
                    </label>

                    <input
                        type="text"
                        id="observation"
                        placeholder="Ex: aporte programado">

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

    <script src="js/carteiras.js?v=2"></script>
    <script src="js/cotacoes.js?v=4"></script>
    <script src="js/Aportes.js?v=10"></script>
    <script src="js/Loading.js"></script>
    <script src="js/aportesExtra.js?v=2"></script>
    <script src="js/resumoCarteiras.js?v=2"></script>
    <script src="js/Aportesdetalhe.js?v=2"></script>
    <script src="js/shell-v2.js?v=4"></script>
    <script src="js/Aportesprodutos.js?v=5"></script>
    <script src="js/Animacoes.js"></script>

</body>

</html>
