<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Relatório";
    $estilosPagina = ["css/relatorio.css?v=2"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "relatorio"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content relatorio">

            <div class="v2-page-head">
                <div>
                    <h1>Relatório</h1>
                    <p id="relPeriodo">Resumo da sua conta.</p>
                </div>

                <div class="v2-head-actions rel-acoes">
                    <label>
                        <span class="sr-only">Período do relatório</span>
                        <select id="relDias">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30" selected>Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="365">Últimos 12 meses</option>
                        </select>
                    </label>

                    <button type="button" class="v2-btn-outline" id="relImprimir">
                        <i class="bi bi-printer" aria-hidden="true"></i>
                        Imprimir
                    </button>
                </div>
            </div>

            <p class="rel-estado" id="relEstado" role="status">Montando o relatório...</p>

            <div id="relConteudo" hidden>

                <section class="v2-stats rel-numeros" aria-label="Resumo">
                    <div class="v2-stat">
                        <span>Patrimônio real</span>
                        <strong id="relPatrimonio">—</strong>
                        <small id="relPatrimonioDetalhe"></small>
                    </div>
                    <div class="v2-stat">
                        <span>Investido nas carteiras reais</span>
                        <strong id="relInvestido">—</strong>
                        <small id="relInvestidoDetalhe"></small>
                    </div>
                    <div class="v2-stat">
                        <span>Resultado dos ativos reais</span>
                        <strong id="relResultado">—</strong>
                        <small id="relResultadoDetalhe"></small>
                    </div>
                    <div class="v2-stat">
                        <span>Carteiras simuladas</span>
                        <strong id="relSimulado">—</strong>
                        <small id="relSimuladoDetalhe"></small>
                    </div>
                </section>

                <div class="rel-grade">
                    <section class="v2-panel" aria-labelledby="relObsTitulo">
                        <div class="v2-panel-head">
                            <h2 id="relObsTitulo">O que os números mostram</h2>
                        </div>
                        <ul class="rel-observacoes" id="relObservacoes"></ul>
                    </section>

                    <section class="v2-panel rel-ia" aria-labelledby="relIaTitulo">
                        <div class="v2-panel-head">
                            <h2 id="relIaTitulo">Análise com IA</h2>
                        </div>
                        <div class="rel-ia-texto" id="relIaTexto" aria-live="polite"></div>
                        <p class="rel-ia-status" id="relIaStatus" role="status"></p>
                        <button type="button" class="v2-btn" id="relIaGerar" hidden>
                            <i class="bi bi-stars" aria-hidden="true"></i>
                            Gerar análise
                        </button>
                        <p class="rel-ia-nota">
                            Escrita por IA a partir dos números deste relatório (sem nome, e-mail ou telefone).
                            Pode conter erros e não é recomendação de investimento.
                        </p>
                    </section>
                </div>

                <div class="rel-grade">
                    <section class="v2-panel" aria-labelledby="relDistTitulo">
                        <div class="v2-panel-head">
                            <h2 id="relDistTitulo">Distribuição da carteira real</h2>
                        </div>
                        <div class="rel-barras" id="relDistribuicao"></div>
                    </section>

                    <section class="v2-panel" aria-labelledby="relMovTitulo">
                        <div class="v2-panel-head">
                            <h2 id="relMovTitulo">Movimentação no período</h2>
                        </div>
                        <div class="rel-mov" id="relMovimentacao"></div>
                    </section>
                </div>

                <section class="v2-panel" aria-labelledby="relCartTitulo">
                    <div class="v2-panel-head">
                        <h2 id="relCartTitulo">Carteiras</h2>
                    </div>
                    <div class="v2-table-wrap">
                        <table class="v2-table v2-tabela-cartoes">
                            <thead>
                                <tr>
                                    <th>Carteira</th>
                                    <th>Tipo</th>
                                    <th class="num">Patrimônio</th>
                                    <th class="num">Investido</th>
                                    <th class="num">Resultado</th>
                                    <th class="num">Meta</th>
                                </tr>
                            </thead>
                            <tbody id="relCarteiras"></tbody>
                        </table>
                    </div>
                </section>

                <div class="rel-grade">
                    <section class="v2-panel" aria-labelledby="relAltasTitulo">
                        <div class="v2-panel-head">
                            <h2 id="relAltasTitulo">Maiores altas</h2>
                        </div>
                        <ul class="rel-ativos" id="relAltas"></ul>
                    </section>

                    <section class="v2-panel" aria-labelledby="relQuedasTitulo">
                        <div class="v2-panel-head">
                            <h2 id="relQuedasTitulo">Maiores quedas</h2>
                        </div>
                        <ul class="rel-ativos" id="relQuedas"></ul>
                    </section>
                </div>

                <p class="rel-aviso" id="relAviso"></p>
            </div>

        </main>

    </div>

</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/relatorio.js?v=1"></script>
</body>

</html>
