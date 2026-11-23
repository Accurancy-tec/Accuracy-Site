
/* =========================================
   PERFIL - ACCURACY
   Dados, foto e segurança da conta
========================================= */

const PERFIL_API_URL = "https://accuracyappapi.onrender.com";

const PROFILE_KEY = "accuracy_profile_data";
const AVATAR_KEY = "accuracy_avatar";

const $ = id => document.getElementById(id);

const cameraBtn = $("cameraBtn");
const overlay = $("avatarModalOverlay");
const modalClose = $("avatarModalClose");
const video = $("avatarVideo");
const canvas = $("avatarCanvas");
const capturedImg = $("avatarCapturedImg");
const placeholder = $("avatarPlaceholder");
const hint = $("avatarHint");

const actionsDefault = $("avatarActionsDefault");
const actionsCamera = $("avatarActionsCamera");
const actionsConfirm = $("avatarActionsConfirm");

const startCameraBtn = $("startCameraBtn");
const captureBtn = $("captureBtn");
const cancelCameraBtn = $("cancelCameraBtn");
const uploadFileBtn = $("uploadFileBtn");
const fileInput = $("avatarFileInput");
const saveAvatarBtn = $("saveAvatarBtn");
const retakeBtn = $("retakeBtn");

const navAvatar = $("navAvatar");
const bigAvatar = $("bigAvatar");

const editBtn = document.querySelector(".edit-btn");
const profileEditOverlay = $("profileEditModalOverlay");
const profileEditClose = $("profileEditModalClose");
const cancelProfileEditBtn = $("cancelProfileEditBtn");
const profileEditForm = $("profileEditForm");

const editNome = $("editNome");
const editEmail = $("editEmail");
const editTelefone = $("editTelefone");
const editCpf = $("editCpf");
const editEmailError = $("editEmailError");

const profileEditAvatarImg = $("profileEditAvatarImg");
const profileEditIconPlaceholder = $("profileEditIconPlaceholder");

const navUserName = document.querySelector(".user-info strong");
const profileCardName = document.querySelector(".profile-card h2");
const profileCardEmail = document.querySelector(".profile-email");

let stream = null;
let pendingDataUrl = null;

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function lerJSON(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave) || "{}");
    } catch (erro) {
        console.warn("Dados locais inválidos:", chave);
        return {};
    }
}

function getToken() {
    return localStorage.getItem("token");
}

async function requisicaoPerfil(rota, corpo = null, formData = false) {
    const token = getToken();

    if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (!formData && corpo !== null) {
        headers["Content-Type"] = "application/json";
    }

    const resposta = await fetch(
        `${PERFIL_API_URL}/auth/${rota}`,
        {
            method: "POST",
            headers,
            ...(corpo !== null ? {
                body: formData ? corpo : JSON.stringify(corpo)
            } : {})
        }
    );

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || dados.success !== true) {
        throw new Error(
            dados.message || `Falha na requisição (${resposta.status}).`
        );
    }

    return dados;
}

function formatarCpf(valor) {
    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length === 11) {
        return digitos.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    }

    return String(valor || "");
}

function formatarTelefone(valor) {
    const digitos = String(valor || "").replace(/\D/g, "");

    if (digitos.length === 11) {
        return digitos.replace(
            /(\d{2})(\d{5})(\d{4})/,
            "($1) $2-$3"
        );
    }

    if (digitos.length === 10) {
        return digitos.replace(
            /(\d{2})(\d{4})(\d{4})/,
            "($1) $2-$3"
        );
    }

    return String(valor || "");
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(value || "").trim()
    );
}

/* =========================================
   DADOS DO USUÁRIO
========================================= */

function getDefaultProfile() {
    const usuario = lerJSON("usuario");
    const global = window.usuarioLogado || {};

    return {
        nome: usuario.nome_usuario || usuario.nome ||
              global.nome || "",
        email: usuario.email_usuario || usuario.email ||
               global.email || "",
        telefone: formatarTelefone(
            usuario.telefone_usuario || usuario.telefone || ""
        ),
        cpf: formatarCpf(
            usuario.cpf_usuario || usuario.cpf || ""
        )
    };
}

function loadProfile() {
    const base = getDefaultProfile();
    const salvo = lerJSON(PROFILE_KEY);

    return {
        nome: base.nome || salvo.nome || "",
        email: base.email || salvo.email || "",
        telefone: salvo.telefone || base.telefone || "",
        cpf: salvo.cpf || base.cpf || ""
    };
}

function applyProfile(data) {
    if (navUserName) {
        navUserName.textContent = data.nome || "Usuário";
    }

    if (profileCardName) {
        profileCardName.textContent = data.nome || "Usuário";
    }

    if (profileCardEmail) {
        profileCardEmail.textContent = data.email || "—";
    }

    document.querySelectorAll(
        ".info-row .info-content"
    ).forEach(content => {
        const label = content.querySelector("span");
        const value = content.querySelector("p");

        if (!label || !value) return;

        const campo = label.textContent.trim();

        const mapa = {
            "Nome": data.nome,
            "E-mail": data.email,
            "Telefone": data.telefone,
            "CPF": data.cpf
        };

        if (Object.prototype.hasOwnProperty.call(mapa, campo)) {
            value.textContent = mapa[campo] || "—";
        }
    });

    const primeiraLetra = (data.nome || "U")
        .trim()
        .charAt(0)
        .toUpperCase();

    [navAvatar, bigAvatar].forEach(elemento => {
        if (!elemento) return;

        if (!elemento.style.backgroundImage) {
            elemento.textContent = primeiraLetra;
        }
    });
}

/* =========================================
   FOTO DO USUÁRIO
========================================= */

function applyAvatar(url) {
    const primeiraLetra = (
        loadProfile().nome || "U"
    ).trim().charAt(0).toUpperCase();

    [navAvatar, bigAvatar].forEach(elemento => {
        if (!elemento) return;

        if (url) {
            elemento.style.backgroundImage = `url("${url}")`;
            elemento.style.backgroundSize = "cover";
            elemento.style.backgroundPosition = "center";
            elemento.textContent = "";
        } else {
            elemento.style.removeProperty("background-image");
            elemento.style.removeProperty("background-size");
            elemento.style.removeProperty("background-position");
            elemento.textContent = primeiraLetra;
        }
    });
}

/* =========================================
   CARREGAR PERFIL DA API
========================================= */

async function carregarPerfilDaApi() {
    if (!getToken()) {
        console.warn("Token não encontrado.");
        return;
    }

    try {
        const dados = await requisicaoPerfil("perfilObter");
        const usuario = dados.user;

        if (!usuario) {
            throw new Error("A API não retornou os dados do usuário.");
        }

        const anterior = loadProfile();

        const perfil = {
            nome: usuario.nome_usuario || anterior.nome || "",
            email: usuario.email_usuario || anterior.email || "",
            telefone: formatarTelefone(
                usuario.telefone_usuario || anterior.telefone
            ),
            cpf: formatarCpf(
                usuario.cpf_usuario || anterior.cpf
            )
        };

        const usuarioAnterior = lerJSON("usuario");

        localStorage.setItem(
            "usuario",
            JSON.stringify({
                ...usuarioAnterior,
                ...usuario
            })
        );

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(perfil)
        );

        applyProfile(perfil);

        const fotoUrl = usuario.foto_usuario || null;

        if (fotoUrl) {
            localStorage.setItem(AVATAR_KEY, fotoUrl);
        } else {
            localStorage.removeItem(AVATAR_KEY);
        }

        applyAvatar(fotoUrl);

        console.log("Perfil atualizado com sucesso.");

    } catch (erro) {
        console.error("Erro ao carregar perfil:", erro);
    }
}

/* =========================================
   ABRIR E FECHAR MODAL DE FOTO
========================================= */

function resetModalView() {
    pendingDataUrl = null;

    video.classList.add("hidden");
    capturedImg.classList.add("hidden");
    placeholder.classList.remove("hidden");

    actionsDefault.classList.remove("hidden");
    actionsCamera.classList.add("hidden");
    actionsConfirm.classList.add("hidden");

    hint.textContent =
        "Tire uma foto com a câmera do computador ou envie uma imagem salva.";

    fileInput.value = "";
}

function openModal() {
    resetModalView();
    overlay.classList.add("show");
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.srcObject = null;
}

function closeModal() {
    overlay.classList.remove("show");
    stopCamera();
    resetModalView();
}

cameraBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);

overlay.addEventListener("click", event => {
    if (event.target === overlay) {
        closeModal();
    }
});

/* =========================================
   UTILIZAR A CÂMERA
========================================= */

async function startCamera() {
    try {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Câmera não disponível.");
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

        placeholder.classList.add("hidden");
        capturedImg.classList.add("hidden");
        video.classList.remove("hidden");

        actionsDefault.classList.add("hidden");
        actionsCamera.classList.remove("hidden");

        hint.textContent =
            "Posicione o rosto e clique em Capturar foto.";

        await video.play();

    } catch (erro) {
        hint.textContent =
            "Não foi possível acessar a câmera. Verifique as permissões.";
    }
}

startCameraBtn.addEventListener("click", startCamera);

cancelCameraBtn.addEventListener("click", () => {
    stopCamera();
    resetModalView();
});

captureBtn.addEventListener("click", () => {
    if (!video.videoWidth || !video.videoHeight) {
        hint.textContent = "Aguarde a câmera carregar.";
        return;
    }

    const tamanho = Math.min(
        video.videoWidth,
        video.videoHeight
    );

    const contexto = canvas.getContext("2d");

    canvas.width = tamanho;
    canvas.height = tamanho;

    const offsetX = (video.videoWidth - tamanho) / 2;
    const offsetY = (video.videoHeight - tamanho) / 2;

    contexto.drawImage(
        video,
        offsetX,
        offsetY,
        tamanho,
        tamanho,
        0,
        0,
        tamanho,
        tamanho
    );

    pendingDataUrl = canvas.toDataURL("image/png");

    stopCamera();

    video.classList.add("hidden");
    capturedImg.src = pendingDataUrl;
    capturedImg.classList.remove("hidden");

    actionsCamera.classList.add("hidden");
    actionsConfirm.classList.remove("hidden");

    hint.textContent = "Gostou do resultado?";
});

/* =========================================
   ENVIAR FOTO DO COMPUTADOR
========================================= */

uploadFileBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];

    if (!file) return;

    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!tiposPermitidos.includes(file.type)) {
        hint.textContent =
            "Escolha uma imagem JPG, PNG ou WEBP.";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        hint.textContent =
            "A imagem deve ter no máximo 2 MB.";
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        pendingDataUrl = reader.result;

        placeholder.classList.add("hidden");
        video.classList.add("hidden");

        capturedImg.src = pendingDataUrl;
        capturedImg.classList.remove("hidden");

        actionsDefault.classList.add("hidden");
        actionsConfirm.classList.remove("hidden");

        hint.textContent = "Gostou do resultado?";
    };

    reader.onerror = () => {
        hint.textContent = "Erro ao carregar a imagem.";
    };

    reader.readAsDataURL(file);
    fileInput.value = "";
});

retakeBtn.addEventListener("click", resetModalView);

/* =========================================
   SALVAR FOTO NO BANCO PELA API
========================================= */

saveAvatarBtn.addEventListener("click", async () => {
    if (!pendingDataUrl) return;

    if (!getToken()) {
        hint.textContent =
            "Sessão expirada. Faça login novamente.";
        return;
    }

    const textoOriginal = saveAvatarBtn.innerHTML;

    saveAvatarBtn.disabled = true;
    saveAvatarBtn.textContent = "Salvando...";

    try {
        const respostaImagem = await fetch(pendingDataUrl);
        const imagem = await respostaImagem.blob();

        if (imagem.size > 2 * 1024 * 1024) {
            throw new Error(
                "A foto deve ter no máximo 2 MB."
            );
        }

        const tipos = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        };

        if (!tipos[imagem.type]) {
            throw new Error(
                "Use uma foto JPG, PNG ou WEBP."
            );
        }

        const form = new FormData();

        form.append(
            "foto",
            imagem,
            `perfil.${tipos[imagem.type]}`
        );

        const dados = await requisicaoPerfil(
            "perfilFoto",
            form,
            true
        );

        if (!dados.foto_usuario) {
            throw new Error(
                "A API não retornou a URL da foto."
            );
        }

        const fotoUrl = dados.foto_usuario;

        localStorage.setItem(AVATAR_KEY, fotoUrl);

        applyAvatar(fotoUrl);

        window.dispatchEvent(
            new CustomEvent("accuracy:avatar-atualizado", {
                detail: {
                    url: fotoUrl
                }
            })
        );

        closeModal();

    } catch (erro) {
        console.error("Erro ao salvar foto:", erro);

        hint.textContent =
            erro.message || "Erro ao enviar a imagem.";

    } finally {
        saveAvatarBtn.disabled = false;
        saveAvatarBtn.innerHTML = textoOriginal;
    }
});

/* =========================================
   MODAL DE EDITAR PERFIL
========================================= */

function clearEmailError() {
    editEmail.classList.remove("input-error");
    editEmailError.classList.add("hidden");
}

function showEmailError() {
    editEmail.classList.add("input-error");
    editEmailError.classList.remove("hidden");
}

editEmail.addEventListener("input", clearEmailError);

function openProfileEditModal() {
    const perfil = loadProfile();

    editNome.value = perfil.nome;
    editEmail.value = perfil.email;
    editTelefone.value = perfil.telefone;
    editCpf.value = perfil.cpf;

    clearEmailError();

    const foto = localStorage.getItem(AVATAR_KEY);

    if (foto) {
        profileEditAvatarImg.src = foto;
        profileEditAvatarImg.classList.remove("hidden");

        profileEditIconPlaceholder.classList.add("hidden");
    } else {
        profileEditAvatarImg.classList.add("hidden");

        profileEditIconPlaceholder.classList.remove("hidden");
    }

    profileEditOverlay.classList.add("show");
}

function closeProfileEditModal() {
    profileEditOverlay.classList.remove("show");
}

editBtn.addEventListener("click", openProfileEditModal);

profileEditClose.addEventListener(
    "click",
    closeProfileEditModal
);

cancelProfileEditBtn.addEventListener(
    "click",
    closeProfileEditModal
);

profileEditOverlay.addEventListener("click", event => {
    if (event.target === profileEditOverlay) {
        closeProfileEditModal();
    }
});

/* =========================================
   SALVAR NOME E TELEFONE
========================================= */

profileEditForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nome = editNome.value.trim();
    const telefone = editTelefone.value.trim();

    if (!nome) {
        editNome.focus();
        return;
    }

    const botao = profileEditForm.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;

    try {
        const dados = await requisicaoPerfil(
            "atualizar-perfil",
            {
                nome,
                telefone
            }
        );

        const anterior = loadProfile();

        const atualizado = {
            nome: dados.perfil?.nome || nome,
            email: anterior.email,
            telefone: formatarTelefone(
                dados.perfil?.telefone ?? telefone
            ),
            cpf: anterior.cpf
        };

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(atualizado)
        );

        const usuario = lerJSON("usuario");
        usuario.nome_usuario = atualizado.nome;
        usuario.telefone_usuario = atualizado.telefone;

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

        applyProfile(atualizado);

        closeProfileEditModal();

    } catch (erro) {
        console.error("Erro ao salvar dados:", erro);
        window.alert(erro.message);
    } finally {
        botao.disabled = false;
    }
});

// E-mail só pode ser alterado pelo fluxo com confirmação.
editEmail.readOnly = true;
editEmail.title =
    "Para trocar o e-mail, utilize Segurança da conta.";

/* =========================================
   SEGURANÇA DA CONTA
========================================= */

const securityOverlay = $("securityOverlay");
const securityForm = $("securityForm");
const securityFeedback = $("securityFeedback");
const securitySubmit = $("securitySubmit");
const securityStatus = $("securityStatus");

const securityNewEmail = $("securityNewEmail");
const securityCode = $("securityCode");
const securityNewPassword = $("securityNewPassword");
const securityConfirmPassword = $("securityConfirmPassword");

let securityFlow = null;
let securityStage = null;
let securityBusy = false;
let securityPreviousFocus = null;

function securityNotice(mensagem, erro = false) {
    securityFeedback.textContent = mensagem || "";
    securityFeedback.classList.toggle("is-error", erro);
}

function atualizarInterfaceSeguranca() {
    const solicitarEmail =
        securityFlow === "email" && securityStage === "request";

    const mostrarCodigo = securityStage !== "request";

    const mostrarSenha =
        securityFlow === "password" &&
        securityStage === "confirm";

    $("securityEmailWrap").hidden = !solicitarEmail;
    $("securityCodeWrap").hidden = !mostrarCodigo;
    $("securityPasswordWrap").hidden = !mostrarSenha;

    $("securityTitle").textContent =
        securityFlow === "email"
            ? "Alterar e-mail"
            : "Alterar senha";

    const descricoes = {
        "email:request":
            "Informe o novo e-mail. Enviaremos um código ao endereço atual.",

        "email:authorize":
            "Digite o código recebido no e-mail atual.",

        "email:confirm":
            "Digite o código recebido no novo e-mail.",

        "password:request":
            "Enviaremos um código ao seu e-mail atual.",

        "password:confirm":
            "Digite o código e cadastre sua nova senha."
    };

    $("securityDescription").textContent =
        descricoes[`${securityFlow}:${securityStage}`] || "";

    $("securityCodeLabel").textContent =
        securityFlow === "email" &&
        securityStage === "confirm"
            ? "Código enviado ao novo e-mail"
            : "Código enviado ao e-mail atual";

    securitySubmit.textContent =
        securityStage === "request"
            ? "Enviar código"
            : securityStage === "authorize"
                ? "Autorizar alteração"
                : "Confirmar alteração";

    securityCode.value = "";
    securityNewPassword.value = "";
    securityConfirmPassword.value = "";

    securityNotice("");
}

function abrirSeguranca(tipo) {
    securityPreviousFocus = document.activeElement;

    securityFlow = tipo;
    securityStage = "request";

    securityForm.reset();
    atualizarInterfaceSeguranca();

    securityOverlay.hidden = false;

    if (tipo === "email") {
        securityNewEmail.focus();
    } else {
        securitySubmit.focus();
    }
}

function fecharSeguranca() {
    if (securityBusy) return;

    securityOverlay.hidden = true;

    securityForm.reset();
    securityNotice("");

    securityFlow = null;
    securityStage = null;

    securityPreviousFocus?.focus();
}

/* =========================================
   CONFIRMAR ALTERAÇÃO DE E-MAIL OU SENHA
========================================= */

securityForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (securityBusy || !securityFlow) return;

    let endpoint = "";
    let payload = {};

    if (securityFlow === "email") {
        if (securityStage === "request") {
            const novoEmail = securityNewEmail.value
                .trim()
                .toLowerCase();

            if (!isValidEmail(novoEmail)) {
                securityNotice("Informe um e-mail válido.", true);
                return;
            }

            endpoint = "perfilSolicitarTrocaEmail";
            payload = {
                novo_email: novoEmail
            };
        } else {
            const codigo = securityCode.value.trim();

            if (!/^\d{6}$/.test(codigo)) {
                securityNotice(
                    "Informe o código de 6 dígitos.",
                    true
                );
                return;
            }

            endpoint =
                securityStage === "authorize"
                    ? "perfilAutorizarTrocaEmail"
                    : "perfilConfirmarTrocaEmail";

            payload = {
                codigo
            };
        }
    } else {
        if (securityStage === "request") {
            endpoint = "perfilSolicitarTrocaSenha";
        } else {
            const codigo = securityCode.value.trim();
            const senha = securityNewPassword.value;

            if (!/^\d{6}$/.test(codigo)) {
                securityNotice(
                    "Informe o código de 6 dígitos.",
                    true
                );
                return;
            }

            if (senha.length < 8) {
                securityNotice(
                    "A nova senha deve ter pelo menos 8 caracteres.",
                    true
                );
                return;
            }

            if (senha !== securityConfirmPassword.value) {
                securityNotice(
                    "As senhas não coincidem.",
                    true
                );
                return;
            }

            endpoint = "perfilConfirmarTrocaSenha";
            payload = {
                codigo,
                nova_senha: senha
            };
        }
    }

    securityBusy = true;
    securitySubmit.disabled = true;

    securityNotice("Enviando solicitação...");

    try {
        const resultado = await requisicaoPerfil(
            endpoint,
            payload
        );

        if (
            securityFlow === "email" &&
            securityStage === "request"
        ) {
            securityStage = "authorize";
            atualizarInterfaceSeguranca();

            securityNotice(resultado.message);
            securityCode.focus();

        } else if (
            securityFlow === "email" &&
            securityStage === "authorize"
        ) {
            securityStage = "confirm";
            atualizarInterfaceSeguranca();

            securityNotice(resultado.message);
            securityCode.focus();

        } else if (
            securityFlow === "password" &&
            securityStage === "request"
        ) {
            securityStage = "confirm";
            atualizarInterfaceSeguranca();

            securityNotice(resultado.message);
            securityCode.focus();

        } else {
            // Alteração concluída.
            if (securityFlow === "email") {
                const perfil = lerJSON(PROFILE_KEY);

                perfil.email =
                    resultado.email_usuario ||
                    securityNewEmail.value.trim().toLowerCase();

                localStorage.setItem(
                    PROFILE_KEY,
                    JSON.stringify(perfil)
                );

                const usuario = lerJSON("usuario");
                usuario.email_usuario = perfil.email;

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(usuario)
                );

                if (window.usuarioLogado) {
                    window.usuarioLogado.email = perfil.email;
                }

                applyProfile({
                    ...loadProfile(),
                    email: perfil.email
                });

                editEmail.value = perfil.email;

            } else {
                // O backend revoga os tokens de renovação.
                localStorage.removeItem("refreshToken");
            }

            securityOverlay.hidden = true;
            securityForm.reset();

            securityFlow = null;
            securityStage = null;

            securityStatus.textContent =
                resultado.message ||
                "Alteração realizada com sucesso.";

            securityPreviousFocus?.focus();
        }

    } catch (erro) {
        console.error("Erro na segurança da conta:", erro);

        securityNotice(
            erro.message || "Não foi possível concluir.",
            true
        );

    } finally {
        securityBusy = false;
        securitySubmit.disabled = false;
    }
});

$("abrirTrocaEmail").addEventListener("click", () => {
    abrirSeguranca("email");
});

$("abrirTrocaSenha").addEventListener("click", () => {
    abrirSeguranca("password");
});

$("fecharSeguranca").addEventListener(
    "click",
    fecharSeguranca
);

$("securityCancel").addEventListener(
    "click",
    fecharSeguranca
);

securityOverlay.addEventListener("click", event => {
    if (event.target === securityOverlay) {
        fecharSeguranca();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        if (!securityOverlay.hidden) {
            fecharSeguranca();
        }

        if (overlay.classList.contains("show")) {
            closeModal();
        }

        if (profileEditOverlay.classList.contains("show")) {
            closeProfileEditModal();
        }
    }
});

/* =========================================
   INICIAR PERFIL
========================================= */

applyProfile(loadProfile());

carregarPerfilDaApi();
