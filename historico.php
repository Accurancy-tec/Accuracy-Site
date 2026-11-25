<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Histórico";
    $estilosPagina = ["css/historico-v2.css?v=3"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "historico"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content historico">

            <div class="v2-page-head">
                <div>
                    <h1>Histórico</h1>
                    <p>Compras, vendas, dividendos e depósitos de todas as suas carteiras.</p>
                </div>
            </div>

            <!-- FILTROS -->
            <form class="historico-filtros" id="historicoFiltros" role="search" aria-label="Filtrar histórico">
                <label class="historico-busca">
                    <i class="bi bi-search" aria-hidden="true"></i>
                    <span class="sr-only">Buscar por ativo</span>
                    <input type="search" id="filtroBusca" placeholder="Buscar ativo (ex.: PETR4)" autocomplete="off" maxlength="60">
                </label>

                <label>
                    <span>Carteira</span>
                    <select id="filtroCarteira">
                        <option value="">Todas as carteiras</option>
                    </select>
                </label>

                <label>
                    <span>Período</span>
                    <select id="filtroPeriodo">
                        <option value="30">Últimos 30 dias</option>
                        <option value="180">Últimos 6 meses</option>
                        <option value="365">Últimos 12 meses</option>
                        <option value="" selected>Todo o período</option>
                    </select>
                </label>

                <div class="historico-tipos" role="group" aria-label="Tipo de movimentação">
                    <button type="button" class="ativo" data-tipo="" aria-pressed="true">Todas</button>
                    <button type="button" data-tipo="Compra" aria-pressed="false">Compras</button>
                    <button type="button" data-tipo="Venda" aria-pressed="false">Vendas</button>
                    <button type="button" data-tipo="Dividendo" aria-pressed="false">Dividendos</button>
                    <button type="button" data-tipo="Deposito" aria-pressed="false">Depósitos</button>
                </div>
            </form>

            <!-- TOTAIS DO FILTRO -->
            <section class="historico-totais" aria-live="polite">
                <div><span>Compras</span><strong id="totalCompras" class="carregando-texto">R$ 0,00</strong></div>
                <div><span>Vendas</span><strong id="totalVendas" class="carregando-texto">R$ 0,00</strong></div>
                <div><span>Dividendos</span><strong id="totalDividendos" class="carregando-texto">R$ 0,00</strong></div>
                <div><span>Depósitos</span><strong id="totalDepositos" class="carregando-texto">R$ 0,00</strong></div>
            </section>

            <!-- MOVIMENTAÇÕES -->
            <section class="v2-panel">
                <div class="v2-table-wrap">
                    <table class="v2-table historico-tabela">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Operação</th>
                                <th>Ativo</th>
                                <th>Carteira</th>
                                <th class="num">Quantidade</th>
                                <th class="num">Preço unit.</th>
                                <th class="num">Valor</th>
                                <th class="num"><span class="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody id="historicoCorpo">
                            <tr><td colspan="8"><span class="skeleton" style="height:18px"></span></td></tr>
                            <tr><td colspan="8"><span class="skeleton" style="height:18px"></span></td></tr>
                            <tr><td colspan="8"><span class="skeleton" style="height:18px"></span></td></tr>
                        </tbody>
                    </table>
                </div>

                <nav class="historico-paginas" id="historicoPaginas" aria-label="Páginas do histórico" hidden>
                    <button type="button" class="v2-btn-outline" id="paginaAnterior">Anterior</button>
                    <span id="paginaAtual"></span>
                    <button type="button" class="v2-btn-outline" id="paginaSeguinte">Próxima</button>
                </nav>
            </section>

        </main>

    </div>

</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/Historico.js?v=3"></script>
</body>

</html>
