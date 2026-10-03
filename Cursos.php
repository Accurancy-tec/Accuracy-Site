<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Cursos - Accuracy</title>


    <!-- CSS -->

    <link
        rel="stylesheet"
        href="css/tema.css"
    >

    <link
        rel="stylesheet"
        href="css/cursos.css"
    >


    <!-- GOOGLE FONTS -->

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >


    <!-- BOOTSTRAP ICONS -->

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >


    <!-- JS GLOBAIS -->

    <script src="js/usuario-global.js"></script>

    <script src="js/avatar-global.js"></script>

    <script src="js/tema.js"></script>

</head>


<body>


<div class="app">


    <!-- =====================================================
         NAVBAR SUPERIOR
    ====================================================== -->

    <aside class="sidebar">


        <!-- TOPO -->

        <div class="top">


            <!-- LOGO -->

            <a
                href="dashboard.html"
                class="logo"
            >

                <div class="logo-box">

                    <i class="bi bi-graph-up"></i>

                </div>

                <span>
                    Accuracy
                </span>

            </a>


            <!-- DIVISOR -->

            <div class="divider"></div>


            <!-- MENU -->

            <nav class="menu">


                <a href="dashboard.php">

                    <i class="bi bi-grid"></i>

                    <span>
                        Dashboard
                    </span>

                </a>


                <a href="carteira.php">

                    <i class="bi bi-wallet2"></i>

                    <span>
                        Carteira
                    </span>

                </a>


                <a href="historico.php">

                    <i class="bi bi-clock-history"></i>

                    <span>
                        Histórico
                    </span>

                </a>


                <a href="aportes.php">

                    <i class="bi bi-plus-circle"></i>

                    <span>
                        Aportes
                    </span>

                </a>


                

                <a
                    href="cursos.php"
                    class="active"
                >

                    <i class="bi bi-mortarboard"></i>

                    <span>
                        Cursos
                    </span>

                </a>


                <a href="perfil.php">

                    <i class="bi bi-person"></i>

                    <span>
                        Perfil
                    </span>

                </a>


            </nav>


        </div>


        <!-- =====================================================
             ÁREA DO USUÁRIO
        ====================================================== -->

        <div class="user-area">


            <!-- NOTIFICAÇÕES -->

            <div class="icons">


                <div class="notification-container">


                    <button
                        class="notification-btn"
                        type="button"
                        aria-label="Notificações"
                        id="notificationBtn"
                    >

                        <i class="bi bi-bell"></i>

                        <span
                            class="notification-dot"
                            id="notificationDot"
                        ></span>

                    </button>


                    <!-- PAINEL -->

                    <div
                        class="notification-panel"
                        id="notificationPanel"
                    >


                        <!-- CABEÇALHO -->

                        <div class="notification-header">


                            <h3>
                                Notificações
                            </h3>


                            <button
                                type="button"
                                id="markRead"
                            >
                                Marcar como lidas
                            </button>


                        </div>


                        <!-- LISTA -->

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


                        <!-- RODAPÉ -->

                        <div class="notification-footer">

                            <a href="historico.html">

                                Ver todas as notificações

                            </a>

                        </div>


                    </div>


                </div>


            </div>


            <!-- USUÁRIO -->

            <div class="user">


                <a href="perfil.html">

                    <div class="avatar">
                        N
                    </div>

                </a>


                <div class="user-info">


                    <a href="perfil.html">

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


    <!-- =====================================================
         MAIN
    ====================================================== -->

    <main class="main">


        <!-- CABEÇALHO -->

        <header class="page-header">


            <div>

                <h1>
                    Cursos
                </h1>

                <p>
                    Aprenda a investir e evolua seus conhecimentos.
                </p>

            </div>


        </header>


        <!-- =====================================================
             HERO
        ====================================================== -->

        <section class="hero-grid">


            <!-- BANNER -->

            <div class="learning-banner">


                <div class="banner-content">


                    <span class="banner-tag">
                        APRENDIZADO
                    </span>


                    <h2>
                        Aprenda a
                        <span>
                            investir
                        </span>
                    </h2>


                    <p>
                        Conhecimento é um dos melhores
                        investimentos que você pode fazer.
                    </p>


                    <button
                        class="primary-btn"
                        type="button"
                    >
                        Explorar conteúdos
                    </button>


                </div>


                <!-- ILUSTRAÇÃO -->

                <div class="banner-illustration">


                    <div class="book book-1"></div>

                    <div class="book book-2"></div>

                    <div class="book book-3"></div>


                    <div class="graduate">

                        <i class="bi bi-mortarboard-fill"></i>

                    </div>


                </div>


            </div>


            <!-- =====================================================
                 AGRADECIMENTO (CSS embutido)
            ====================================================== -->

            <style>
            .thanks-card {
                min-height: 230px;
                background:
                    radial-gradient(circle at 15% 85%, rgba(59, 130, 246, .16), transparent 40%),
                    var(--surface-2, #0e1f3d);
                border: 1px solid var(--borda-suave, #1c3563);
                border-radius: 14px;
                padding: 28px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                gap: 12px;
                overflow: hidden;
            }

            .thanks-icon {
                width: 54px;
                height: 54px;
                border-radius: 50%;
                background: rgba(59, 130, 246, .15);
                color: #3b82f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                animation: thanksFadeUp .8s ease both, thanksPulse 2.2s ease-in-out .8s infinite;
            }

            .thanks-tag {
                color: #94a3b8;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 1px;
                animation: thanksFadeUp .8s ease .3s both;
            }

            .thanks-title {
                font-size: 24px;
                line-height: 1.3;
                animation: thanksFadeUp .8s ease .6s both;
            }

            .thanks-text {
                max-width: 430px;
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.7;
                animation: thanksFadeUp .8s ease .9s both;
            }

            .thanks-highlight {
                background: linear-gradient(90deg, #3b82f6, #93c5fd, #3b82f6);
                background-size: 200% auto;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                color: transparent;
                animation: thanksShine 3s linear infinite;
            }

            /* ---------- CORAÇÕES SUBINDO ---------- */

            .thanks-card {
                position: relative;
            }

            .thanks-card > *:not(.thanks-hearts) {
                position: relative;
                z-index: 1;
            }

            .thanks-hearts {
                position: absolute;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
                z-index: 0;
            }

            .thanks-hearts i {
                position: absolute;
                bottom: -30px;
                left: var(--x);
                font-size: var(--s);
                color: #3b82f6;
                opacity: 0;
                animation: thanksRise var(--t) ease-in infinite;
                animation-delay: var(--d);
            }

            @keyframes thanksRise {
                0%   { transform: translateY(0) translateX(0) scale(.8); opacity: 0; }
                15%  { opacity: .55; }
                50%  { transform: translateY(-130px) translateX(12px) scale(1); }
                100% { transform: translateY(-290px) translateX(-10px) scale(1.1); opacity: 0; }
            }

            @keyframes thanksFadeUp {
                from { opacity: 0; transform: translateY(14px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            @keyframes thanksPulse {
                0%, 100% { transform: scale(1); }
                50%      { transform: scale(1.14); }
            }

            @keyframes thanksShine {
                to { background-position: 200% center; }
            }

            @media (prefers-reduced-motion: reduce) {
                .thanks-icon, .thanks-tag, .thanks-title,
                .thanks-text, .thanks-highlight { animation: none; }
                .thanks-hearts { display: none; }
            }
            </style>

            <div class="thanks-card">

                <!-- CORAÇÕES SUBINDO -->
                <div class="thanks-hearts" aria-hidden="true">
                    <i class="bi bi-heart-fill" style="--x: 6%;  --s: 12px; --d: 0s;   --t: 6s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 16%; --s: 18px; --d: 1.8s; --t: 7s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 27%; --s: 10px; --d: 3.2s; --t: 5.5s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 38%; --s: 16px; --d: .9s;  --t: 6.5s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 50%; --s: 11px; --d: 4s;   --t: 6s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 61%; --s: 20px; --d: 2.4s; --t: 7.5s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 72%; --s: 13px; --d: 0.4s; --t: 5.8s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 82%; --s: 17px; --d: 3.6s; --t: 6.8s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 91%; --s: 11px; --d: 1.4s; --t: 6.2s;"></i>
                    <i class="bi bi-heart-fill" style="--x: 45%; --s: 14px; --d: 5s;   --t: 7s;"></i>
                </div>

                <div class="thanks-icon">
                    <i class="bi bi-heart-fill"></i>
                </div>

                <span class="thanks-tag">
                    OBRIGADO
                </span>

                <h3 class="thanks-title">
                    Ficamos muito
                    <span class="thanks-highlight">gratos</span>
                    por você
                </h3>

                <p class="thanks-text">
                    Aprender sobre investimentos é o que dá um motivo
                    para o nosso projeto existir. Cada passo que você dá
                    faz o Accuracy valer a pena.
                </p>

            </div>


        </section>


        <!-- =====================================================
             FILTROS
        ====================================================== -->

        <section class="filter-section">


            <div>

                <h2>
                    Conteúdos para você
                </h2>

                <p>
                    Escolha uma categoria para começar.
                </p>

            </div>


            <div class="filters">


                <button
                    class="filter active"
                    type="button"
                    data-category="all"
                >
                    Todos
                </button>


                <button
                    class="filter"
                    type="button"
                    data-category="iniciante"
                >
                    Iniciante
                </button>


                <button
                    class="filter"
                    type="button"
                    data-category="fiis"
                >
                    FIIs
                </button>


                <button
                    class="filter"
                    type="button"
                    data-category="acoes"
                >
                    Ações
                </button>


                <button
                    class="filter"
                    type="button"
                    data-category="cripto"
                >
                    Cripto
                </button>


            </div>


        </section>


        <!-- =====================================================
             RECOMENDADOS
        ====================================================== -->

        <section class="recommended">


            <div class="section-header">


                <div>

                    <h2>
                        Recomendados para você
                    </h2>

                  

                </div>


                <a href="#">

                    Ver todos

                    <i class="bi bi-arrow-right"></i>

                </a>


            </div>


            <div class="courses-grid">


                <!-- =================================================
                     CURSO 1
                ================================================== -->

                <article
                    class="course-card"
                    data-category="iniciante"
                >


                    <div
                        class="course-thumb video-thumb"
                        data-thumbnail="fHtiAir-Fh0"
                    >

                        <img
                            src="https://img.youtube.com/vi/25ScX8Ixhm4/maxresdefault.jpg"
                            alt="Capa do vídeo"
                        >

                        <button
                            class="play-button"
                            type="button"
                            data-video="25ScX8Ixhm4"
                            aria-label="Assistir curso"
                        >
                            <i class="bi bi-play-fill"></i>
                        </button>

                    </div>


                    <div class="course-body">


                        <div class="course-top">


                            <span class="level beginner">
                                Iniciante
                            </span>


                        </div>


                        <h3>
                            Como começar a investir
                        </h3>


                        <p>
                            Aprenda os primeiros passos
                            para organizar sua vida financeira.
                        </p>


                        <div class="course-meta">


                            <span>

                                <i class="bi bi-clock"></i>

                                10 min

                            </span>


                            <span>
                                1 aula
                            </span>


                        </div>


                    </div>


                </article>


                <!-- =================================================
                     CURSO 2
                ================================================== -->

                <article
                    class="course-card"
                    data-category="fiis"
                >


                    <div class="course-thumb fii-thumb">


                        <i class="bi bi-buildings-fill"></i>

                        <img
                            src="https://img.youtube.com/vi/z3fTzc0q10M/maxresdefault.jpg"
                            alt="Capa do vídeo"
                        >

                        <button
                            class="play-button"
                            type="button"
                            data-video="z3fTzc0q10M"
                            aria-label="Assistir curso"
                        >

                            <i class="bi bi-play-fill"></i>

                        </button>


                    </div>


                    <div class="course-body">


                        <div class="course-top">


                            <span class="level intermediate">
                                Intermediário
                            </span>


                        </div>


                        <h3>
                            O que são Fundos Imobiliários
                        </h3>


                        <p>
                            Entenda como funcionam os FIIs
                            e a geração de renda.
                        </p>


                        <div class="course-meta">


                            <span>

                                <i class="bi bi-clock"></i>

                                1 Hora 5 min

                            </span>


                            <span>
                                1 aula
                            </span>


                        </div>


                    </div>


                </article>


                <!-- =================================================
                     CURSO 3
                ================================================== -->

                <article
                    class="course-card"
                    data-category="acoes"
                >


                    <div class="course-thumb stock-thumb">


                        <i class="bi bi-bar-chart-fill"></i>

                        <img
                            src="https://img.youtube.com/vi/yHuNhkntc-I/maxresdefault.jpg"
                            alt="Capa do vídeo"
                        >

                        <button
                            class="play-button"
                            type="button"
                            data-video="yHuNhkntc-I"
                            aria-label="Assistir curso"
                        >

                            <i class="bi bi-play-fill"></i>

                        </button>


                    </div>


                    <div class="course-body">


                        <div class="course-top">


                            <span class="level beginner">
                                Iniciante
                            </span>


                        </div>


                        <h3>
                            Ações: o que são e como investir
                        </h3>


                        <p>
                            Conheça os conceitos essenciais
                            do mercado de ações.
                        </p>


                        <div class="course-meta">


                            <span>

                                <i class="bi bi-clock"></i>

                                26 min

                            </span>


                            <span>
                                1 aula
                            </span>


                        </div>


                    </div>


                </article>


                <!-- =================================================
                     CURSO 4
                ================================================== -->

                <article
                    class="course-card"
                    data-category="cripto"
                >


                    <div class="course-thumb crypto-thumb">

                        <img
                            src="https://img.youtube.com/vi/-ozukv39uic/maxresdefault.jpg"
                            alt="Capa do vídeo"
                        >

                        <i class="bi bi-currency-bitcoin"></i>


                        <button
                            class="play-button"
                            type="button"
                            data-video="-ozukv39uic"
                            aria-label="Assistir curso"
                        >

                            <i class="bi bi-play-fill"></i>

                        </button>


                    </div>


                    <div class="course-body">


                        <div class="course-top">


                            <span class="level intermediate">
                                Intermediário
                            </span>


                        </div>


                        <h3>
                            Entendendo Bitcoin e Criptomoedas
                        </h3>


                        <p>
                            Veja como funcionam os principais
                            ativos digitais.
                        </p>


                        <div class="course-meta">


                            <span>

                                <i class="bi bi-clock"></i>

                                31 min

                            </span>


                            <span>
                                1 aula
                            </span>


                        </div>


                    </div>


                </article>


            </div>


        </section>


        <!-- =====================================================
             TIPOS DE INVESTIMENTO (clique abre um card com resumo)
        ====================================================== -->

        <style>
        .invest-types {
            background: var(--surface-2, #0e1f3d);
            border: 1px solid var(--borda-suave, #1c3563);
            border-radius: 14px;
            padding: 20px;
        }

        .invest-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .invest-card {
            background: var(--icone-bg, #0b1930);
            border: 1px solid var(--borda-suave, #1c3563);
            border-radius: 12px;
            padding: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            text-align: left;
            color: inherit;
            cursor: pointer;
            transition: .25s;
        }

        .invest-card:hover,
        .invest-card:focus-visible {
            border-color: #3b82f6;
            transform: translateY(-3px);
            outline: none;
        }

        .invest-icon {
            width: 48px;
            height: 48px;
            flex-shrink: 0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        .invest-icon.cripto { background: rgba(245, 158, 11, .15); color: #f59e0b; }
        .invest-icon.fiis   { background: rgba(34, 197, 94, .15);  color: #22c55e; }
        .invest-icon.acoes  { background: rgba(59, 130, 246, .15); color: #3b82f6; }

        .invest-card strong {
            display: block;
            font-size: 14px;
            margin-bottom: 4px;
        }

        .invest-card small {
            color: #94a3b8;
            font-size: 11px;
        }

        .invest-arrow {
            margin-left: auto;
            color: #94a3b8;
            transition: .25s;
        }

        .invest-card:hover .invest-arrow {
            color: #3b82f6;
            transform: translateX(3px);
        }

        /* ---------- CARDZINHO ---------- */

        .info-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, .6);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            visibility: hidden;
            transition: opacity .2s ease, visibility .2s ease;
            z-index: 999990;
        }

        .info-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        .info-card {
            position: relative;
            width: 340px;
            max-width: 100%;
            background: var(--surface, #0e1f3d);
            border: 1px solid var(--borda, #294875);
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, .6);
            transform: translateY(14px) scale(.96);
            transition: transform .25s ease;
        }

        .info-overlay.show .info-card {
            transform: translateY(0) scale(1);
        }

        .info-close {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 30px;
            height: 30px;
            border: none;
            border-radius: 50%;
            background: #1c3563;
            color: #fff;
            cursor: pointer;
            font-size: 12px;
        }

        .info-close:hover { background: #2563eb; }

        .info-card .invest-icon {
            margin-bottom: 14px;
        }

        .info-card h3 {
            font-size: 18px;
            margin-bottom: 8px;
        }

        .info-card > p {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 16px;
        }

        .info-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }

        .info-list li {
            font-size: 12px;
            line-height: 1.5;
            display: flex;
            gap: 8px;
        }

        .info-list i {
            color: #3b82f6;
            margin-top: 2px;
        }

        .info-risk {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
            padding-top: 14px;
            border-top: 1px solid var(--borda-suave, #1c3563);
        }

        .info-risk-bars {
            display: flex;
            gap: 4px;
        }

        .info-risk-bars span {
            width: 22px;
            height: 5px;
            border-radius: 10px;
            background: #1c3563;
        }

        .info-risk-bars span.on { background: #3b82f6; }

        .info-note {
            margin-top: 12px;
            font-size: 10px;
            color: #64748b;
        }

        @media (max-width: 900px) {
            .invest-grid { grid-template-columns: 1fr; }
        }
        </style>

        <section class="invest-types">

            <div class="section-header">

                <div>
                    <h2>Tipos de investimento</h2>
                    <p>Clique em um card para entender o básico.</p>
                </div>

            </div>

            <div class="invest-grid">

                <button class="invest-card" type="button" data-info="cripto">
                    <div class="invest-icon cripto">
                        <i class="bi bi-currency-bitcoin"></i>
                    </div>
                    <div>
                        <strong>Criptomoedas</strong>
                        <small>Moedas digitais</small>
                    </div>
                    <i class="bi bi-chevron-right invest-arrow"></i>
                </button>

                <button class="invest-card" type="button" data-info="fiis">
                    <div class="invest-icon fiis">
                        <i class="bi bi-buildings-fill"></i>
                    </div>
                    <div>
                        <strong>Fundos Imobiliários</strong>
                        <small>Renda com imóveis</small>
                    </div>
                    <i class="bi bi-chevron-right invest-arrow"></i>
                </button>

                <button class="invest-card" type="button" data-info="acoes">
                    <div class="invest-icon acoes">
                        <i class="bi bi-bar-chart-fill"></i>
                    </div>
                    <div>
                        <strong>Ações</strong>
                        <small>Sócio de empresas</small>
                    </div>
                    <i class="bi bi-chevron-right invest-arrow"></i>
                </button>

            </div>

        </section>


        <!-- CARDZINHO QUE ABRE AO CLICAR -->

        <div class="info-overlay" id="infoOverlay" aria-hidden="true">

            <div class="info-card" role="dialog" aria-modal="true" aria-labelledby="infoTitle">

                <button class="info-close" id="infoClose" type="button" aria-label="Fechar">
                    <i class="bi bi-x-lg"></i>
                </button>

                <div class="invest-icon" id="infoIcon">
                    <i class="bi" id="infoIconI"></i>
                </div>

                <h3 id="infoTitle"></h3>

                <p id="infoText"></p>

                <ul class="info-list" id="infoList"></ul>

                <div class="info-risk">
                    <span>Nível de risco: <strong id="infoRiskLabel"></strong></span>
                    <div class="info-risk-bars" id="infoRiskBars">
                        <span></span><span></span><span></span>
                    </div>
                </div>

                <p class="info-note">
                    Conteúdo educativo. Não é recomendação de investimento.
                </p>

            </div>

        </div>

        <script>
        (function () {

            var dados = {

                cripto: {
                    titulo: "Criptomoedas",
                    icone: "bi-currency-bitcoin",
                    classe: "cripto",
                    texto: "São moedas digitais que existem só na internet, sem controle de um banco central. O Bitcoin é a mais conhecida.",
                    itens: [
                        "Negociadas 24 horas por dia, todos os dias.",
                        "Os preços variam muito em pouco tempo.",
                        "Invista só o que você aceita arriscar."
                    ],
                    risco: 3,
                    riscoTexto: "Alto"
                },

                fiis: {
                    titulo: "Fundos Imobiliários",
                    icone: "bi-buildings-fill",
                    classe: "fiis",
                    texto: "Vários investidores juntam dinheiro em um fundo que investe em imóveis, como shoppings e galpões, ou em títulos do setor.",
                    itens: [
                        "Você compra cotas, a partir de valores baixos.",
                        "Costumam pagar rendimentos todo mês.",
                        "O valor da cota pode subir ou cair."
                    ],
                    risco: 2,
                    riscoTexto: "Médio"
                },

                acoes: {
                    titulo: "Ações",
                    icone: "bi-bar-chart-fill",
                    classe: "acoes",
                    texto: "Uma ação é uma pequena parte de uma empresa. Ao comprar, você passa a ser sócio dela.",
                    itens: [
                        "Pode ganhar com a valorização da ação.",
                        "Algumas empresas distribuem lucros (dividendos).",
                        "Costuma funcionar melhor no longo prazo."
                    ],
                    risco: 2,
                    riscoTexto: "Médio a alto"
                }

            };

            var overlay = document.getElementById("infoOverlay");
            var fechar = document.getElementById("infoClose");

            function abrir(chave) {

                var d = dados[chave];
                if (!d) { return; }

                document.getElementById("infoTitle").textContent = d.titulo;
                document.getElementById("infoText").textContent = d.texto;
                document.getElementById("infoRiskLabel").textContent = d.riscoTexto;

                document.getElementById("infoIcon").className = "invest-icon " + d.classe;
                document.getElementById("infoIconI").className = "bi " + d.icone;

                var lista = document.getElementById("infoList");
                lista.innerHTML = "";

                d.itens.forEach(function (item) {
                    var li = document.createElement("li");
                    li.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
                    var span = document.createElement("span");
                    span.textContent = item;
                    li.appendChild(span);
                    lista.appendChild(li);
                });

                var barras = document.querySelectorAll("#infoRiskBars span");
                barras.forEach(function (b, i) {
                    b.classList.toggle("on", i < d.risco);
                });

                overlay.classList.add("show");
                overlay.setAttribute("aria-hidden", "false");
            }

            function fecharCard() {
                overlay.classList.remove("show");
                overlay.setAttribute("aria-hidden", "true");
            }

            document.querySelectorAll(".invest-card").forEach(function (card) {
                card.addEventListener("click", function () {
                    abrir(card.getAttribute("data-info"));
                });
            });

            fechar.addEventListener("click", fecharCard);

            overlay.addEventListener("click", function (e) {
                if (e.target === overlay) { fecharCard(); }
            });

            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") { fecharCard(); }
            });

        })();
        </script>


    </main>


</div>

<!-- =====================================================
     MODAL DO VÍDEO
====================================================== -->

<div
    class="video-modal"
    id="videoModal"
    aria-hidden="true"
>

    <div
        class="video-container"
        role="dialog"
        aria-modal="true"
        aria-label="Vídeo do curso"
    >

        <div class="video-header">

            <strong>
                Vídeo do curso
            </strong>


            <button
                type="button"
                class="close-video"
                id="closeVideo"
                aria-label="Fechar vídeo"
            >

                <i class="bi bi-x-lg"></i>

            </button>

        </div>


        <div class="video-wrapper">

            <iframe
                id="youtubePlayer"
                src=""
                title="Vídeo do curso"
                frameborder="0"
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>

        </div>

    </div>

</div>


<script src="js/cursos.js"></script>

</body>

</html>