
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Perfil";
    $estilosPagina = ["css/dashboard.css?v=2", "css/perfil-v2.css?v=11", "css/password-toggle.css?v=1"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "perfil"; include __DIR__ . "/includes/menu-app.php"; ?>

        <!-- CONTEÚDO -->
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

                    <div class="big-avatar" id="bigAvatar">U</div>

                    <h2>Carregando...</h2>

                    <p class="profile-email">Carregando...</p>

                    <button
                        type="button"
                        class="v2-btn-outline"
                        id="cameraBtn">
                        Trocar foto
                    </button>

                    <div
                        class="v2-rowlink"
                        id="linhaAparencia"
                        role="button"
                        tabindex="0">

                        <span>Aparência</span>

                        <span class="v2-chip" id="temaLabel">
                            Alternar tema
                        </span>
                    </div>

                    <div
                        class="v2-rowlink security-item logout"
                        role="button"
                        tabindex="0">

                        <span>Sair da conta</span>

                        <span class="v2-chip danger">Sair</span>
                    </div>

                </aside>

                <!-- DADOS DO USUÁRIO -->
                <div class="v2-profile-main">

                    <section class="v2-panel">

                        <div class="v2-panel-head">
                            <h2>Dados pessoais</h2>
                        </div>

                        <div class="v2-fields">

                            <div class="info-row">
                                <div class="info-content">
                                    <span>Nome</span>
                                    <p>Carregando...</p>
                                </div>
                            </div>

                            <div class="info-row">
                                <div class="info-content">
                                    <span>E-mail</span>
                                    <p>Carregando...</p>
                                </div>
                            </div>

                            <div class="info-row">
                                <div class="info-content">
                                    <span>Telefone</span>
                                    <p>—</p>
                                </div>
                            </div>

                            <div class="info-row locked">
                                <div class="info-content">
                                    <span>CPF</span>
                                    <p>—</p>
                                </div>
                            </div>

                        </div>

                        <button
                            type="button"
                            class="v2-btn edit-btn">
                            Editar dados
                        </button>

                    </section>

                    <!-- SEGURANÇA -->
                    <p
                        id="securityStatus"
                        class="accuracy-security-status"
                        role="status"
                        aria-live="polite">
                    </p>

                    <section
                        class="v2-panel accuracy-security-panel"
                        aria-labelledby="segurancaTitulo">

                        <div class="v2-panel-head">
                            <h2 id="segurancaTitulo">
                                Segurança da conta
                            </h2>
                        </div>

                        <p class="accuracy-security-desc">
                            Proteja seu acesso com códigos enviados por e-mail.
                        </p>

                        <div class="accuracy-security-actions">

                            <button
                                type="button"
                                class="v2-btn-outline"
                                id="abrirTrocaEmail">

                                <i class="bi bi-envelope"></i>
                                Alterar e-mail
                            </button>

                            <button
                                type="button"
                                class="v2-btn-outline"
                                id="abrirTrocaSenha">

                                <i class="bi bi-shield-lock"></i>
                                Alterar senha
                            </button>

                        </div>

                    </section>

                    <!-- APARELHOS CONECTADOS -->
                    <section
                        class="v2-panel aparelhos-panel"
                        aria-labelledby="aparelhosTitulo">

                        <div class="v2-panel-head">
                            <h2 id="aparelhosTitulo">Aparelhos conectados</h2>
                        </div>

                        <p class="accuracy-security-desc">
                            Onde a sua conta está aberta. Se não reconhecer algum acesso,
                            desconecte e troque a senha.
                        </p>

                        <ul class="aparelhos-lista" id="listaAparelhos">
                            <li class="aparelho-vazio">Carregando aparelhos...</li>
                        </ul>

                        <p
                            id="aparelhosStatus"
                            class="accuracy-security-status"
                            role="status"
                            aria-live="polite">
                        </p>

                        <div class="accuracy-security-actions">

                            <button
                                type="button"
                                id="desconectarOutros"
                                disabled>

                                <i class="bi bi-phone"></i>
                                Desconectar os outros
                            </button>

                            <button
                                type="button"
                                id="sairDeTodos"
                                class="acao-perigo">

                                <i class="bi bi-box-arrow-right"></i>
                                Sair de todos, inclusive deste
                            </button>

                        </div>

                    </section>

                </div>
            </div>
        </main>
    </div>
</div>

<!-- MODAL DA FOTO -->
<div class="avatar-modal-overlay" id="avatarModalOverlay">

    <div class="avatar-modal">

        <div class="avatar-modal-header">

            <h3>Alterar foto de perfil</h3>

            <button
                class="avatar-modal-close"
                id="avatarModalClose"
                type="button"
                aria-label="Fechar">

                <i class="bi bi-x-lg"></i>
            </button>
        </div>

        <div class="avatar-modal-body">

            <div class="avatar-preview" id="avatarPreview">

                <video
                    id="avatarVideo"
                    class="hidden"
                    autoplay
                    playsinline
                    muted>
                </video>

                <img
                    id="avatarCapturedImg"
                    class="hidden"
                    alt="Foto capturada">

                <div
                    class="avatar-preview-placeholder"
                    id="avatarPlaceholder">

                    <i class="bi bi-person-circle"></i>
                </div>

            </div>

            <canvas id="avatarCanvas" class="hidden"></canvas>

            <p class="avatar-modal-hint" id="avatarHint">
                Tire uma foto com a câmera do computador ou
                envie uma imagem salva no dispositivo.
            </p>

            <div class="avatar-modal-actions" id="avatarActionsDefault">

                <button
                    class="avatar-action-btn primary"
                    id="startCameraBtn"
                    type="button">

                    <i class="bi bi-camera-video"></i>
                    Usar câmera
                </button>

                <button
                    class="avatar-action-btn"
                    id="uploadFileBtn"
                    type="button">

                    <i class="bi bi-upload"></i>
                    Enviar do computador
                </button>

            </div>

            <div
                class="avatar-modal-actions hidden"
                id="avatarActionsCamera">

                <button
                    class="avatar-action-btn primary"
                    id="captureBtn"
                    type="button">

                    <i class="bi bi-camera"></i>
                    Capturar foto
                </button>

                <button
                    class="avatar-action-btn"
                    id="cancelCameraBtn"
                    type="button">
                    Cancelar
                </button>

            </div>

            <div
                class="avatar-modal-actions hidden"
                id="avatarActionsConfirm">

                <button
                    class="avatar-action-btn primary"
                    id="saveAvatarBtn"
                    type="button">

                    <i class="bi bi-check-circle"></i>
                    Usar esta foto
                </button>

                <button
                    class="avatar-action-btn"
                    id="retakeBtn"
                    type="button">

                    Tentar novamente
                </button>

            </div>

            <input
                type="file"
                id="avatarFileInput"
                accept="image/jpeg,image/png,image/webp"
                hidden>

        </div>
    </div>
</div>

<!-- MODAL DE EDITAR DADOS -->
<div
    class="profile-edit-modal-overlay"
    id="profileEditModalOverlay">

    <div class="profile-edit-modal">

        <div class="avatar-modal-header">

            <h3>Editar perfil</h3>

            <button
                class="avatar-modal-close"
                id="profileEditModalClose"
                type="button"
                aria-label="Fechar">

                <i class="bi bi-x-lg"></i>
            </button>

        </div>

        <div class="profile-edit-modal-body">

            <div class="profile-edit-icon" id="profileEditIcon">

                <img
                    id="profileEditAvatarImg"
                    class="hidden"
                    alt="Foto de perfil">

                <i
                    class="bi bi-person-circle"
                    id="profileEditIconPlaceholder">
                </i>

            </div>

            <form id="profileEditForm" novalidate>

                <div class="profile-edit-field">
                    <label for="editNome">Nome</label>
                    <input
                        type="text"
                        id="editNome"
                        name="nome"
                        required>
                </div>

                <div class="profile-edit-field">
                    <label for="editEmail">E-mail</label>
                    <input
                        type="email"
                        id="editEmail"
                        name="email"
                        readonly>

                    <span
                        class="profile-edit-error hidden"
                        id="editEmailError">
                        E-mail inválido
                    </span>
                </div>

                <div class="profile-edit-field">
                    <label for="editTelefone">Telefone</label>
                    <input
                        type="tel"
                        id="editTelefone"
                        name="telefone"
                        placeholder="(11) 98765-4321">
                </div>

                <div class="profile-edit-field">
                    <label for="editCpf">CPF</label>
                    <input
                        type="text"
                        id="editCpf"
                        name="cpf"
                        placeholder="Não informado"
                        disabled>

                    <span class="profile-edit-lock-hint">
                        <i class="bi bi-lock"></i>
                        CPF não pode ser alterado
                    </span>
                </div>

                <div class="avatar-modal-actions">

                    <button
                        class="avatar-action-btn primary"
                        type="submit">

                        <i class="bi bi-check-circle"></i>
                        Salvar alterações
                    </button>

                    <button
                        class="avatar-action-btn"
                        type="button"
                        id="cancelProfileEditBtn">

                        Cancelar
                    </button>

                </div>

            </form>

        </div>
    </div>
</div>

<!-- MODAL DE SEGURANÇA -->
<div class="accuracy-security-overlay" id="securityOverlay" hidden>

    <section
        class="accuracy-security-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="securityTitle">

        <div class="accuracy-security-header">

            <h2 id="securityTitle">Segurança da conta</h2>

            <button
                type="button"
                id="fecharSeguranca"
                class="accuracy-security-close"
                aria-label="Fechar">

                <i class="bi bi-x-lg"></i>
            </button>
        </div>

        <p
            id="securityDescription"
            class="accuracy-security-desc">
        </p>

        <form id="securityForm" novalidate>

            <div
                class="accuracy-security-input"
                id="securityEmailWrap"
                hidden>

                <label for="securityNewEmail">Novo e-mail</label>

                <input
                    id="securityNewEmail"
                    type="email"
                    autocomplete="email"
                    maxlength="254">
            </div>

            <div
                class="accuracy-security-input"
                id="securityCodeWrap"
                hidden>

                <label
                    for="securityCode"
                    id="securityCodeLabel">
                    Código de confirmação
                </label>

                <input
                    id="securityCode"
                    type="text"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    placeholder="6 dígitos">
            </div>

            <div
                class="accuracy-security-input"
                id="securityPasswordWrap"
                hidden>

                <label for="securityNewPassword">Nova senha</label>

                <input
                    id="securityNewPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    data-password-toggle>

                <label for="securityConfirmPassword">
                    Confirmar nova senha
                </label>

                <input
                    id="securityConfirmPassword"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    data-password-toggle>
            </div>

            <p
                id="securityFeedback"
                class="accuracy-security-feedback"
                role="status"
                aria-live="polite">
            </p>

            <div class="accuracy-security-footer">

                <button
                    type="button"
                    id="securityCancel"
                    class="v2-btn-outline">
                    Cancelar
                </button>

                <button
                    type="submit"
                    id="securitySubmit"
                    class="v2-btn">
                    Continuar
                </button>

            </div>

        </form>

    </section>
</div>


<!-- CONFIRMAÇÃO (aparelhos conectados) -->
<div class="accuracy-security-overlay" id="confirmOverlay" hidden>

    <section
        class="accuracy-security-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmTitulo"
        aria-describedby="confirmTexto">

        <div class="accuracy-security-header">
            <h2 id="confirmTitulo"></h2>
        </div>

        <p id="confirmTexto" class="accuracy-security-desc"></p>

        <div class="accuracy-security-footer">

            <button
                type="button"
                id="confirmCancelar"
                class="v2-btn-outline">
                Cancelar
            </button>

            <button
                type="button"
                id="confirmOk"
                class="v2-btn acao-perigo-cheia">
            </button>

        </div>

    </section>
</div>

<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/password-toggle.js?v=1"></script>
<script src="js/perfil.js?v=10"></script>
<script src="js/aparelhos.js?v=1"></script>
</body>
</html>
