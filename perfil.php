

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Perfil - Accuracy</title>

    <link rel="stylesheet" href="css/tema.css">
    <link rel="stylesheet" href="css/perfil.css">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <script src="js/tema.js"></script>

</head>

<body>

<div class="app">

    <!-- =========================
         NAVBAR
    ========================== -->

    <aside class="sidebar">

        <div class="top">

            <!-- LOGO -->

            <a href="dashboard.html" class="logo">

                <div class="logo-box">
                    <i class="bi bi-graph-up"></i>
                </div>

                <span>Accuracy</span>

            </a>

            <div class="divider"></div>

            <!-- MENU -->

            <nav class="menu">

                <a href="dashboard.php">
                    <i class="bi bi-grid"></i>
                    <span>Dashboard</span>
                </a>

                <a href="carteira.php">
                    <i class="bi bi-wallet2"></i>
                    <span>Carteira</span>
                </a>

                <a href="historico.php">
                    <i class="bi bi-clock-history"></i>
                    <span>Histórico</span>
                </a>

                <a href="aportes.php">
                    <i class="bi bi-cash-stack"></i>
                    <span>Aportes</span>
                </a>

                <a href="#">
                    <i class="bi bi-bar-chart"></i>
                    <span>Relatórios</span>
                </a>

                <a href="Cursos.php">
                    <i class="bi bi-mortarboard"></i>
                    <span>Cursos</span>
                </a>

                <a href="perfil.php" class="active">
                    <i class="bi bi-person"></i>
                    <span>Perfil</span>
                </a>

            </nav>

        </div>


        <!-- =========================
             ÁREA DO USUÁRIO
        ========================== -->

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


                    <!-- =========================
                         PAINEL DE NOTIFICAÇÕES
                    ========================== -->

                    <div
                        class="notification-panel"
                        id="notificationPanel"
                    >

                        <!-- CABEÇALHO -->

                        <div class="notification-header">

                            <h3>Notificações</h3>

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
                                <strong>Nenhuma notificação</strong>
                                <p>Você não possui novas notificações.</p>
                            </div>

                        </div>


                        <!-- RODAPÉ -->

                        <div class="notification-footer">

                            <a href="#">
                                Ver todas as notificações
                            </a>

                        </div>

                    </div>

                </div>

            </div>


            <!-- USUÁRIO -->

            <div class="user">

                <a href="#">

                    <div class="avatar" id="navAvatar">
                        N
                    </div>

                </a>

                <div class="user-info">

                    <a href="#">
                        <strong>Nome da pessoa</strong>
                    </a>

                    <p>Perfil do usuário</p>

                </div>

            </div>

        </div>

    </aside>


    <!-- =========================
         MAIN
    ========================== -->

    <main class="main">


        <!-- TOPBAR -->

        <header class="topbar">

            <div>

                <h1>Perfil</h1>

                <p>
                    Gerencie suas informações e preferências
                </p>

            </div>

        </header>



        <!-- =========================
             CONTEÚDO DO PERFIL
        ========================== -->

        <section class="profile-layout">


            <!-- =========================
                 CARD PERFIL
            ========================== -->

            <div class="profile-card">

                <div class="profile-avatar-wrapper">

                    <div class="big-avatar" id="bigAvatar">
                        N
                    </div>

                    <button class="camera-btn" id="cameraBtn" type="button" aria-label="Trocar foto de perfil">
                        <i class="bi bi-camera"></i>
                    </button>

                </div>


                <h2>Nome da pessoa</h2>

                <p class="profile-email">
                    usuario@email.com
                </p>


                <button class="edit-btn">

                    <i class="bi bi-pencil"></i>

                    Editar perfil

                </button>

            </div>



            <!-- =========================
                 MINHA CONTA
            ========================== -->

            <div class="info-card">

                <div class="card-title">

                    <h3>Minha conta</h3>

                </div>


                <div class="info-row">

                    <div class="info-icon">
                        <i class="bi bi-person"></i>
                    </div>

                    <div class="info-content">

                        <span>Nome</span>

                        <p>Nome da pessoa</p>

                    </div>

                    <i class="bi bi-chevron-right arrow"></i>

                </div>


                <div class="info-row">

                    <div class="info-icon">
                        <i class="bi bi-envelope"></i>
                    </div>

                    <div class="info-content">

                        <span>E-mail</span>

                        <p>usuario@email.com</p>

                    </div>

                    <i class="bi bi-chevron-right arrow"></i>

                </div>


                <div class="info-row">

                    <div class="info-icon">
                        <i class="bi bi-telephone"></i>
                    </div>

                    <div class="info-content">

                        <span>Telefone</span>

                        <p>(11) 98765-4321</p>

                    </div>

                    <i class="bi bi-chevron-right arrow"></i>

                </div>


                <div class="info-row">

                    <div class="info-icon">
                        <i class="bi bi-card-text"></i>
                    </div>

                    <div class="info-content">

                        <span>CPF</span>

                        <p>123.456.789-01</p>

                    </div>

                    <i class="bi bi-lock lock"></i>

                </div>

            </div>



            <!-- =========================
                 PREFERÊNCIAS
            ========================== -->

            <div class="info-card">

                <div class="card-title">

                    <h3>Preferências</h3>

                </div>


                


                <!-- LINHA DE APARÊNCIA — CLICÁVEL, TROCA O TEMA -->

                <div class="info-row" id="linhaAparencia">

                    <div class="info-icon">

                        <i class="bi bi-palette"></i>

                    </div>

                    <div class="info-content">

                        <span>Aparência</span>

                        <p id="temaLabel">Tema Claro e Tema Escuro</p>

                    </div>

                    <i class="bi bi-chevron-right arrow"></i>

                </div>


                <div class="info-row">

                    <div class="info-icon">

                        <i class="bi bi-shield-check"></i>

                    </div>

                    <div class="info-content">

                        <span>Segurança</span>

                        <p>Login e autenticação</p>

                    </div>

                    <i class="bi bi-chevron-right arrow"></i>

                </div>

            </div>



            <!-- =========================
                 SEGURANÇA
            ========================== -->

            <div class="security-card">

                <h3>Conta e segurança</h3>


                <div class="security-content">


                    <div class="security-item">

                        <div class="security-icon">

                            <i class="bi bi-lock"></i>

                        </div>

                        <div>

                            <strong>Alterar senha</strong>

                            <p>
                                Atualize sua senha de acesso
                            </p>

                        </div>

                        <i class="bi bi-chevron-right arrow"></i>

                    </div>


                    <div class="security-divider"></div>


                    <div class="security-item logout">

                        <div class="logout-icon">

                            <i class="bi bi-box-arrow-right"></i>

                        </div>

                        <div>

                            <strong>Sair da conta</strong>

                            <p>
                                Encerrar sessão em todos os dispositivos
                            </p>

                        </div>

                        <i class="bi bi-chevron-right arrow"></i>

                    </div>

                </div>

            </div>


        </section>

    </main>

</div>


<!-- =========================
     MODAL - TROCAR FOTO
========================= -->

<div class="avatar-modal-overlay" id="avatarModalOverlay">

    <div class="avatar-modal">

        <div class="avatar-modal-header">

            <h3>Alterar foto de perfil</h3>

            <button class="avatar-modal-close" id="avatarModalClose" type="button" aria-label="Fechar">
                <i class="bi bi-x-lg"></i>
            </button>

        </div>

        <div class="avatar-modal-body">

            <div class="avatar-preview" id="avatarPreview">

                <video id="avatarVideo" class="hidden" autoplay playsinline muted></video>

                <img id="avatarCapturedImg" class="hidden" alt="Foto capturada">

                <div class="avatar-preview-placeholder" id="avatarPlaceholder">
                    <i class="bi bi-person-circle"></i>
                </div>

            </div>

            <canvas id="avatarCanvas" class="hidden"></canvas>

            <p class="avatar-modal-hint" id="avatarHint">
                Tire uma foto com a câmera do seu computador ou envie uma imagem salva no dispositivo.
            </p>

            <div class="avatar-modal-actions" id="avatarActionsDefault">

                <button class="avatar-action-btn primary" id="startCameraBtn" type="button">
                    <i class="bi bi-camera-video"></i>
                    Usar câmera
                </button>

                <button class="avatar-action-btn" id="uploadFileBtn" type="button">
                    <i class="bi bi-upload"></i>
                    Enviar do computador
                </button>

            </div>

            <div class="avatar-modal-actions hidden" id="avatarActionsCamera">

                <button class="avatar-action-btn primary" id="captureBtn" type="button">
                    <i class="bi bi-camera"></i>
                    Capturar foto
                </button>

                <button class="avatar-action-btn" id="cancelCameraBtn" type="button">
                    Cancelar
                </button>

            </div>

            <div class="avatar-modal-actions hidden" id="avatarActionsConfirm">

                <button class="avatar-action-btn primary" id="saveAvatarBtn" type="button">
                    <i class="bi bi-check-circle"></i>
                    Usar esta foto
                </button>

                <button class="avatar-action-btn" id="retakeBtn" type="button">
                    Tentar novamente
                </button>

            </div>

            <input type="file" id="avatarFileInput" accept="image/*" hidden>

        </div>

    </div>

</div>


<!-- =========================
     MODAL - EDITAR PERFIL
========================= -->

<div class="profile-edit-modal-overlay" id="profileEditModalOverlay">

    <div class="profile-edit-modal">

        <div class="avatar-modal-header">
            <h3>Editar perfil</h3>
            <button class="avatar-modal-close" id="profileEditModalClose" type="button" aria-label="Fechar">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>

        <div class="profile-edit-modal-body">

            <div class="profile-edit-icon" id="profileEditIcon">
                <img id="profileEditAvatarImg" class="hidden" alt="Foto de perfil">
                <i class="bi bi-person-circle" id="profileEditIconPlaceholder"></i>
            </div>

            <form id="profileEditForm" novalidate>

                <div class="profile-edit-field">
                    <label for="editNome">Nome</label>
                    <input type="text" id="editNome" name="nome" required>
                </div>

                <div class="profile-edit-field">
                    <label for="editEmail">E-mail</label>
                    <input type="email" id="editEmail" name="email" required>
                    <span class="profile-edit-error hidden" id="editEmailError">
                        E-mail inválido
                    </span>
                </div>

                <div class="profile-edit-field">
                    <label for="editTelefone">Telefone</label>
                    <input type="tel" id="editTelefone" name="telefone" placeholder="(11) 98765-4321">
                </div>

                <div class="profile-edit-field">
                    <label for="editCpf">CPF</label>
                    <input type="text" id="editCpf" name="cpf" disabled>
                    <span class="profile-edit-lock-hint">
                        <i class="bi bi-lock"></i> CPF não pode ser alterado
                    </span>
                </div>

                <div class="avatar-modal-actions">
                    <button class="avatar-action-btn primary" type="submit">
                        <i class="bi bi-check-circle"></i>
                        Salvar alterações
                    </button>
                    <button class="avatar-action-btn" type="button" id="cancelProfileEditBtn">
                        Cancelar
                    </button>
                </div>

            </form>

        </div>

    </div>

</div>


<!-- =========================
     JAVASCRIPT
========================= -->

<script>

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const notificationDot =
        document.getElementById("notificationDot");

    const markRead =
        document.getElementById("markRead");


    notificationBtn.addEventListener("click", function(event) {

        event.stopPropagation();

        notificationPanel.classList.toggle("show");

    });


    notificationPanel.addEventListener("click", function(event) {

        event.stopPropagation();

    });


    document.addEventListener("click", function() {

        notificationPanel.classList.remove("show");

    });


    markRead.addEventListener("click", function() {

        const unreadItems =
            document.querySelectorAll(
                ".notification-item.unread"
            );

        unreadItems.forEach(function(item) {

            item.classList.remove("unread");

            const unreadDot =
                item.querySelector(".unread-dot");

            if (unreadDot) {

                unreadDot.remove();

            }

        });

        notificationDot.style.display = "none";

    });

</script>

<script src="js/perfil.js"></script>

</body>
</html>