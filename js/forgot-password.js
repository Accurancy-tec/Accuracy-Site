// Forgot password: (1) the API e-mails a 6-digit code, with the same answer whether the account exists
// or not; (2) code + new password change the password and sign out every device.
(function () {
    "use strict";

    const API = window.ACCURACY_API_URL + "/auth/";
    const MIN_PASSWORD_LENGTH = 8;
    const RESEND_WAIT_SECONDS = 60;

    const $ = id => document.getElementById(id);
    const emailForm = $("emailForm");
    const passwordForm = $("passwordForm");
    const emailField = $("email");
    const codeField = $("code");
    const passwordField = $("newPassword");
    const confirmField = $("confirmPassword");
    const resendLink = $("resendCode");

    let email = "";
    let resendTimer = null;

    async function post(route, body) {
        const response = await fetch(API + route, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success !== true) {
            throw new Error(data.message || "Não foi possível concluir agora. Tente de novo.");
        }
        return data;
    }

    function setStatus(id, text, type) {
        const line = $(id);
        line.textContent = text || "";
        line.classList.toggle("error", type === "error");
        line.classList.toggle("success", type === "success");
    }

    function setBusy(button, busy, text) {
        if (!button.dataset.label) button.dataset.label = button.textContent.trim();
        button.disabled = busy;
        button.textContent = busy ? text : button.dataset.label;
    }

    function markInvalid(field, invalid) {
        field.classList.toggle("error", invalid);
        if (invalid) field.setAttribute("aria-invalid", "true");
        else field.removeAttribute("aria-invalid");
    }

    // "Reenviar código" stays locked for one minute, like in the API.
    function waitToResend() {
        let remaining = RESEND_WAIT_SECONDS;
        clearInterval(resendTimer);
        resendLink.setAttribute("aria-disabled", "true");
        resendLink.textContent = `Reenviar código (${remaining}s)`;

        resendTimer = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(resendTimer);
                resendLink.removeAttribute("aria-disabled");
                resendLink.textContent = "Reenviar código";
                return;
            }
            resendLink.textContent = `Reenviar código (${remaining}s)`;
        }, 1000);
    }

    function showPasswordStep() {
        emailForm.hidden = true;
        passwordForm.hidden = false;
        $("sentToEmail").textContent = email;
        setStatus("passwordStatus", "");
        codeField.focus();
        waitToResend();
    }

    function showEmailStep() {
        clearInterval(resendTimer);
        passwordForm.hidden = true;
        emailForm.hidden = false;
        emailField.value = email;
        setStatus("emailStatus", "");
        emailField.focus();
    }

    async function requestCode(button) {
        setBusy(button, true, "Enviando...");
        try {
            await post("recuperarSenha", { email_usuario: email });
            return true;
        } catch (error) {
            setStatus(passwordForm.hidden ? "emailStatus" : "passwordStatus", error.message, "error");
            return false;
        } finally {
            setBusy(button, false);
        }
    }

    emailForm.addEventListener("submit", async event => {
        event.preventDefault();
        setStatus("emailStatus", "");

        const typed = emailField.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typed)) {
            markInvalid(emailField, true);
            setStatus("emailStatus", "Digite um e-mail válido.", "error");
            emailField.focus();
            return;
        }
        markInvalid(emailField, false);
        email = typed;

        if (await requestCode($("sendCodeButton"))) {
            showPasswordStep();
        }
    });

    passwordForm.addEventListener("submit", async event => {
        event.preventDefault();
        setStatus("passwordStatus", "");
        [codeField, passwordField, confirmField].forEach(field => markInvalid(field, false));

        const code = codeField.value.trim();
        const password = passwordField.value;

        if (!/^\d{6}$/.test(code)) {
            markInvalid(codeField, true);
            setStatus("passwordStatus", "Digite os 6 números do código.", "error");
            codeField.focus();
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            markInvalid(passwordField, true);
            setStatus("passwordStatus", `A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`, "error");
            passwordField.focus();
            return;
        }
        if (password !== confirmField.value) {
            markInvalid(confirmField, true);
            setStatus("passwordStatus", "As senhas não são iguais.", "error");
            confirmField.focus();
            return;
        }

        const button = $("resetButton");
        setBusy(button, true, "Salvando...");
        try {
            const data = await post("redefinirSenha", { email_usuario: email, codigo: code, nova_senha: password });
            sessionStorage.setItem("accuracy_aviso_login", data.message || "Senha redefinida. Entre com a nova senha.");
            sessionStorage.setItem("email_login", email);
            window.location.href = "login.php";
        } catch (error) {
            setStatus("passwordStatus", error.message, "error");
            setBusy(button, false);
        }
    });

    resendLink.addEventListener("click", async event => {
        event.preventDefault();
        if (resendLink.getAttribute("aria-disabled") === "true") return;

        setStatus("passwordStatus", "");
        if (await requestCode($("resetButton"))) {
            setStatus("passwordStatus", "Se a conta existir, enviamos um novo código.", "success");
            waitToResend();
        }
    });

    $("otherEmail").addEventListener("click", event => {
        event.preventDefault();
        showEmailStep();
    });

    codeField.addEventListener("input", () => {
        codeField.value = codeField.value.replace(/\D/g, "").slice(0, 6);
    });

    // The "Esqueci minha senha" link of the login page brings the e-mail already typed there.
    const fromLogin = sessionStorage.getItem("email_recuperacao");
    sessionStorage.removeItem("email_recuperacao");
    if (fromLogin) emailField.value = fromLogin;
    emailField.focus();
})();
