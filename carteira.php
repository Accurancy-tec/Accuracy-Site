<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Carteiras";
    $estilosPagina = ["css/carteiras.css?v=3", "css/carteira-pagina.css?v=1"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "carteira"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content">

            <div class="v2-page-head">
                <div>
                    <h1>Carteiras</h1>
                    <p id="v2Sub" aria-live="polite">Carregando suas carteiras…</p>
                </div>
                <button type="button" class="v2-btn" id="v2CreateBtn">Criar carteira</button>
            </div>

            <!-- CARTEIRAS -->
            <section class="v2-wallets" id="v2Wallets" aria-label="Minhas carteiras">
                <div class="v2-wallet-skeleton"></div>
                <div class="v2-wallet-skeleton"></div>
                <div class="v2-wallet-skeleton"></div>
            </section>

            <!-- CARTEIRA SELECIONADA -->
            <section class="v2-panel carteira-detalhe" id="carteiraDetalhe" aria-live="polite">

                <div class="carteira-detalhe-cabeca">
                    <div>
                        <h2 id="v2TableTitle">Carteira</h2>
                        <span class="carteira-detalhe-tag" id="carteiraTag"></span>
                    </div>

                    <div class="carteira-detalhe-acoes" id="carteiraAcoes">
                        <button type="button" class="v2-btn" id="btnSimular" hidden>Simular investimento</button>
                        <button type="button" class="v2-btn-outline" id="btnDepositarSimulacao" hidden>Depositar na simulação</button>
                        <a class="v2-btn" id="btnAporte" href="aportes.php" hidden>Fazer um aporte</a>
                        <button type="button" class="v2-ghost-danger" id="v2DeleteBtn" hidden>Excluir carteira</button>
                    </div>
                </div>

                <dl class="carteira-numeros" id="carteiraNumeros">
                    <div><dt>Patrimônio</dt><dd class="carregando-texto">—</dd></div>
                    <div><dt>Investido</dt><dd class="carregando-texto">—</dd></div>
                    <div><dt>Resultado</dt><dd class="carregando-texto">—</dd></div>
                    <div><dt>Meta</dt><dd class="carregando-texto">—</dd></div>
                </dl>

                <div class="v2-table-wrap">
                    <table class="v2-table v2-tabela-cartoes">
                        <thead>
                            <tr>
                                <th>Ativo</th>
                                <th class="num">Qtd.</th>
                                <th class="num">Preço médio</th>
                                <th class="num">Preço atual</th>
                                <th class="num">Posição</th>
                                <th class="num">Rentab.</th>
                                <th class="num"><span class="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody id="v2Body">
                            <tr><td colspan="7"><span class="skeleton" style="height:18px"></span></td></tr>
                            <tr><td colspan="7"><span class="skeleton" style="height:18px"></span></td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

        </main>

    </div>

</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/carteiras.js?v=20261125"></script>
<script src="js/carteira-v2.js?v=10"></script>
</body>

</html>
