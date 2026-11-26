<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Relatório";
    $estilosPagina = ["css/report.css?v=1"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "relatorio"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content report">

            <div class="v2-page-head">
                <div>
                    <h1>Relatório</h1>
                    <p id="reportPeriod">Resumo da sua conta.</p>
                </div>

                <div class="v2-head-actions report-actions">
                    <label>
                        <span class="sr-only">Período do relatório</span>
                        <select id="reportDays">
                            <option value="7">Últimos 7 dias</option>
                            <option value="30" selected>Últimos 30 dias</option>
                            <option value="90">Últimos 90 dias</option>
                            <option value="365">Últimos 12 meses</option>
                        </select>
                    </label>

                    <button type="button" class="v2-btn-outline" id="reportPrint">
                        <i class="bi bi-printer" aria-hidden="true"></i>
                        Imprimir
                    </button>
                </div>
            </div>

            <p class="report-status" id="reportStatus" role="status">Montando o relatório...</p>

            <div id="reportContent" hidden>

                <section class="v2-stats report-numbers" aria-label="Resumo">
                    <div class="v2-stat">
                        <span>Patrimônio real</span>
                        <strong id="reportNetWorth">—</strong>
                        <small id="reportNetWorthDetail"></small>
                    </div>
                    <div class="v2-stat">
                        <span>Investido nas carteiras reais</span>
                        <strong id="reportInvested">—</strong>
                        <small id="reportInvestedDetail"></small>
                    </div>
                    <div class="v2-stat">
                        <span>Resultado dos ativos reais</span>
                        <strong id="reportResult">—</strong>
                        <small id="reportResultDetail"></small>
                    </div>
                    <div class="v2-stat">
                        <span>Carteiras simuladas</span>
                        <strong id="reportSimulated">—</strong>
                        <small id="reportSimulatedDetail"></small>
                    </div>
                </section>

                <section class="v2-panel report-analysis" aria-labelledby="reportAnalysisTitle">
                    <div class="v2-panel-head">
                        <h2 id="reportAnalysisTitle">Análise do Assistente Accuracy</h2>
                    </div>
                    <div class="report-diagnosis">
                        <div>
                            <span>Diversificação</span>
                            <strong id="reportDiversification">—</strong>
                            <small id="reportDiversificationLabel"></small>
                        </div>
                        <div>
                            <span>Perfil de risco</span>
                            <strong id="reportRisk">—</strong>
                            <small id="reportRiskBasis"></small>
                        </div>
                        <div>
                            <span>Saldo sem aplicação</span>
                            <strong id="reportIdleCash">—</strong>
                            <small>do patrimônio real</small>
                        </div>
                    </div>
                    <div id="reportParagraphs"></div>
                    <div class="report-study" id="reportStudy" hidden>
                        <h3>Para estudar agora</h3>
                        <ul id="reportStudyList"></ul>
                    </div>
                    <p class="report-assistant-note">
                        Análise automática, feita com regras de educação financeira a partir dos números deste relatório.
                        Não é recomendação de investimento.
                    </p>
                </section>

                <div class="report-grid">
                    <section class="v2-panel" aria-labelledby="reportNotesTitle">
                        <div class="v2-panel-head">
                            <h2 id="reportNotesTitle">O que os números mostram</h2>
                        </div>
                        <ul class="report-notes" id="reportNotes"></ul>
                    </section>

                    <section class="v2-panel" aria-labelledby="reportDistributionTitle">
                        <div class="v2-panel-head">
                            <h2 id="reportDistributionTitle">Distribuição da carteira real</h2>
                        </div>
                        <div class="report-bars" id="reportDistribution"></div>
                    </section>

                </div>

                <section class="v2-panel" aria-labelledby="reportActivityTitle">
                    <div class="v2-panel-head">
                        <h2 id="reportActivityTitle">Movimentação no período</h2>
                    </div>
                    <div class="report-activity" id="reportActivity"></div>
                </section>

                <section class="v2-panel" aria-labelledby="reportWalletsTitle">
                    <div class="v2-panel-head">
                        <h2 id="reportWalletsTitle">Carteiras</h2>
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
                            <tbody id="reportWallets"></tbody>
                        </table>
                    </div>
                </section>

                <div class="report-grid">
                    <section class="v2-panel" aria-labelledby="reportBestTitle">
                        <div class="v2-panel-head">
                            <h2 id="reportBestTitle">Maiores altas</h2>
                        </div>
                        <ul class="report-assets" id="reportBest"></ul>
                    </section>

                    <section class="v2-panel" aria-labelledby="reportWorstTitle">
                        <div class="v2-panel-head">
                            <h2 id="reportWorstTitle">Maiores quedas</h2>
                        </div>
                        <ul class="report-assets" id="reportWorst"></ul>
                    </section>
                </div>

                <p class="report-disclaimer" id="reportDisclaimer"></p>
            </div>

        </main>

    </div>

</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/report.js?v=1"></script>
</body>

</html>
