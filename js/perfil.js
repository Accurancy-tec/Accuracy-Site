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
/* =========================
   NOME DO USUÁRIO VINDO DO BANCO
========================= */

(async function carregarNomeDoBanco() {

    try {

        const resposta = await fetch(
            "https://accuracyappapi.onrender.com/user/perfil.php",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }
        );

        const dados = await resposta.json();

        if (!dados.sucesso || !dados.nome_usuario) {
            return;
        }

        const nome = dados.nome_usuario;

        /* Nome no menu, no card do perfil e na linha "Nome" */
        if (navUserName) navUserName.textContent = nome;
        if (profileCardName) profileCardName.textContent = nome;

        document.querySelectorAll(".info-row .info-content").forEach(content => {

            const label = content.querySelector("span");
            const value = content.querySelector("p");

            if (label && value && label.textContent.trim() === "Nome") {
                value.textContent = nome;
            }

        });

        /* Mantém o nome atualizado para as outras páginas */
        const salvo = JSON.parse(localStorage.getItem("usuario") || "{}");
        salvo.nome_usuario = nome;
        localStorage.setItem("usuario", JSON.stringify(salvo));

        const editado = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
        if (editado) {
            editado.nome = nome;
            localStorage.setItem(PROFILE_KEY, JSON.stringify(editado));
        }

        if (editNome) editNome.value = nome;

    } catch (erro) {
        console.error("Erro ao buscar o nome do usuário:", erro);
    }

})();