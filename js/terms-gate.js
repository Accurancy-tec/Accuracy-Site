// Asks the signed-in user to accept the current Terms of Use and Privacy Policy before going on.
(function () {
    "use strict";

    const token = () => localStorage.getItem("token") || "";
    const CHECKED_KEY = (() => {
        try {
            return "accuracy_terms_checked_" + ((JSON.parse(localStorage.getItem("usuario")) || {}).id_usuario || "");
        } catch (error) {
            return "accuracy_terms_checked_";
        }
    })();

    async function post(path) {
        const response = await fetch(`${window.ACCURACY_API_URL}/auth/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            body: "{}"
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success !== true) {
            throw new Error(data.message || "Não foi possível falar com o servidor. Tente de novo.");
        }
        return data;
    }

    function showGate() {
        const backdrop = document.createElement("div");
        backdrop.className = "v2-modal-fundo terms-gate";
        backdrop.innerHTML = `
            <section class="v2-modal" role="dialog" aria-modal="true" aria-labelledby="termsGateTitle" aria-describedby="termsGateText">
                <div class="v2-modal-topo"><h2 id="termsGateTitle">Termos de Uso e Privacidade</h2></div>
                <p class="v2-modal-sub" id="termsGateText">
                    Para continuar usando o Accuracy, leia e aceite os documentos abaixo. Eles explicam que o
                    simulador é educativo, não movimenta dinheiro de verdade e como cuidamos dos seus dados.
                </p>
                <ul class="terms-gate-links">
                    <li><a href="terms.php" target="_blank" rel="noopener">Termos de Uso</a></li>
                    <li><a href="privacy.php" target="_blank" rel="noopener">Política de Privacidade</a></li>
                </ul>
                <label class="terms-gate-check">
                    <input type="checkbox">
                    <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
                </label>
                <p class="v2-modal-erro" role="alert" aria-live="polite"></p>
                <button type="button" class="v2-modal-confirmar" data-accept disabled>Aceitar e continuar</button>
                <button type="button" class="terms-gate-leave" data-leave>Sair da conta</button>
            </section>`;
        document.body.appendChild(backdrop);

        const checkbox = backdrop.querySelector("input[type=checkbox]");
        const accept = backdrop.querySelector("[data-accept]");
        const error = backdrop.querySelector(".v2-modal-erro");

        checkbox.addEventListener("change", () => { accept.disabled = !checkbox.checked; });
        checkbox.focus();

        accept.addEventListener("click", async () => {
            accept.disabled = true;
            error.textContent = "";
            try {
                await post("aceitar-termos");
                sessionStorage.setItem(CHECKED_KEY, "1");
                backdrop.remove();
            } catch (failure) {
                error.textContent = failure.message;
                accept.disabled = !checkbox.checked;
            }
        });

        backdrop.querySelector("[data-leave]").addEventListener("click", () => {
            if (typeof window.accuracyEncerrarSessao === "function") {
                window.accuracyEncerrarSessao();
            } else {
                localStorage.removeItem("token");
                window.location.href = "login.php";
            }
        });
    }

    if (!token() || sessionStorage.getItem(CHECKED_KEY)) return;

    post("termos")
        .then(status => {
            if (status.pending) {
                showGate();
            } else {
                sessionStorage.setItem(CHECKED_KEY, "1");
            }
        })
        // Without an answer the page keeps working; the next page asks again.
        .catch(() => { });
})();
