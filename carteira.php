<?php

session_start();

include('configs/conexao.php');
require_once('classes/carteira.class.php');

if (!isset($_SESSION["id"])) {
    header("Location: login.php");
    exit;
}

$carteiraObj = new carteira($_SESSION["id"]);

$dadosCarteira = $carteiraObj->obterCarteira();

$carteira = $dadosCarteira["carteira"];
$totalInvestido = $dadosCarteira["totalInvestido"];
$patrimonioTotal = $dadosCarteira["patrimonioTotal"];
$rendimentoTotal = $dadosCarteira["rendimentoTotal"];
$rentabilidadeTotal = $dadosCarteira["rentabilidadeTotal"];
$totalAtivos = $dadosCarteira["totalAtivos"];

function dinheiro($valor)
{
    return "R$ " . number_format(
        (float) $valor,
        2,
        ",",
        "."
    );
}

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Carteira - Accuracy</title>

    <link
        rel="stylesheet"
        href="css/carteira.css"
    >

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >

</head>

<body>

<div class="app">

    <aside class="sidebar">

        <div class="top">

            <a
                href="dashboard.php"
                class="logo"
            >

                <div class="logo-box">
                    <i class="bi bi-graph-up"></i>
                </div>

                <span>Accuracy</span>

            </a>

            <div class="divider"></div>

            <nav class="menu">

                <a href="dashboard.php">

                    <i class="bi bi-grid-1x2-fill"></i>

                    <span>Dashboard</span>

                </a>

                <a
                    href="carteira.php"
                    class="active"
                >

                    <i class="bi bi-wallet2"></i>

                    <span>Carteira</span>

                </a>

                <a href="historico.php">

                    <i class="bi bi-clock-history"></i>

                    <span>Histórico</span>

                </a>

                <a href="aportes.php">

                    <i class="bi bi-plus-circle"></i>

                    <span>Aportes</span>

                </a>

                <a href="#">

                    <i class="bi bi-bar-chart-line"></i>

                    <span>Relatórios</span>

                </a>

                <a href="Cursos.php">

                    <i class="bi bi-mortarboard"></i>

                    <span>Cursos</span>

                </a>

                <a href="perfil.php">

                    <i class="bi bi-person"></i>

                    <span>Perfil</span>

                </a>

            </nav>

        </div>

        <div class="user-area">

            <div class="icons">

                <div class="notification-container">

                    <button
                        class="notification-btn"
                        id="notificationBtn"
                        type="button"
                        aria-label="Notificações"
                    >

                        <i class="bi bi-bell"></i>

                        <span
                            class="notification-dot"
                            id="notificationDot"
                        ></span>

                    </button>

                    <div
                        class="notification-panel"
                        id="notificationPanel"
                    >

                        <div class="notification-header">

                            <h3>Notificações</h3>

                            <button
                                id="markRead"
                                type="button"
                            >
                                Marcar como lidas
                            </button>

                        </div>

                        <div class="notification-list">

                            <div class="empty-notifications">

                                <i class="bi bi-bell-slash"></i>

                                <strong>
                                    Nenhuma notificação
                                </strong>

                                <p>
                                    Você não possui novas notificações.
                                </p>

                            </div>

                        </div>

                        <div class="notification-footer">

                            <a href="historico.php">
                                Ver todas as notificações
                            </a>

                        </div>

                    </div>

                </div>

            </div>

            <div class="user">

                <a href="perfil.php">

                    <div class="avatar">
                        N
                    </div>

                </a>

                <div class="user-info">

                    <a href="perfil.php">

                        <strong>
                            Nome da pessoa
                        </strong>

                    </a>

                    <p>
                        Perfil do usuário
                    </p>

                </div>

            </div>

        </div>

    </aside>

    <main class="main">

        <header class="topbar">

            <div>

                <h1>Carteira</h1>

                <p>
                    <?= date("d/m/Y") ?>
                </p>

            </div>

        </header>

        <section class="cards">

            <div class="card highlight">

                <h3>
                    PATRIMÔNIO TOTAL
                </h3>

                <p>
                    <?= dinheiro($patrimonioTotal) ?>
                </p>

                <span
                    class="<?= $rentabilidadeTotal >= 0 ? 'green' : 'red' ?>"
                >

                    <?= $rentabilidadeTotal >= 0 ? "+" : "" ?>

                    <?= number_format(
                        $rentabilidadeTotal,
                        2,
                        ",",
                        "."
                    ) ?>%

                    desde o início

                </span>

            </div>

            <div class="card">

                <h3>
                    TOTAL INVESTIDO
                </h3>

                <p>
                    <?= dinheiro($totalInvestido) ?>
                </p>

                <span>
                    Soma dos seus aportes
                </span>

            </div>

            <div class="card">

                <h3>
                    RENDIMENTO TOTAL
                </h3>

                <p
                    class="<?= $rendimentoTotal >= 0 ? 'green' : 'red' ?>"
                >

                    <?= $rendimentoTotal >= 0 ? "+" : "" ?>

                    <?= dinheiro($rendimentoTotal) ?>

                </p>

                <span>

                    <?= $rentabilidadeTotal >= 0 ? "+" : "" ?>

                    <?= number_format(
                        $rentabilidadeTotal,
                        2,
                        ",",
                        "."
                    ) ?>%

                    no período

                </span>

            </div>

        </section>

        <section class="content">

            <div class="table-container">

                <div class="table-header">

                    <h3>
                        Investimentos ativos
                    </h3>

                    <span class="badge">

                        <?= $totalAtivos ?>

                        <?= $totalAtivos === 1
                            ? "ativo"
                            : "ativos"
                        ?>

                    </span>

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>ATIVO</th>

                            <th>QUANTIDADE</th>

                            <th>PREÇO ATUAL</th>

                            <th>VALOR TOTAL</th>

                            <th>RENDIMENTO</th>

                        </tr>

                    </thead>

                    <tbody>

                    <?php if (empty($carteira)): ?>

                        <tr>

                            <td
                                colspan="5"
                                style="text-align: center;"
                            >
                                Nenhum investimento encontrado.
                            </td>

                        </tr>

                    <?php else: ?>

                        <?php foreach ($carteira as $item): ?>

                            <tr>

                                <td>
                                    <?= htmlspecialchars(
                                        $item["ativo"]
                                    ) ?>
                                </td>

                                <td>

                                    <?= number_format(
                                        $item["quantidade"],
                                        8,
                                        ",",
                                        "."
                                    ) ?>

                                </td>

                                <td>

                                    <?php if (
                                        $item["preco_atual"] !== null
                                    ): ?>

                                        <?= dinheiro(
                                            $item["preco_atual"]
                                        ) ?>

                                    <?php else: ?>

                                        N/D

                                    <?php endif; ?>

                                </td>

                                <td>

                                    <?php

                                    $valorExibido =
                                        $item["preco_atual"] !== null
                                            ? $item["valor_atual"]
                                            : $item["total_investido"];

                                    ?>

                                    <?= dinheiro(
                                        $valorExibido
                                    ) ?>

                                </td>

                                <td>

                                    <?php if (
                                        $item["preco_atual"] !== null
                                    ): ?>

                                        <span
                                            class="<?= $item["rentabilidade"] >= 0
                                                ? "green"
                                                : "red"
                                            ?>"
                                        >

                                            <?= $item["rentabilidade"] >= 0
                                                ? "+"
                                                : ""
                                            ?>

                                            <?= number_format(
                                                $item["rentabilidade"],
                                                2,
                                                ",",
                                                "."
                                            ) ?>%

                                        </span>

                                    <?php else: ?>

                                        --

                                    <?php endif; ?>

                                </td>

                            </tr>

                        <?php endforeach; ?>

                    <?php endif; ?>

                    </tbody>

                </table>

            </div>

            <div class="chart">

                <h3>
                    Distribuição
                </h3>

                <?php if (empty($carteira)): ?>

                    <div
                        style="
                            padding: 40px 20px;
                            text-align: center;
                            color: #94a3b8;
                        "
                    >

                        <i
                            class="bi bi-pie-chart"
                            style="font-size: 40px;"
                        ></i>

                        <p>
                            Nenhum investimento para exibir.
                        </p>

                    </div>

                <?php else: ?>

                    <div class="circle"></div>

                    <div class="legend">

                        <?php foreach ($carteira as $item): ?>

                            <div>

                                <span>
                                    <?= htmlspecialchars(
                                        $item["ativo"]
                                    ) ?>
                                </span>

                                <span>

                                    <?= number_format(
                                        $item["porcentagem"],
                                        1,
                                        ",",
                                        "."
                                    ) ?>%

                                </span>

                            </div>

                        <?php endforeach; ?>

                    </div>

                <?php endif; ?>

            </div>

        </section>

    </main>

</div>

<script>

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationPanel =
    document.getElementById("notificationPanel");

const notificationDot =
    document.getElementById("notificationDot");

const markRead =
    document.getElementById("markRead");

notificationBtn.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        notificationPanel.classList.toggle("show");

    }
);

notificationPanel.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

    }
);

document.addEventListener(
    "click",
    function () {

        notificationPanel.classList.remove("show");

    }
);
markRead.addEventListener(
    "click",
    function () {

        const unreadItems =
            document.querySelectorAll(
                ".notification-item.unread"
            );
        unreadItems.forEach(
            function (item) {
                item.classList.remove("unread");
                const unreadDot =
                    item.querySelector(
                        ".unread-dot"
                    );

                if (unreadDot) {
                    unreadDot.remove();
                }
            }
        );

        notificationDot.style.display = "none";
    }
);
</script>
</body>
</html>