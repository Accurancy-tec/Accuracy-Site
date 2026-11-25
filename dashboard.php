<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Início";
    $estilosPagina = ["css/inicio.css?v=1", "css/dashboard-destaques.css?v=6"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

    <div class="v2-app">

        <?php $paginaAtual = "inicio"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content inicio">

            <div class="v2-page-head">
                <div>
                    <h1>Olá, <span id="nomeUsuario">Usuário</span></h1>
                    <p id="inicioData"></p>
                </div>
                <div class="v2-head-actions">
                    <button type="button" class="v2-btn-outline" data-v2-saldo>Adicionar saldo</button>
                    <a class="v2-btn" href="aportes.php">Fazer um aporte</a>
                </div>
            </div>

            <!-- RESUMO DO PATRIMÔNIO + MERCADO -->
            <section class="inicio-topo">

                <article class="inicio-patrimonio" aria-labelledby="tituloPatrimonio" aria-busy="true">
                    <div class="inicio-patrimonio-cabeca">
                        <span id="tituloPatrimonio">Patrimônio total</span>
                        <span class="inicio-variacao" id="inicioVariacao" hidden></span>
                    </div>

                    <strong class="inicio-patrimonio-valor carregando-texto" id="inicioPatrimonio">R$ 0,00</strong>
                    <p class="inicio-patrimonio-nota">Saldo disponível + valor atual dos ativos das carteiras reais.</p>

                    <dl class="inicio-numeros">
                        <div>
                            <dt>Saldo disponível</dt>
                            <dd class="carregando-texto" id="inicioSaldo">R$ 0,00</dd>
                        </div>
                        <div>
                            <dt>Investido</dt>
                            <dd class="carregando-texto" id="inicioInvestido">R$ 0,00</dd>
                        </div>
                        <div>
                            <dt>Valor atual dos ativos</dt>
                            <dd class="carregando-texto" id="inicioMercado">R$ 0,00</dd>
                        </div>
                        <div>
                            <dt>Resultado</dt>
                            <dd class="carregando-texto" id="inicioResultado">R$ 0,00</dd>
                        </div>
                    </dl>

                    <a class="inicio-simulacoes" id="inicioSimulacoes" href="carteira.php" hidden></a>
                </article>

                <section class="featured-assets" aria-labelledby="featuredAssetsTitle">
                    <h2 id="featuredAssetsTitle">Ativos em destaque</h2>
                    <div class="featured-assets-empty">
                        <span class="skeleton" style="height:52px"></span>
                        <span class="skeleton" style="height:52px"></span>
                        <span class="skeleton" style="height:52px"></span>
                        <p hidden></p>
                    </div>
                </section>

            </section>

            <!-- 1. CRIAR CARTEIRA -->
            <section class="inicio-criar" aria-labelledby="tituloCriar">
                <span class="inicio-criar-icone" aria-hidden="true"><i class="bi bi-wallet2"></i></span>
                <div>
                    <h2 id="tituloCriar">Organize seus investimentos em carteiras</h2>
                    <p>Use uma carteira <strong>real</strong> com o seu saldo ou uma <strong>simulada</strong> com o valor que quiser para testar estratégias.</p>
                </div>
                <a class="v2-btn" href="carteira.php?nova=1">Criar carteira</a>
            </section>

            <!-- 2. NOTÍCIAS -->
            <section class="inicio-noticias" aria-labelledby="tituloNoticias">
                <div class="inicio-secao-cabeca">
                    <div>
                        <h2 id="tituloNoticias">Notícias do mercado</h2>
                        <p>Economia e investimentos, de portais de notícias e da equipe Accuracy.</p>
                    </div>
                </div>
                <div class="inicio-noticias-lista" id="inicioNoticias" aria-busy="true">
                    <div class="inicio-noticia esqueleto"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div>
                    <div class="inicio-noticia esqueleto"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div>
                    <div class="inicio-noticia esqueleto"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></div>
                </div>
            </section>

            <!-- 3. GRÁFICO -->
            <section class="inicio-grafico" aria-labelledby="tituloGrafico">
                <div class="inicio-secao-cabeca">
                    <div>
                        <h2 id="tituloGrafico">Evolução dos investimentos</h2>
                        <p>Valor diário dos ativos das carteiras reais.</p>
                    </div>
                    <div class="inicio-periodos" role="tablist" aria-label="Período do gráfico">
                        <button type="button" role="tab" data-periodo="1M" aria-selected="false">1 mês</button>
                        <button type="button" role="tab" data-periodo="6M" aria-selected="true" class="ativo">6 meses</button>
                        <button type="button" role="tab" data-periodo="1A" aria-selected="false">1 ano</button>
                    </div>
                </div>

                <div class="inicio-grafico-area" id="inicioGrafico" aria-busy="true">
                    <div class="grafico-carregando">
                        <span class="skeleton"></span>
                        <small>Montando o gráfico…</small>
                    </div>
                </div>

                <dl class="inicio-grafico-rodape" id="inicioGraficoRodape" hidden>
                    <div><dt>Início do período</dt><dd id="graficoInicio"></dd></div>
                    <div><dt>Hoje</dt><dd id="graficoFim"></dd></div>
                    <div><dt>Diferença (inclui novos aportes)</dt><dd id="graficoVariacao"></dd></div>
                </dl>
            </section>

            <!-- DISTRIBUIÇÃO E CARTEIRAS -->
            <section class="inicio-baixo">
                <article class="inicio-distribuicao" aria-labelledby="tituloDistribuicao">
                    <h2 id="tituloDistribuicao">Distribuição por tipo de ativo</h2>
                    <div id="inicioDistribuicao" aria-busy="true">
                        <span class="skeleton" style="height:16px"></span>
                        <span class="skeleton" style="height:16px"></span>
                        <span class="skeleton" style="height:16px"></span>
                    </div>
                </article>

                <article class="inicio-carteiras" aria-labelledby="tituloCarteiras">
                    <div class="inicio-secao-cabeca">
                        <h2 id="tituloCarteiras">Suas carteiras</h2>
                        <a class="v2-link-btn" href="carteira.php">Ver todas</a>
                    </div>
                    <ul id="inicioCarteiras" aria-busy="true">
                        <li><span class="skeleton" style="height:44px"></span></li>
                        <li><span class="skeleton" style="height:44px"></span></li>
                    </ul>
                </article>
            </section>

        </main>

    </div>
</div>

<dialog class="inicio-noticia-dialogo" id="noticiaDialogo" aria-labelledby="noticiaDialogoTitulo">
    <form method="dialog">
        <span class="inicio-noticia-fonte" id="noticiaDialogoFonte"></span>
        <h2 id="noticiaDialogoTitulo"></h2>
        <div id="noticiaDialogoTexto"></div>
        <button class="v2-btn" value="fechar">Fechar</button>
    </form>
</dialog>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/grafico-linha.js?v=1"></script>
<script src="js/inicio.js?v=1"></script>
<script defer src="js/dashboard-destaques.js?v=logos7"></script>
</body>

</html>
