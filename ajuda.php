<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Perguntas frequentes";
    $estilosPagina = ["css/ajuda.css?v=1"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "ajuda"; include __DIR__ . "/includes/menu-app.php"; ?>

        <main class="v2-content ajuda">

            <div class="v2-page-head">
                <div>
                    <h1>Perguntas frequentes</h1>
                    <p>Respostas rápidas sobre conta, carteiras, investimentos e o funcionamento do Accuracy.</p>
                </div>
                <a class="v2-btn-outline" href="como-usar.php">Ver o passo a passo</a>
            </div>

            <label class="ajuda-busca">
                <i class="bi bi-search" aria-hidden="true"></i>
                <span class="sr-only">Buscar nas perguntas</span>
                <input type="search" id="ajudaBusca" placeholder="Busque por uma palavra, ex.: saldo, simulada, venda" autocomplete="off">
            </label>

            <nav class="ajuda-temas" aria-label="Temas">
                <a href="#conta">Conta e cadastro</a>
                <a href="#carteiras">Carteiras</a>
                <a href="#operacoes">Investimentos e operações</a>
                <a href="#saldo">Saldo e patrimônio</a>
                <a href="#historico">Histórico</a>
                <a href="#plataforma">Sobre a plataforma</a>
            </nav>

            <p class="ajuda-sem-resultado" id="ajudaSemResultado" hidden>
                Nenhuma pergunta encontrada. Envie sua dúvida para a equipe logo abaixo.
            </p>

            <section class="ajuda-grupo" id="conta">
                <h2>Conta e cadastro</h2>

                <details>
                    <summary>Preciso informar CPF para criar a conta?</summary>
                    <p>Não. O cadastro pede só nome, e-mail e senha. O telefone é opcional e pode ser adicionado depois, em <a href="perfil.php">Perfil</a>.</p>
                </details>

                <details>
                    <summary>Não recebi o código de confirmação do e-mail</summary>
                    <p>Confira a caixa de spam e a aba de promoções. O código vale por 10 minutos; se ele expirar, peça um novo na tela de confirmação. Você só consegue entrar depois de confirmar o e-mail.</p>
                </details>

                <details>
                    <summary>Como altero meu nome, telefone, e-mail ou senha?</summary>
                    <p>Em <a href="perfil.php">Perfil</a>. Nome e telefone mudam na hora. Para trocar o e-mail ou a senha, enviamos um código de confirmação para o seu e-mail atual, por segurança.</p>
                </details>

                <details>
                    <summary>O app e o site usam a mesma conta?</summary>
                    <p>Sim. As carteiras, o saldo, o histórico e as notificações são os mesmos nos dois. O que você faz em um aparece no outro.</p>
                </details>
            </section>

            <section class="ajuda-grupo" id="carteiras">
                <h2>Carteiras</h2>

                <details>
                    <summary>Qual a diferença entre carteira real e simulada?</summary>
                    <p>A <strong>carteira real</strong> usa o seu saldo geral da conta e entra no seu patrimônio total. A <strong>carteira simulada</strong> tem um dinheiro próprio, que você escolhe ao criá-la: serve para testar estratégias sem mexer no saldo geral, e o resultado dela aparece separado.</p>
                    <p>Nos dois casos o dinheiro é fictício: o Accuracy é uma plataforma de estudo.</p>
                </details>

                <details>
                    <summary>Como coloco mais dinheiro em uma simulação?</summary>
                    <p>Abra a carteira simulada em <a href="carteira.php">Carteiras</a> e use <strong>Depositar na simulação</strong>. O valor entra só naquela carteira e conta como capital aplicado para calcular o resultado da simulação.</p>
                </details>

                <details>
                    <summary>O que é o estilo da carteira (renda fixa, variável, cripto...)?</summary>
                    <p>O estilo define que tipo de ativo a carteira recebe. Uma carteira de renda fixa aceita títulos de renda fixa e Tesouro; uma de cripto aceita criptomoedas. A carteira <strong>mista</strong> aceita qualquer ativo.</p>
                </details>

                <details>
                    <summary>Por que não consigo excluir minha carteira real?</summary>
                    <p>Uma carteira real só pode ser excluída quando não tem ativos. Venda os ativos primeiro: o dinheiro da venda volta para o saldo geral e nada some do seu patrimônio. Carteiras simuladas podem ser excluídas a qualquer momento.</p>
                </details>

                <details>
                    <summary>Para que serve a meta da carteira?</summary>
                    <p>É o valor de patrimônio que você quer alcançar naquela carteira. A barra de progresso mostra quanto falta, e você recebe uma notificação quando a meta é atingida.</p>
                </details>
            </section>

            <section class="ajuda-grupo" id="operacoes">
                <h2>Investimentos e operações</h2>

                <details>
                    <summary>Como compro um ativo?</summary>
                    <p>Em <a href="aportes.php">Aportes</a>, busque o ativo pelo código ou nome (por exemplo PETR4, MXRF11 ou BTC), abra os detalhes e toque em <strong>Comprar</strong>. Depois escolha a quantidade e a carteira que vai receber o investimento.</p>
                </details>

                <details>
                    <summary>Como vendo um ativo?</summary>
                    <p>Em <a href="carteira.php">Carteiras</a>, selecione a carteira e use <strong>Vender</strong> na linha do ativo. O valor da venda volta para o saldo de onde o dinheiro saiu: o saldo geral, numa carteira real, ou o saldo da simulação.</p>
                </details>

                <details>
                    <summary>Por que minha compra foi recusada?</summary>
                    <p>Os motivos mais comuns são: saldo insuficiente; o ativo não combina com o estilo da carteira; o preço ficou muito diferente da cotação atual (atualize a tela e tente de novo); ou o código digitado não existe no mercado.</p>
                </details>

                <details>
                    <summary>De onde vêm as cotações?</summary>
                    <p>As cotações de ações, FIIs, BDRs, ETFs, moedas e criptomoedas vêm da brapi, um serviço de dados do mercado brasileiro, e podem ter alguns minutos de atraso. Quando não há cotação disponível, usamos o último fechamento registrado.</p>
                </details>

                <details>
                    <summary>Por que a renda fixa aparece como valor estimado?</summary>
                    <p>Títulos de renda fixa não têm cotação em bolsa. O valor atual é estimado a partir da taxa contratada e dos indicadores do momento (Selic, CDI ou IPCA), considerando os dias desde a aplicação.</p>
                </details>

                <details>
                    <summary>Como funcionam os dividendos?</summary>
                    <p>Dividendos podem ser registrados apenas para ativos que a carteira possui. O valor entra no saldo (geral ou da simulação) e aparece no histórico e no resultado da carteira.</p>
                </details>
            </section>

            <section class="ajuda-grupo" id="saldo">
                <h2>Saldo e patrimônio</h2>

                <details>
                    <summary>O que é o saldo disponível?</summary>
                    <p>É o dinheiro fictício da sua conta que ainda não foi investido. Ele é usado nas compras das carteiras reais. Você pode adicionar saldo pelo botão <strong>Adicionar saldo</strong>.</p>
                </details>

                <details>
                    <summary>Como o patrimônio total é calculado?</summary>
                    <p>Patrimônio total = saldo disponível + valor atual dos ativos das carteiras reais. As carteiras simuladas aparecem separadas, com o resultado de cada simulação, para não misturar o dinheiro de teste com o da conta.</p>
                </details>

                <details>
                    <summary>O que é preço médio?</summary>
                    <p>É quanto você pagou, em média, por unidade de um ativo. Se comprou 10 cotas a R$ 10 e depois 10 a R$ 20, o preço médio é R$ 15. Vender não muda o preço médio das unidades que ficaram.</p>
                </details>

                <details>
                    <summary>O que significam investido, resultado e rentabilidade?</summary>
                    <p><strong>Investido</strong> é o custo dos ativos que você ainda tem (quantidade × preço médio). <strong>Resultado</strong> é a diferença entre o valor atual e o investido. <strong>Rentabilidade</strong> é esse resultado em porcentagem.</p>
                </details>
            </section>

            <section class="ajuda-grupo" id="historico">
                <h2>Histórico</h2>

                <details>
                    <summary>Onde vejo todas as minhas operações?</summary>
                    <p>Em <a href="historico.php">Histórico</a>. Lá aparecem compras, vendas, dividendos e depósitos, com filtros por ativo, carteira, período e tipo, além dos totais do filtro escolhido.</p>
                </details>

                <details>
                    <summary>Posso excluir uma operação registrada por engano?</summary>
                    <p>Sim, pelo ícone de lixeira no histórico. O Accuracy desfaz o efeito da operação: uma compra excluída devolve o dinheiro e uma venda excluída tira o valor do saldo. Não é possível excluir uma compra que já foi vendida; nesse caso, exclua a venda primeiro.</p>
                </details>
            </section>

            <section class="ajuda-grupo" id="plataforma">
                <h2>Sobre a plataforma</h2>

                <details>
                    <summary>O Accuracy é uma corretora?</summary>
                    <p>Não. O Accuracy é um projeto educacional: nenhuma ordem é enviada à bolsa e nenhum dinheiro real é movimentado. A ideia é aprender a investir praticando com carteiras e acompanhando os resultados.</p>
                </details>

                <details>
                    <summary>As informações do Accuracy são recomendação de investimento?</summary>
                    <p>Não. Cotações, notícias, cursos e relatórios têm finalidade educacional e não substituem a orientação de um profissional certificado.</p>
                </details>

                <details>
                    <summary>Como funcionam as notificações?</summary>
                    <p>O sino no topo mostra avisos sobre a sua conta: compras, vendas, dividendos, depósitos, metas alcançadas e respostas da equipe. O número indica quantos ainda não foram lidos.</p>
                </details>
            </section>

            <!-- FALE COM A EQUIPE -->
            <section class="ajuda-contato" id="contato" aria-labelledby="tituloContato">
                <div class="ajuda-contato-texto">
                    <h2 id="tituloContato">Não encontrou sua resposta?</h2>
                    <p>Mande uma mensagem para a equipe Accuracy. Você recebe uma notificação quando ela for respondida.</p>
                </div>

                <form id="formPergunta" class="ajuda-form" novalidate>
                    <label for="perguntaAssunto">Assunto</label>
                    <input id="perguntaAssunto" name="assunto" maxlength="150" required placeholder="Ex.: dúvida sobre a carteira simulada">

                    <label for="perguntaMensagem">Mensagem</label>
                    <textarea id="perguntaMensagem" name="mensagem_pergunta" rows="5" maxlength="2000" required placeholder="Conte com detalhes o que aconteceu ou o que você quer saber."></textarea>

                    <p class="ajuda-form-aviso" id="perguntaAviso" role="status" aria-live="polite"></p>
                    <button class="v2-btn" type="submit">Enviar mensagem</button>
                </form>

                <div class="ajuda-minhas">
                    <h3>Minhas mensagens</h3>
                    <div id="listaPerguntas" aria-busy="true">
                        <span class="skeleton" style="height:60px"></span>
                    </div>
                </div>
            </section>

        </main>

    </div>

</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/ajuda.js?v=1"></script>
</body>

</html>
