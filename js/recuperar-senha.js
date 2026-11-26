/* =========================================================
   ESQUECI A SENHA
   1) e-mail: a API manda um código de 6 números (a resposta é a
      mesma exista ou não a conta, para não revelar e-mails);
   2) código + senha nova: a senha muda e a conta sai de todos os
      aparelhos. Depois volta ao login com o e-mail preenchido.
   Rotas: auth/recuperarSenha e auth/redefinirSenha.
========================================================= */
(function () {
    "use strict";

    const API = window.ACCURACY_API_URL + "/auth/";
    const SENHA_MINIMA = 8;
    const ESPERA_REENVIO_S = 60;

    const $ = id => document.getElementById(id);
    const formEmail = $("formEmail");
    const formSenha = $("formSenha");
    const campoEmail = $("email");
    const campoCodigo = $("codigo");
    const campoSenha = $("novaSenha");
    const campoConfirma = $("confirmaSenha");
    const linkReenviar = $("reenviar");

    let email = "";
    let relogio = null;

    async function chamar(rota, corpo) {
        const resposta = await fetch(API + rota, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo)
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.success !== true) {
            throw new Error(dados.message || "Não foi possível concluir agora. Tente de novo.");
        }
        return dados;
    }

    function status(id, texto, tipo) {
        const linha = $(id);
        linha.textContent = texto || "";
        linha.classList.toggle("error", tipo === "erro");
        linha.classList.toggle("success", tipo === "ok");
    }

    function ocupado(botao, sim, texto) {
        if (!botao.dataset.texto) botao.dataset.texto = botao.textContent.trim();
        botao.disabled = sim;
        botao.textContent = sim ? texto : botao.dataset.texto;
    }

    function marcarErro(campo, sim) {
        campo.classList.toggle("error", sim);
        if (sim) campo.setAttribute("aria-invalid", "true");
        else campo.removeAttribute("aria-invalid");
    }

    /* "Reenviar código" fica bloqueado por 1 minuto, como na API. */
    function esperarReenvio() {
        let restante = ESPERA_REENVIO_S;
        clearInterval(relogio);
        linkReenviar.setAttribute("aria-disabled", "true");
        linkReenviar.textContent = `Reenviar código (${restante}s)`;

        relogio = setInterval(() => {
            restante -= 1;
            if (restante <= 0) {
                clearInterval(relogio);
                linkReenviar.removeAttribute("aria-disabled");
                linkReenviar.textContent = "Reenviar código";
                return;
            }
            linkReenviar.textContent = `Reenviar código (${restante}s)`;
        }, 1000);
    }

    function mostrarEtapaSenha() {
        formEmail.hidden = true;
        formSenha.hidden = false;
        $("emailInformado").textContent = email;
        status("statusSenha", "");
        campoCodigo.focus();
        esperarReenvio();
    }

    function mostrarEtapaEmail() {
        clearInterval(relogio);
        formSenha.hidden = true;
        formEmail.hidden = false;
        campoEmail.value = email;
        status("statusEmail", "");
        campoEmail.focus();
    }

    async function pedirCodigo(botao) {
        ocupado(botao, true, "Enviando...");
        try {
            await chamar("recuperarSenha", { email_usuario: email });
            return true;
        } catch (erro) {
            status(formSenha.hidden ? "statusEmail" : "statusSenha", erro.message, "erro");
            return false;
        } finally {
            ocupado(botao, false);
        }
    }

    formEmail.addEventListener("submit", async evento => {
        evento.preventDefault();
        status("statusEmail", "");

        const digitado = campoEmail.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(digitado)) {
            marcarErro(campoEmail, true);
            status("statusEmail", "Digite um e-mail válido.", "erro");
            campoEmail.focus();
            return;
        }
        marcarErro(campoEmail, false);
        email = digitado;

        if (await pedirCodigo($("btnEnviar"))) {
            mostrarEtapaSenha();
        }
    });

    formSenha.addEventListener("submit", async evento => {
        evento.preventDefault();
        status("statusSenha", "");
        [campoCodigo, campoSenha, campoConfirma].forEach(c => marcarErro(c, false));

        const codigo = campoCodigo.value.trim();
        const senha = campoSenha.value;

        if (!/^\d{6}$/.test(codigo)) {
            marcarErro(campoCodigo, true);
            status("statusSenha", "Digite os 6 números do código.", "erro");
            campoCodigo.focus();
            return;
        }
        if (senha.length < SENHA_MINIMA) {
            marcarErro(campoSenha, true);
            status("statusSenha", `A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`, "erro");
            campoSenha.focus();
            return;
        }
        if (senha !== campoConfirma.value) {
            marcarErro(campoConfirma, true);
            status("statusSenha", "As senhas não são iguais.", "erro");
            campoConfirma.focus();
            return;
        }

        const botao = $("btnRedefinir");
        ocupado(botao, true, "Salvando...");
        try {
            const dados = await chamar("redefinirSenha", { email_usuario: email, codigo, nova_senha: senha });
            sessionStorage.setItem("accuracy_aviso_login", dados.message || "Senha redefinida. Entre com a nova senha.");
            sessionStorage.setItem("email_login", email);
            window.location.href = "login.php";
        } catch (erro) {
            status("statusSenha", erro.message, "erro");
            ocupado(botao, false);
        }
    });

    linkReenviar.addEventListener("click", async evento => {
        evento.preventDefault();
        if (linkReenviar.getAttribute("aria-disabled") === "true") return;

        status("statusSenha", "");
        if (await pedirCodigo($("btnRedefinir"))) {
            status("statusSenha", "Se a conta existir, enviamos um novo código.", "ok");
            esperarReenvio();
        }
    });

    $("outroEmail").addEventListener("click", evento => {
        evento.preventDefault();
        mostrarEtapaEmail();
    });

    campoCodigo.addEventListener("input", () => {
        campoCodigo.value = campoCodigo.value.replace(/\D/g, "").slice(0, 6);
    });

    // O link "Esqueci minha senha" do login traz o e-mail que já estava digitado.
    const vindoDoLogin = sessionStorage.getItem("email_recuperacao");
    sessionStorage.removeItem("email_recuperacao");
    if (vindoDoLogin) campoEmail.value = vindoDoLogin;
    campoEmail.focus();
})();
