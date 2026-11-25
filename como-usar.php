<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Como usar";
    $estilosPagina = ["css/como-usar.css?v=1"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "como-usar"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content guia">

            <header class="guia-topo">
                <span class="guia-selo">Guia do Accuracy</span>
                <h1>Como usar o Accuracy</h1>
                <p>
                    O Accuracy é um lugar para aprender a investir praticando. Você recebe dinheiro fictício,
                    monta carteiras, compra e vende ativos com cotações reais e acompanha o resultado,
                    sem arriscar nenhum centavo de verdade.
                </p>

                <nav class="guia-sumario" aria-label="Etapas do guia">
                    <a href="#conta"><span>1</span> Conta</a>
                    <a href="#saldo"><span>2</span> Saldo</a>
                    <a href="#carteira"><span>3</span> Carteira</a>
                    <a href="#aporte"><span>4</span> Primeiro aporte</a>
                    <a href="#acompanhar"><span>5</span> Acompanhar</a>
                    <a href="#vender"><span>6</span> Vender e dividendos</a>
                    <a href="#historico"><span>7</span> Histórico</a>
                    <a href="#metas"><span>8</span> Metas e avisos</a>
                    <a href="#cursos"><span>9</span> Cursos</a>
                </nav>
            </header>

            <!-- 1 -->
            <section class="guia-passo" id="conta">
                <div class="guia-texto">
                    <span class="guia-numero">1</span>
                    <h2>Crie sua conta e confirme o e-mail</h2>
                    <p>No cadastro você informa só <strong>nome, e-mail e senha</strong> (mínimo de 8 caracteres). O telefone é opcional.</p>
                    <ul>
                        <li>Enviamos um código de 6 dígitos para o seu e-mail. Ele vale por 10 minutos.</li>
                        <li>Depois de confirmar, é só entrar com o e-mail e a senha.</li>
                        <li>Seus dados podem ser alterados a qualquer momento em <a href="perfil.php">Perfil</a>.</li>
                    </ul>
                </div>
                <div class="guia-ilustracao" aria-hidden="true">
                    <div class="mini-tela">
                        <span class="mini-titulo">Criar conta gratuita</span>
                        <span class="mini-campo"><small>Nome completo</small>Ana Souza</span>
                        <span class="mini-campo"><small>E-mail</small>ana@email.com</span>
                        <span class="mini-campo"><small>Senha</small>••••••••</span>
                        <span class="mini-botao">Criar minha conta</span>
                    </div>
                </div>
            </section>

            <!-- 2 -->
            <section class="guia-passo" id="saldo">
                <div class="guia-texto">
                    <span class="guia-numero">2</span>
                    <h2>Adicione saldo para investir</h2>
                    <p>O <strong>saldo disponível</strong> é o dinheiro fictício da sua conta. Ele é usado nas compras das carteiras reais.</p>
                    <ul>
                        <li>Use <strong>Adicionar saldo</strong>, no menu lateral ou no Início.</li>
                        <li>Escolha um valor pronto (R$ 100, R$ 500, R$ 1.000) ou digite outro.</li>
                        <li>Todo depósito fica registrado no Histórico.</li>
                    </ul>
                </div>
                <div class="guia-ilustracao" aria-hidden="true">
                    <div class="mini-tela">
                        <span class="mini-titulo">Adicionar saldo</span>
                        <span class="mini-destaque"><small>Saldo atual da conta</small>R$ 0,00</span>
                        <span class="mini-chips"><i>R$ 100</i><i class="ativo">R$ 500</i><i>R$ 1.000</i></span>
                        <span class="mini-botao">Confirmar depósito</span>
                    </div>
                </div>
            </section>

            <!-- 3 -->
            <section class="guia-passo largo" id="carteira">
                <div class="guia-texto">
                    <span class="guia-numero">3</span>
                    <h2>Crie uma carteira</h2>
                    <p>Carteiras organizam seus investimentos por objetivo: aposentadoria, reserva, estudo de FIIs... Em <a href="carteira.php">Carteiras</a>, toque em <strong>Criar carteira</strong> e escolha:</p>
                    <ul>
                        <li><strong>Nome e estilo</strong>: o estilo define os ativos aceitos (renda fixa, renda variável, cripto, internacional ou mista).</li>
                        <li><strong>Meta</strong> (opcional): o patrimônio que você quer alcançar nela.</li>
                        <li><strong>Real ou simulada</strong>: veja a diferença abaixo.</li>
                    </ul>
                </div>

                <div class="guia-comparacao">
                    <table>
                        <caption class="sr-only">Diferenças entre carteira real e simulada</caption>
                        <thead>
                            <tr><th scope="col"></th><th scope="col">Carteira real</th><th scope="col">Carteira simulada</th></tr>
                        </thead>
                        <tbody>
                            <tr><th scope="row">De onde vem o dinheiro</th><td>Do seu saldo geral</td><td>De um saldo próprio, que você escolhe ao criar</td></tr>
                            <tr><th scope="row">Entra no patrimônio total</th><td>Sim</td><td>Não, o resultado aparece separado</td></tr>
                            <tr><th scope="row">Para que serve</th><td>Seus investimentos principais</td><td>Testar estratégias sem mexer no saldo</td></tr>
                            <tr><th scope="row">Mais dinheiro</th><td>Adicionar saldo à conta</td><td>Depositar na simulação</td></tr>
                            <tr><th scope="row">Excluir</th><td>Depois de vender os ativos</td><td>A qualquer momento</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- 4 -->
            <section class="guia-passo" id="aporte">
                <div class="guia-texto">
                    <span class="guia-numero">4</span>
                    <h2>Faça seu primeiro aporte</h2>
                    <p>Aporte é o dinheiro que você coloca em um investimento. Em <a href="aportes.php">Aportes</a>:</p>
                    <ol>
                        <li>Busque pelo código ou nome do ativo (PETR4, MXRF11, BTC, Tesouro Selic...) ou navegue pelas categorias.</li>
                        <li>Abra os detalhes para ver o preço atual, o gráfico e a sua posição.</li>
                        <li>Toque em <strong>Comprar</strong>, escolha a quantidade e confira o resumo da ordem.</li>
                        <li>Escolha a carteira que vai receber o investimento e confirme.</li>
                    </ol>
                    <p class="guia-dica"><i class="bi bi-lightbulb" aria-hidden="true"></i> Numa carteira simulada, o botão <strong>Simular investimento</strong> leva direto para esta tela.</p>
                </div>
                <div class="guia-ilustracao" aria-hidden="true">
                    <div class="mini-tela">
                        <span class="mini-titulo">Novo aporte</span>
                        <span class="mini-preco"><small>Preço atual</small>R$ 8,50</span>
                        <span class="mini-campo"><small>Quantidade</small>10</span>
                        <span class="mini-linha"><small>Total estimado</small>R$ 85,00</span>
                        <span class="mini-botao">Confirmar aporte</span>
                    </div>
                </div>
            </section>

            <!-- 5 -->
            <section class="guia-passo" id="acompanhar">
                <div class="guia-texto">
                    <span class="guia-numero">5</span>
                    <h2>Acompanhe o patrimônio</h2>
                    <p>No <a href="dashboard.php">Início</a> você vê, com cotações atualizadas:</p>
                    <ul>
                        <li><strong>Patrimônio total</strong>: saldo disponível + valor atual dos ativos das carteiras reais.</li>
                        <li><strong>Investido e resultado</strong>: quanto custaram os ativos que você tem e quanto eles ganharam ou perderam.</li>
                        <li><strong>Gráfico de evolução</strong>: passe o mouse (ou o dedo) para ver o valor de cada dia.</li>
                        <li><strong>Distribuição</strong> por tipo de ativo e notícias do mercado.</li>
                    </ul>
                </div>
                <div class="guia-ilustracao" aria-hidden="true">
                    <div class="mini-tela">
                        <span class="mini-titulo">Patrimônio total</span>
                        <span class="mini-valor">R$ 10.250,00</span>
                        <svg viewBox="0 0 200 60" class="mini-grafico"><path d="M0 50 L30 44 L60 46 L90 34 L120 36 L150 22 L200 14" /></svg>
                        <span class="mini-linha"><small>Resultado</small><b class="positivo">+R$ 250,00</b></span>
                    </div>
                </div>
            </section>

            <!-- 6 -->
            <section class="guia-passo" id="vender">
                <div class="guia-texto">
                    <span class="guia-numero">6</span>
                    <h2>Venda e receba dividendos</h2>
                    <ul>
                        <li>Para vender, abra a carteira em <a href="carteira.php">Carteiras</a> e use <strong>Vender</strong> no ativo. O dinheiro volta para o saldo de onde saiu.</li>
                        <li>Dividendos são a parte do lucro que algumas empresas e FIIs distribuem. Eles podem ser registrados para os ativos que a carteira possui e entram no saldo.</li>
                        <li>O preço médio dos ativos que ficaram não muda com a venda.</li>
                    </ul>
                </div>
            </section>

            <!-- 7 -->
            <section class="guia-passo" id="historico">
                <div class="guia-texto">
                    <span class="guia-numero">7</span>
                    <h2>Consulte o histórico</h2>
                    <p>Em <a href="historico.php">Histórico</a> ficam todas as compras, vendas, dividendos e depósitos, com filtros por ativo, carteira, período e tipo. Registrou algo errado? Exclua a operação: o Accuracy desfaz o efeito dela no saldo e na posição.</p>
                </div>
            </section>

            <!-- 8 -->
            <section class="guia-passo" id="metas">
                <div class="guia-texto">
                    <span class="guia-numero">8</span>
                    <h2>Metas e notificações</h2>
                    <p>Quando o patrimônio de uma carteira chega à meta, você recebe uma notificação. O sino no topo também avisa sobre compras, vendas, depósitos e respostas da equipe. O número vermelho mostra quantas ainda não foram lidas.</p>
                </div>
            </section>

            <!-- 9 -->
            <section class="guia-passo" id="cursos">
                <div class="guia-texto">
                    <span class="guia-numero">9</span>
                    <h2>Aprenda com os cursos</h2>
                    <p>Em <a href="Cursos.php">Cursos</a> há trilhas em vídeo do básico até FIIs, ações, renda fixa e cripto. Seu progresso fica salvo e, ao final de cada trilha, um quiz ajuda a fixar o que você aprendeu.</p>
                </div>
            </section>

            <!-- GLOSSÁRIO -->
            <section class="guia-glossario" aria-labelledby="tituloGlossario">
                <h2 id="tituloGlossario">Palavras que você vai ver por aqui</h2>
                <dl>
                    <div><dt>Ativo</dt><dd>Qualquer investimento: uma ação, uma cota de FII, um título de renda fixa, uma criptomoeda.</dd></div>
                    <div><dt>Aporte</dt><dd>Dinheiro colocado em um investimento.</dd></div>
                    <div><dt>Preço médio</dt><dd>Quanto você pagou, em média, por unidade de um ativo.</dd></div>
                    <div><dt>Patrimônio</dt><dd>Quanto o que você tem vale hoje.</dd></div>
                    <div><dt>Rentabilidade</dt><dd>Quanto o investimento ganhou ou perdeu, em porcentagem.</dd></div>
                    <div><dt>Renda fixa</dt><dd>Investimento com regra de rendimento definida na aplicação, como CDB e Tesouro.</dd></div>
                    <div><dt>Renda variável</dt><dd>Investimento cujo preço muda todo dia, como ações e FIIs.</dd></div>
                    <div><dt>Dividendos</dt><dd>Parte do lucro distribuída aos donos das ações ou cotas.</dd></div>
                </dl>
            </section>

            <section class="guia-fim">
                <div>
                    <h2>Ficou alguma dúvida?</h2>
                    <p>As perguntas frequentes respondem os casos mais comuns, e você pode falar com a equipe por lá.</p>
                </div>
                <a class="v2-btn" href="ajuda.php">Ver perguntas frequentes</a>
            </section>

            <p class="guia-aviso">
                O Accuracy é um projeto educacional: os valores são fictícios e nada aqui é recomendação de investimento.
            </p>

        </main>

    </div>

</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
</body>

</html>
