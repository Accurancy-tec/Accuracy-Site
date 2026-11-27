// Connected devices (profile page): where the account is open (app and browsers), with options to
// sign out one device, every other device or all of them.
(function () {
    "use strict";

    const API = window.ACCURACY_API_URL + "/auth/";
    const list = document.getElementById("devicesList");
    const status = document.getElementById("devicesStatus");
    const othersButton = document.getElementById("disconnectOthers");
    const allButton = document.getElementById("signOutAll");

    const dialog = document.getElementById("confirmOverlay");
    const dialogTitle = document.getElementById("confirmTitle");
    const dialogText = document.getElementById("confirmText");
    const dialogOk = document.getElementById("confirmOk");
    const dialogCancel = document.getElementById("confirmCancel");

    if (!list) return;

    let busy = false;
    let onConfirm = null;
    let previousFocus = null;

    async function post(route, body) {
        const response = await fetch(API + route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            body: JSON.stringify(body || {})
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success !== true) {
            throw new Error(data.message || "Não foi possível concluir agora. Tente de novo.");
        }
        return data;
    }

    function showStatus(text) {
        status.textContent = text || "";
    }

    /* "2026-11-26T14:03:00Z" -> "há 5 min", "hoje, 14:03", "3 de nov." */
    function relativeTime(iso) {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return "";

        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return "agora";
        if (minutes < 60) return `há ${minutes} min`;

        const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return `hoje, ${time}`;
        if (date.toDateString() === yesterday.toDateString()) return `ontem, ${time}`;
        return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    }

    function iconFor(session) {
        const name = session.dispositivo || "";
        const phone = session.plataforma !== "Site" || /Android|iPhone|iPad/i.test(name);
        return phone ? "bi-phone" : "bi-laptop";
    }

    function describe(session) {
        const origin = session.plataforma === "Site" ? "Site"
            : session.plataforma === "Android" ? "App Android" : "Login";
        if (session.atual) return `${origin} · em uso agora`;

        const lastUse = relativeTime(session.ultimo_uso_em);
        if (!lastUse) return origin;
        return lastUse === "agora" ? `${origin} · usado agora` : `${origin} · último uso ${lastUse}`;
    }

    function listItem(session) {
        const item = document.createElement("li");
        item.className = "device";

        const icon = document.createElement("span");
        icon.className = "device-icon";
        icon.innerHTML = `<i class="bi ${iconFor(session)}" aria-hidden="true"></i>`;

        const texts = document.createElement("div");
        texts.className = "device-texts";

        const name = document.createElement("strong");
        name.textContent = session.dispositivo || "Aparelho";
        texts.appendChild(name);

        if (session.atual) {
            const current = document.createElement("span");
            current.className = "device-current";
            current.textContent = "Este navegador";
            texts.appendChild(current);
        }

        const detail = document.createElement("small");
        const signedIn = new Date(session.criado_em);
        detail.textContent = Number.isNaN(signedIn.getTime())
            ? describe(session)
            : `${describe(session)} · entrou em ${signedIn.toLocaleDateString("pt-BR")}`;
        texts.appendChild(detail);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "v2-ghost-danger";
        button.textContent = session.atual ? "Sair" : "Desconectar";
        button.setAttribute("aria-label", session.atual
            ? "Sair deste navegador"
            : `Desconectar ${session.dispositivo || "aparelho"}`);
        button.addEventListener("click", () => confirmOne(session));

        item.append(icon, texts, button);
        return item;
    }

    function render(sessions) {
        list.replaceChildren(...sessions.map(listItem));

        if (sessions.length === 0) {
            const empty = document.createElement("li");
            empty.className = "device-empty";
            empty.textContent = "Nenhum aparelho conectado.";
            list.appendChild(empty);
        }

        const others = sessions.filter(session => !session.atual).length;
        othersButton.disabled = others === 0;
        othersButton.lastChild.textContent = others === 0 ? " Nenhum outro aparelho"
            : others === 1 ? " Desconectar o outro aparelho" : ` Desconectar os outros ${others}`;
    }

    async function load() {
        try {
            const data = await post("sessoes");
            render(Array.isArray(data.sessoes) ? data.sessoes : []);
        } catch (error) {
            const failure = document.createElement("li");
            failure.className = "device-empty";
            failure.textContent = error.message;
            list.replaceChildren(failure);
        }
    }

    /* The session of this browser ended: leave without calling the API again. */
    function leaveHere(message) {
        if (typeof window.accuracyEncerrarSessao === "function") {
            window.accuracyEncerrarSessao(message);
            return;
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("usuario");
        window.location.href = "login.php";
    }

    async function run(action) {
        if (busy) return;
        busy = true;
        othersButton.disabled = true;
        allButton.disabled = true;
        showStatus("");

        try {
            const data = await action();
            if (data.encerrou_atual) {
                leaveHere("Você saiu da conta neste navegador.");
                return;
            }
            showStatus(data.message || "Pronto.");
            await load();
        } catch (error) {
            showStatus(error.message);
            await load();
        } finally {
            busy = false;
            allButton.disabled = false;
        }
    }

    function confirmOne(session) {
        if (session.atual) {
            askConfirmation("Sair deste navegador?",
                "Os outros aparelhos continuam conectados. Para voltar, entre com seu e-mail e senha.",
                "Sair",
                () => run(() => post("sessaoEncerrar", { id_sessao: session.id_sessao })));
            return;
        }
        askConfirmation(`Desconectar ${session.dispositivo || "este aparelho"}?`,
            "A conta fecha nesse aparelho na hora. Se você não reconhece esse acesso, troque a senha também.",
            "Desconectar",
            () => run(() => post("sessaoEncerrar", { id_sessao: session.id_sessao })));
    }

    othersButton.addEventListener("click", () => {
        askConfirmation("Desconectar os outros aparelhos?",
            "Só este navegador continua com a conta aberta.",
            "Desconectar",
            () => run(() => post("sessoesEncerrar", { manter_atual: true })));
    });

    allButton.addEventListener("click", () => {
        askConfirmation("Sair de todos os aparelhos?",
            "A conta fecha em todos os lugares, inclusive neste navegador.",
            "Sair de todos",
            () => run(() => post("sessoesEncerrar", { manter_atual: false })));
    });

    function askConfirmation(title, text, okLabel, action) {
        onConfirm = action;
        previousFocus = document.activeElement;
        dialogTitle.textContent = title;
        dialogText.textContent = text;
        dialogOk.textContent = okLabel;
        dialog.hidden = false;
        dialogCancel.focus();
    }

    function closeConfirmation() {
        dialog.hidden = true;
        onConfirm = null;
        if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }

    dialogOk.addEventListener("click", () => {
        const action = onConfirm;
        closeConfirmation();
        if (action) action();
    });

    dialogCancel.addEventListener("click", closeConfirmation);

    dialog.addEventListener("click", event => {
        if (event.target === dialog) closeConfirmation();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !dialog.hidden) closeConfirmation();
    });

    load();
})();
