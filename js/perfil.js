/* =========================
   TROCA DE FOTO DE PERFIL
   (webcam ou upload,
   salva no localStorage)
========================= */

const AVATAR_KEY = "accuracy_avatar";

const cameraBtn = document.getElementById("cameraBtn");

const overlay = document.getElementById("avatarModalOverlay");
const modalClose = document.getElementById("avatarModalClose");

const video = document.getElementById("avatarVideo");
const canvas = document.getElementById("avatarCanvas");
const capturedImg = document.getElementById("avatarCapturedImg");
const placeholder = document.getElementById("avatarPlaceholder");
const hint = document.getElementById("avatarHint");

const actionsDefault = document.getElementById("avatarActionsDefault");
const actionsCamera = document.getElementById("avatarActionsCamera");
const actionsConfirm = document.getElementById("avatarActionsConfirm");

const startCameraBtn = document.getElementById("startCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const cancelCameraBtn = document.getElementById("cancelCameraBtn");

const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileInput = document.getElementById("avatarFileInput");

const saveAvatarBtn = document.getElementById("saveAvatarBtn");
const retakeBtn = document.getElementById("retakeBtn");

const navAvatar = document.getElementById("navAvatar");
const bigAvatar = document.getElementById("bigAvatar");

let stream = null;
let pendingDataUrl = null;


/* =========================
   APLICAR FOTO SALVA
========================= */

function applyAvatar(dataUrl) {

    [navAvatar, bigAvatar].forEach(el => {

        if (!el) {
            return;
        }

        el.style.backgroundImage = `url(${dataUrl})`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.textContent = "";

    });

}


const savedAvatar = localStorage.getItem(AVATAR_KEY);

if (savedAvatar) {

    applyAvatar(savedAvatar);

}


/* =========================
   ABRIR / FECHAR MODAL
========================= */

function openModal() {

    overlay.classList.add("show");

    resetModalView();

}


function closeModal() {

    overlay.classList.remove("show");

    stopCamera();

    resetModalView();

}


function resetModalView() {

    pendingDataUrl = null;

    video.classList.add("hidden");
    capturedImg.classList.add("hidden");
    placeholder.classList.remove("hidden");

    actionsDefault.classList.remove("hidden");
    actionsCamera.classList.add("hidden");
    actionsConfirm.classList.add("hidden");

    hint.textContent =
        "Tire uma foto com a câmera do seu computador ou envie uma imagem salva no dispositivo.";

}


cameraBtn.addEventListener("click", openModal);

modalClose.addEventListener("click", closeModal);


overlay.addEventListener("click", event => {

    if (event.target === overlay) {

        closeModal();

    }

});


/* =========================
   LIGAR A CÂMERA
========================= */

async function startCamera() {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        video.srcObject = stream;

        placeholder.classList.add("hidden");
        capturedImg.classList.add("hidden");
        video.classList.remove("hidden");

        actionsDefault.classList.add("hidden");
        actionsCamera.classList.remove("hidden");

        hint.textContent =
            "Posicione o rosto no quadro e clique em capturar.";

    } catch (error) {

        hint.textContent =
            "Não foi possível acessar a câmera. Verifique as permissões do navegador ou envie uma foto do computador.";

    }

}


function stopCamera() {

    if (stream) {

        stream.getTracks().forEach(track => track.stop());

        stream = null;

    }

}


startCameraBtn.addEventListener("click", startCamera);


cancelCameraBtn.addEventListener("click", () => {

    stopCamera();

    resetModalView();

});


/* =========================
   CAPTURAR FOTO
========================= */

captureBtn.addEventListener("click", () => {

    const size = Math.min(video.videoWidth, video.videoHeight);

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    context.drawImage(
        video,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        size,
        size
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


/* =========================
   ENVIAR DO COMPUTADOR
========================= */

uploadFileBtn.addEventListener("click", () => {

    fileInput.click();

});


fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        hint.textContent = "Escolha um arquivo de imagem válido.";

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

    reader.readAsDataURL(file);

    fileInput.value = "";

});


/* =========================
   TENTAR NOVAMENTE
========================= */

retakeBtn.addEventListener("click", () => {

    pendingDataUrl = null;

    capturedImg.classList.add("hidden");

    resetModalView();

});


/* =========================
   SALVAR FOTO
========================= */

saveAvatarBtn.addEventListener("click", () => {

    if (!pendingDataUrl) {
        return;
    }

    localStorage.setItem(AVATAR_KEY, pendingDataUrl);

    applyAvatar(pendingDataUrl);

    closeModal();

});


/* =========================
   EDITAR PERFIL
========================= */

const PROFILE_KEY = "accuracy_profile_data";

const editBtn = document.querySelector(".edit-btn");

const profileEditOverlay = document.getElementById("profileEditModalOverlay");
const profileEditClose = document.getElementById("profileEditModalClose");
const cancelProfileEditBtn = document.getElementById("cancelProfileEditBtn");
const profileEditForm = document.getElementById("profileEditForm");

const editNome = document.getElementById("editNome");
const editEmail = document.getElementById("editEmail");
const editTelefone = document.getElementById("editTelefone");
const editCpf = document.getElementById("editCpf");
const editEmailError = document.getElementById("editEmailError");

const profileEditAvatarImg = document.getElementById("profileEditAvatarImg");
const profileEditIconPlaceholder = document.getElementById("profileEditIconPlaceholder");

const navUserName = document.querySelector(".user-info strong");
const profileCardName = document.querySelector(".profile-card h2");
const profileCardEmail = document.querySelector(".profile-email");


/* =========================
   DADOS PADRÃO / SALVOS
========================= */

function getDefaultProfile() {

    const u = window.usuarioLogado || {};

    return {
        nome: u.nome || "",
        email: u.email || "",
        telefone: "",
        cpf: ""
    };

}


function loadProfile() {

    const saved = localStorage.getItem(PROFILE_KEY);

    if (saved) {

        try {
            return JSON.parse(saved);
        } catch (error) {
            return getDefaultProfile();
        }

    }

    return getDefaultProfile();

}


function applyProfile(data) {

    if (navUserName) navUserName.textContent = data.nome;
    if (profileCardName) profileCardName.textContent = data.nome;
    if (profileCardEmail) profileCardEmail.textContent = data.email;

    document.querySelectorAll(".info-row .info-content").forEach(content => {

        const label = content.querySelector("span");
        const value = content.querySelector("p");

        if (!label || !value) return;

        if (label.textContent.trim() === "Nome") value.textContent = data.nome;
        if (label.textContent.trim() === "E-mail") value.textContent = data.email;
        if (label.textContent.trim() === "Telefone") value.textContent = data.telefone;
        if (label.textContent.trim() === "CPF") value.textContent = data.cpf;

    });

}


applyProfile(loadProfile());


/* =========================
   VALIDAÇÃO DE E-MAIL
========================= */

function isValidEmail(value) {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(value.trim());

}


function clearEmailError() {

    editEmail.classList.remove("input-error");
    editEmailError.classList.add("hidden");

}


function showEmailError() {

    editEmail.classList.add("input-error");
    editEmailError.classList.remove("hidden");

}


editEmail.addEventListener("input", clearEmailError);


/* =========================
   ABRIR / FECHAR MODAL
   DE EDITAR PERFIL
========================= */

function openProfileEditModal() {

    const data = loadProfile();

    editNome.value = data.nome;
    editEmail.value = data.email;
    editTelefone.value = data.telefone;
    editCpf.value = data.cpf;

    clearEmailError();

    const savedAvatarPhoto = localStorage.getItem(AVATAR_KEY);

    if (savedAvatarPhoto) {

        profileEditAvatarImg.src = savedAvatarPhoto;
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


if (editBtn) {
    editBtn.addEventListener("click", openProfileEditModal);
}

profileEditClose.addEventListener("click", closeProfileEditModal);
cancelProfileEditBtn.addEventListener("click", closeProfileEditModal);

profileEditOverlay.addEventListener("click", event => {

    if (event.target === profileEditOverlay) {
        closeProfileEditModal();
    }

});


/* =========================
   SALVAR ALTERAÇÕES
========================= */

profileEditForm.addEventListener("submit", event => {

    event.preventDefault();

    if (!isValidEmail(editEmail.value)) {

        showEmailError();

        editEmail.focus();

        return;

    }

    clearEmailError();

    const updated = {
        nome: editNome.value.trim(),
        email: editEmail.value.trim(),
        telefone: editTelefone.value.trim(),
        cpf: editCpf.value
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));

    applyProfile(updated);

    closeProfileEditModal();

});


/* ==========================================================
   INTEGRAÇÃO COM A API (foto, senha e e-mail)
   Código acrescentado: nada acima foi alterado.
========================================================== */

const PERFIL_API = "http://localhost:8080/auth/";


/* ---------- chamada genérica à API ---------- */

async function perfilApi(rota, corpo, formData) {

    const token = localStorage.getItem("token");

    const opcoes = {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
    };

    if (formData) {
        opcoes.body = formData;
    } else {
        opcoes.headers["Content-Type"] = "application/json";
        opcoes.body = JSON.stringify(corpo || {});
    }

    try {

        const resposta = await fetch(PERFIL_API + rota, opcoes);

        let dados = {};

        try {
            dados = await resposta.json();
        } catch (erro) { }

        if (resposta.status === 401) {

            return {
                ok: false,
                sessaoExpirada: true,
                message: "Sua sessão expirou. Entre novamente."
            };

        }

        return { ok: resposta.ok && dados.success === true, ...dados };

    } catch (erro) {

        return {
            ok: false,
            message: "Erro de conexão com o servidor. Tente de novo."
        };

    }

}


function perfilSairPorSessao() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("accuracy_profile_data");

    window.location.href = "login.php";

}


function perfilMensagem(elemento, texto, erro) {

    elemento.textContent = texto || "";
    elemento.style.color = erro ? "#e5484d" : "#16a34a";

}


function perfilSomenteNumeros(input) {

    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 6);
    });

}


/* ==========================================================
   FOTO DE PERFIL -> envia para a API e guarda só a URL
========================================================== */

function perfilReduzirImagem(dataUrl, tamanhoMaximo) {

    return new Promise((resolve, reject) => {

        const imagem = new Image();

        imagem.onload = () => {

            const escala = Math.min(1, tamanhoMaximo / Math.max(imagem.width, imagem.height));

            const c = document.createElement("canvas");
            c.width = Math.round(imagem.width * escala);
            c.height = Math.round(imagem.height * escala);

            c.getContext("2d").drawImage(imagem, 0, 0, c.width, c.height);

            c.toBlob(blob => blob ? resolve(blob) : reject(), "image/jpeg", 0.9);

        };

        imagem.onerror = reject;

        imagem.src = dataUrl;

    });

}


/* Captura (fase de captura) para rodar ANTES do salvar antigo (localStorage) */

saveAvatarBtn.addEventListener("click", async event => {

    event.stopImmediatePropagation();

    if (!pendingDataUrl) {
        return;
    }

    saveAvatarBtn.disabled = true;
    hint.textContent = "Enviando foto...";

    let blob;

    try {
        blob = await perfilReduzirImagem(pendingDataUrl, 512);
    } catch (erro) {
        saveAvatarBtn.disabled = false;
        hint.textContent = "Não foi possível processar essa imagem.";
        return;
    }

    const form = new FormData();
    form.append("foto", blob, "foto.jpg");

    const resultado = await perfilApi("perfilFoto", null, form);

    saveAvatarBtn.disabled = false;

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (!resultado.ok) {
        hint.textContent = resultado.message || "Não foi possível salvar a foto.";
        return;
    }

    /* o localStorage passa a guardar só a URL (as outras páginas já leem dele) */
    localStorage.setItem(AVATAR_KEY, resultado.foto_usuario);

    applyAvatar(resultado.foto_usuario);

    closeModal();

}, true);


/* Ao abrir o perfil, busca a foto salva no banco */

(async () => {

    const resultado = await perfilApi("perfilObter");

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (resultado.ok && resultado.user && resultado.user.foto_usuario) {

        localStorage.setItem(AVATAR_KEY, resultado.user.foto_usuario);

        applyAvatar(resultado.user.foto_usuario);

    }

})();


/* ==========================================================
   ALTERAR SENHA
========================================================== */

const snOverlay = document.getElementById("senhaModalOverlay");
const snHint = document.getElementById("senhaHint");
const snMsg = document.getElementById("senhaMsg");
const snPasso1 = document.getElementById("senhaPasso1");
const snPasso2 = document.getElementById("senhaPasso2");
const snCodigo = document.getElementById("senhaCodigo");
const snNova = document.getElementById("senhaNova");
const snConfirma = document.getElementById("senhaConfirma");
const snEnviarBtn = document.getElementById("senhaEnviarBtn");
const snConfirmarBtn = document.getElementById("senhaConfirmarBtn");
const snReenviarBtn = document.getElementById("senhaReenviarBtn");

perfilSomenteNumeros(snCodigo);


function snAbrir() {

    snPasso1.classList.remove("hidden");
    snPasso2.classList.add("hidden");

    snCodigo.value = "";
    snNova.value = "";
    snConfirma.value = "";

    perfilMensagem(snMsg, "", false);

    snOverlay.classList.add("show");

}


function snFechar() {
    snOverlay.classList.remove("show");
}


async function snEnviarCodigo() {

    snEnviarBtn.disabled = true;
    snReenviarBtn.disabled = true;

    perfilMensagem(snMsg, "Enviando código...", false);

    const resultado = await perfilApi("perfilSolicitarTrocaSenha");

    snEnviarBtn.disabled = false;
    snReenviarBtn.disabled = false;

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (!resultado.ok) {
        perfilMensagem(snMsg, resultado.message || "Não foi possível enviar o código.", true);
        return;
    }

    snPasso1.classList.add("hidden");
    snPasso2.classList.remove("hidden");

    snHint.textContent = "Digite o código que enviamos para o seu e-mail e escolha a nova senha.";

    perfilMensagem(snMsg, "Código enviado! Veja também a caixa de spam.", false);

    snCodigo.focus();

}


async function snConfirmar() {

    const codigo = snCodigo.value.trim();

    if (!/^\d{6}$/.test(codigo)) {
        perfilMensagem(snMsg, "Digite o código de 6 números.", true);
        return;
    }

    if (snNova.value.length < 8) {
        perfilMensagem(snMsg, "A nova senha precisa ter pelo menos 8 caracteres.", true);
        return;
    }

    if (snNova.value !== snConfirma.value) {
        perfilMensagem(snMsg, "As senhas não são iguais.", true);
        return;
    }

    snConfirmarBtn.disabled = true;

    const resultado = await perfilApi("perfilConfirmarTrocaSenha", {
        codigo: codigo,
        nova_senha: snNova.value
    });

    snConfirmarBtn.disabled = false;

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (!resultado.ok) {
        perfilMensagem(snMsg, resultado.message || "Não foi possível alterar a senha.", true);
        return;
    }

    perfilMensagem(snMsg, "Senha alterada! Entre novamente com a nova senha.", false);

    setTimeout(perfilSairPorSessao, 2000);

}


const snLinhaSenha = document.querySelector(".security-item:not(.logout)");

if (snLinhaSenha) {
    snLinhaSenha.style.cursor = "pointer";
    snLinhaSenha.addEventListener("click", snAbrir);
}

document.getElementById("senhaModalClose").addEventListener("click", snFechar);

snOverlay.addEventListener("click", event => {
    if (event.target === snOverlay) snFechar();
});

snEnviarBtn.addEventListener("click", snEnviarCodigo);
snReenviarBtn.addEventListener("click", snEnviarCodigo);
snConfirmarBtn.addEventListener("click", snConfirmar);


/* ==========================================================
   ALTERAR E-MAIL (3 passos)
   1) novo e-mail -> código vai para o e-mail ATUAL
   2) código do e-mail atual -> autoriza e envia código ao NOVO
   3) código do novo e-mail -> troca
========================================================== */

const emOverlay = document.getElementById("emailModalOverlay");
const emHint = document.getElementById("emailHint");
const emMsg = document.getElementById("emailMsg");
const emPasso1 = document.getElementById("emailPasso1");
const emPasso2 = document.getElementById("emailPasso2");
const emPasso3 = document.getElementById("emailPasso3");
const emNovo = document.getElementById("emailNovo");
const emCodigoAntigo = document.getElementById("emailCodigoAntigo");
const emCodigoNovo = document.getElementById("emailCodigoNovo");
const emSolicitarBtn = document.getElementById("emailSolicitarBtn");
const emAutorizarBtn = document.getElementById("emailAutorizarBtn");
const emConfirmarBtn = document.getElementById("emailConfirmarBtn");

perfilSomenteNumeros(emCodigoAntigo);
perfilSomenteNumeros(emCodigoNovo);


function emMostrarPasso(numero) {

    emPasso1.classList.toggle("hidden", numero !== 1);
    emPasso2.classList.toggle("hidden", numero !== 2);
    emPasso3.classList.toggle("hidden", numero !== 3);

    if (numero === 1) {
        emHint.textContent = "Informe o novo e-mail. Primeiro vamos confirmar que é você, enviando um código para o e-mail atual.";
    }

    if (numero === 2) {
        emHint.textContent = "Enviamos um código para o seu e-mail atual. Digite-o para autorizar a mudança.";
    }

    if (numero === 3) {
        emHint.textContent = "Agora enviamos um código para o novo e-mail. Digite-o para concluir.";
    }

}


function emAbrir(emailSugerido) {

    emNovo.value = emailSugerido || "";
    emCodigoAntigo.value = "";
    emCodigoNovo.value = "";

    perfilMensagem(emMsg, "", false);

    emMostrarPasso(1);

    emOverlay.classList.add("show");

}


function emFechar() {
    emOverlay.classList.remove("show");
}


async function emSolicitar() {

    const novo = emNovo.value.trim().toLowerCase();

    if (!isValidEmail(novo)) {
        perfilMensagem(emMsg, "Digite um e-mail válido.", true);
        return;
    }

    emSolicitarBtn.disabled = true;

    perfilMensagem(emMsg, "Enviando código...", false);

    const resultado = await perfilApi("perfilSolicitarTrocaEmail", { novo_email: novo });

    emSolicitarBtn.disabled = false;

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (!resultado.ok) {
        perfilMensagem(emMsg, resultado.message || "Não foi possível enviar o código.", true);
        return;
    }

    emMostrarPasso(2);

    perfilMensagem(emMsg, "Código enviado! Veja também a caixa de spam.", false);

    emCodigoAntigo.focus();

}


async function emAutorizar() {

    const codigo = emCodigoAntigo.value.trim();

    if (!/^\d{6}$/.test(codigo)) {
        perfilMensagem(emMsg, "Digite o código de 6 números.", true);
        return;
    }

    emAutorizarBtn.disabled = true;

    const resultado = await perfilApi("perfilAutorizarTrocaEmail", { codigo: codigo });

    emAutorizarBtn.disabled = false;

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (!resultado.ok) {
        perfilMensagem(emMsg, resultado.message || "Código inválido.", true);
        return;
    }

    emMostrarPasso(3);

    perfilMensagem(emMsg, "Mudança autorizada! Código enviado ao novo e-mail.", false);

    emCodigoNovo.focus();

}


async function emConfirmar() {

    const codigo = emCodigoNovo.value.trim();

    if (!/^\d{6}$/.test(codigo)) {
        perfilMensagem(emMsg, "Digite o código de 6 números.", true);
        return;
    }

    emConfirmarBtn.disabled = true;

    const resultado = await perfilApi("perfilConfirmarTrocaEmail", { codigo: codigo });

    emConfirmarBtn.disabled = false;

    if (resultado.sessaoExpirada) {
        perfilSairPorSessao();
        return;
    }

    if (!resultado.ok) {
        perfilMensagem(emMsg, resultado.message || "Código inválido.", true);
        return;
    }

    /* atualiza o que o site guarda localmente */

    try {

        const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

        usuario.email_usuario = resultado.email_usuario;

        localStorage.setItem("usuario", JSON.stringify(usuario));

    } catch (erro) { }

    const dadosPerfil = loadProfile();

    dadosPerfil.email = resultado.email_usuario;

    localStorage.setItem(PROFILE_KEY, JSON.stringify(dadosPerfil));

    if (window.usuarioLogado) {
        window.usuarioLogado.email = resultado.email_usuario;
    }

    applyProfile(dadosPerfil);

    perfilMensagem(emMsg, "E-mail alterado com sucesso!", false);

    setTimeout(emFechar, 1500);

}


/* linha "E-mail" da tela de perfil abre o modal */

document.querySelectorAll(".info-row").forEach(linha => {

    const rotulo = linha.querySelector(".info-content span");

    if (rotulo && rotulo.textContent.trim() === "E-mail") {

        linha.style.cursor = "pointer";

        linha.addEventListener("click", () => emAbrir(""));

    }

});

document.getElementById("emailModalClose").addEventListener("click", emFechar);

emOverlay.addEventListener("click", event => {
    if (event.target === emOverlay) emFechar();
});

emSolicitarBtn.addEventListener("click", emSolicitar);
emAutorizarBtn.addEventListener("click", emAutorizar);
emConfirmarBtn.addEventListener("click", emConfirmar);


/* No "Editar perfil": se o e-mail foi mudado, não grava direto.
   Salva nome e telefone e abre a troca de e-mail com confirmação. */

profileEditForm.addEventListener("submit", event => {

    const digitado = editEmail.value.trim().toLowerCase();
    const atual = (loadProfile().email || "").trim().toLowerCase();

    if (!isValidEmail(editEmail.value) || digitado === atual) {
        return;
    }

    event.stopImmediatePropagation();
    event.preventDefault();

    const salvo = loadProfile();

    salvo.nome = editNome.value.trim();
    salvo.telefone = editTelefone.value.trim();

    localStorage.setItem(PROFILE_KEY, JSON.stringify(salvo));

    applyProfile(salvo);

    closeProfileEditModal();

    emAbrir(editEmail.value.trim());

}, true);