<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Aportes";
    $estilosPagina = ["css/dashboard.css?v=2", "css/aportes.css?v=3", "css/Aportesprodutos.css?v=13", "css/Aportesdetalhe.css?v=2", "css/Animacoes.css?v=2", "css/carteiras.css?v=3", "css/aportes-compra.css?v=1"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

    <div class="v2-app">

    <?php $paginaAtual = "aportes"; include __DIR__ . "/includes/menu-app.php"; ?>


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


<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/carteiras.js?v=20261126"></script>
<script src="js/cotacoes.js?v=13"></script>
<script src="js/Aportes.js?v=20261125"></script>
<script src="js/Aportesdetalhe.js?v=13"></script>
<script src="js/Aportesprodutos.js?v=20261126b"></script>
<script src="js/Animacoes.js?v=2"></script>
</body>

</html>
