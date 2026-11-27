<?php
/**
 * Menu lateral + barra do topo da área logada.
 *
 * A página define $paginaAtual com a chave do item ativo e, depois do include,
 * continua com o <main>. O include abre <div class="v2-main">; a página fecha.
 */
$paginaAtual = $paginaAtual ?? "";

$itensMenu = [
    "inicio" => ["dashboard.php", "bi-house", "Início"],
    "carteira" => ["carteira.php", "bi-wallet2", "Carteiras"],
    "aportes" => ["aportes.php", "bi-graph-up-arrow", "Aportes"],
    "historico" => ["historico.php", "bi-clock-history", "Histórico"],
    "cursos" => ["Cursos.php", "bi-mortarboard", "Cursos"],
    "relatorio" => ["report.php", "bi-clipboard-data", "Relatório"],
];

$itensAjuda = [
    "como-usar" => ["como-usar.php", "bi-signpost-2", "Como usar"],
    "ajuda" => ["ajuda.php", "bi-question-circle", "Perguntas frequentes"],
    "perfil" => ["perfil.php", "bi-person", "Perfil"],
];

$linkMenu = function (string $chave, array $item) use ($paginaAtual): string {
    [$href, $icone, $rotulo] = $item;
    $ativo = $chave === $paginaAtual;

    return sprintf(
        '<a href="%s"%s><i class="bi %s" aria-hidden="true"></i><span>%s</span></a>',
        $href,
        $ativo ? ' class="active" aria-current="page"' : "",
        $icone,
        htmlspecialchars($rotulo)
    );
};
?>
<aside class="v2-sidebar" id="v2Sidebar">

    <a href="dashboard.php" class="v2-logo">
        <span class="v2-logo-marca" aria-hidden="true"><i class="bi bi-bar-chart-line-fill"></i></span>
        Accuracy
    </a>

    <nav class="v2-nav" aria-label="Menu principal">
        <?php foreach ($itensMenu as $chave => $item): ?>
            <?= $linkMenu($chave, $item) ?>
        <?php endforeach; ?>

        <span class="v2-nav-separador">Ajuda e conta</span>

        <?php foreach ($itensAjuda as $chave => $item): ?>
            <?= $linkMenu($chave, $item) ?>
        <?php endforeach; ?>
    </nav>

    <div class="v2-balance">
        <span>Saldo disponível</span>
        <strong id="v2Saldo" class="carregando-texto">—</strong>
        <button type="button" id="v2AddSaldo">Adicionar saldo</button>
    </div>

</aside>

<div class="v2-menu-fundo" id="v2MenuFundo" hidden></div>

<div class="v2-main">

    <header class="v2-topbar">

        <button type="button" class="v2-icon-btn v2-menu-btn" id="v2MenuBtn"
                aria-label="Abrir menu" aria-controls="v2Sidebar" aria-expanded="false">
            <i class="bi bi-list" aria-hidden="true"></i>
        </button>

        <div class="v2-topbar-right">

            <div class="v2-total">
                <span>Saldo disponível</span>
                <strong id="v2Total" class="carregando-texto">—</strong>
            </div>

            <button type="button" class="v2-icon-btn" id="themeBtn" aria-label="Alternar tema claro e escuro">
                <i class="bi bi-sun" aria-hidden="true"></i>
            </button>

            <div class="v2-notif">
                <button type="button" class="v2-icon-btn" id="v2NotifBtn"
                        aria-label="Notificações" aria-haspopup="dialog" aria-expanded="false" aria-controls="v2NotifPainel">
                    <i class="bi bi-bell" aria-hidden="true"></i>
                    <span class="v2-notif-contador" id="v2NotifContador" hidden></span>
                </button>

                <section class="v2-notif-painel" id="v2NotifPainel" role="dialog" aria-label="Notificações" hidden>
                    <header>
                        <h2>Notificações</h2>
                        <button type="button" class="v2-link-btn" id="v2NotifLerTodas">Marcar todas como lidas</button>
                    </header>
                    <ul class="v2-notif-lista" id="v2NotifLista"></ul>
                </section>
            </div>

            <a href="perfil.php" aria-label="Perfil">
                <div class="avatar">U</div>
            </a>
        </div>

    </header>
