<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Perfil - Accuracy</title>

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/dashboard.css">

    <link rel="stylesheet" href="css/perfil-v2.css">

    <!-- Novo layout (sidebar, topo, cartões e tabelas) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">

    <script src="js/usuario-global.js"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
        rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <script src="js/Tema.js"></script>
    <script src="js/avatar-global.js"></script>
</head>

<body class="v2">

<div class="v2-app">

    <!-- =========================
         SIDEBAR
    ========================== -->

    <aside class="v2-sidebar">

        <a href="dashboard.php" class="v2-logo">Accuracy</a>

        <nav class="v2-nav">
                <a href="dashboard.php">Início</a>
                <a href="carteira.php">Carteira</a>
                <a href="aportes.php">Aportes</a>
                <a href="historico.php">Histórico</a>
                <a href="Cursos.php">Cursos</a>
                <a href="perfil.php" class="active">Perfil</a>
        </nav>

        <div class="v2-balance">
            <span>Saldo disponível</span>
            <strong id="v2Saldo">—</strong>
            <button type="button" id="v2AddSaldo">Adicionar saldo</button>
        </div>

    </aside>


    <div class="v2-main">

        <!-- =========================
             TOPO
        ========================== -->

        <header class="v2-topbar">

            <div class="v2-search">
                <input type="text"
                       id="v2Search"
                       placeholder="Buscar empresa ou código do ativo"
                       autocomplete="off"
                       aria-label="Buscar empresa ou código do ativo">
            </div>

            <div class="v2-topbar-right">
                <div class="v2-total"><span>Total</span> <strong id="v2Total">—</strong></div>

                <a href="perfil.php" aria-label="Perfil">
                    <div class="avatar" id="navAvatar">U</div>
                </a>
            </div>

        </header>


        <main class="v2-content">

            <div class="v2-page-head">
                <div>
                    <h1>Perfil</h1>
                    <p>Dados e segurança da conta.</p>
                </div>
            </div>

            <div class="v2-profile">

                <!-- CARTÃO LATERAL -->

                <aside class="v2-profile-side profile-card">

                    <div class="big-avatar" id="bigAvatar">N</div>

                    <h2>Nome da pessoa</h2>
                    <p class="profile-email">usuario@email.com</p>

                    <button type="button" class="v2-btn-outline" id="cameraBtn">Trocar foto</button>

                    <div class="v2-rowlink" id="linhaAparencia" role="button" tabindex="0">
                        <span>Aparência</span>
                        <span class="v2-chip" id="temaLabel">Alternar tema</span>
                    </div>

                    <div class="v2-rowlink security-item logout" role="button" tabindex="0">
                        <span>Sair da conta</span>
                        <span class="v2-chip danger">Sair</span>
                    </div>

                </aside>


                <!-- DADOS -->

                <div class="v2-profile-main">

                    <section class="v2-panel">

                        <div class="v2-panel-head">
                            <h2>Dados pessoais</h2>
                        </div>

                        <div class="v2-fields">

                            <div class="info-row">
                                <div class="info-content"><span>Nome</span><p>Nome da pessoa</p></div>
                            </div>

                            <div class="info-row">
                                <div class="info-content"><span>E-mail</span><p>usuario@email.com</p></div>
                            </div>

                            <div class="info-row">
                                <div class="info-content"><span>Telefone</span><p>—</p></div>
                            </div>

                            <div class="info-row locked">
                                <div class="info-content"><span>CPF</span><p>—</p></div>
                            </div>

                        </div>

                        <button type="button" class="v2-btn edit-btn">Editar dados</button>

                    </section>

                </div>

            </div>

        </main>

    </div>

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
<script src="js/cotacoes.js?v=3"></script>
<script src="js/resumoCarteiras.js?v=2"></script>
<script src="js/shell-v2.js?v=4"></script>
<script src="js/perfil.js?v=2"></script>

</body>
</html>
