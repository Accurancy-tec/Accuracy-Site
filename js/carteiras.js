/* =========================
   CARTEIRAS (compartilhado)
   Usado pelas páginas de
   Carteira e Aportes.
========================= */

const Carteiras = (function () {

    const WALLETS_KEY = "accuracy_carteiras";
    const ACTIVE_KEY = "accuracy_carteira_ativa";
    const MAIN_ID = "principal";
    const MAIN = { id: MAIN_ID, name: "Carteira principal" };


    /* =========================
       DADOS
    ========================= */

    function read(key, fallback) {

        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch {
            return fallback;
        }

    }

    /* A carteira principal sempre existe */

    function list() {

        const custom = read(WALLETS_KEY, []);

        return [
            MAIN,
            ...(Array.isArray(custom) ? custom : [])
                .filter(w => w && w.id && w.name)
        ];

    }

    function nameOf(id) {

        const wallet = list().find(w => w.id === id);

        return wallet ? wallet.name : MAIN.name;

    }

    /* Aportes antigos (sem carteira) caem na principal */

    function normalize(id) {

        return list().some(w => w.id === id) ? id : MAIN_ID;

    }

    function add(rawName) {

        const name = String(rawName || "").trim();

        if (!name) {
            return { error: "Digite um nome para a carteira." };
        }

        if (name.length > 30) {
            return { error: "Use no máximo 30 caracteres." };
        }

        const exists = list().some(
            w => w.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            return { error: "Já existe uma carteira com esse nome." };
        }

        const wallet = { id: `c${Date.now()}`, name };

        const custom = list().slice(1);

        custom.push(wallet);

        localStorage.setItem(WALLETS_KEY, JSON.stringify(custom));

        return { wallet };

    }

    function remove(id) {

        if (id === MAIN_ID) {
            return;
        }

        const custom = list().slice(1).filter(w => w.id !== id);

        localStorage.setItem(WALLETS_KEY, JSON.stringify(custom));

        if (localStorage.getItem(ACTIVE_KEY) === id) {
            localStorage.setItem(ACTIVE_KEY, "all");
        }

    }

    /* Carteira selecionada na página Carteira ("all" = todas) */

    function getActive() {

        const id = localStorage.getItem(ACTIVE_KEY);

        return id === "all" || list().some(w => w.id === id)
            ? id
            : "all";

    }

    function setActive(id) {

        localStorage.setItem(ACTIVE_KEY, id);

    }


    /* =========================
       JANELAS (MODAL)
    ========================= */

    function el(tag, className, text) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;

    }

    function modal({ title, text, okLabel, build, validate }) {

        return new Promise(resolve => {

            const overlay = el("div", "cw-overlay");
            const box = el("div", "cw-modal");

            box.setAttribute("role", "dialog");
            box.setAttribute("aria-modal", "true");

            box.append(el("h3", "", title));

            if (text) {
                box.append(el("p", "cw-text", text));
            }

            const control = build(box);

            const error = el("div", "cw-error");

            const actions = el("div", "cw-actions");

            const cancel = el("button", "cw-btn", "Cancelar");
            const ok = el("button", "cw-btn primary", okLabel);

            cancel.type = "button";
            ok.type = "button";

            actions.append(cancel, ok);

            box.append(error, actions);
            overlay.append(box);
            document.body.append(overlay);


            function close(result) {

                document.removeEventListener("keydown", onKey);

                overlay.remove();

                resolve(result);

            }

            function submit() {

                const value = control.getValue();

                const result = validate
                    ? validate(value)
                    : { value };

                if (result.error) {
                    error.textContent = result.error;
                    return;
                }

                close(result.value);

            }

            function onKey(event) {

                if (event.key === "Escape") {
                    close(null);
                }

                if (event.key === "Enter" && event.target.tagName !== "BUTTON") {
                    event.preventDefault();
                    submit();
                }

            }

            cancel.addEventListener("click", () => close(null));
            ok.addEventListener("click", submit);

            overlay.addEventListener("mousedown", event => {
                if (event.target === overlay) {
                    close(null);
                }
            });

            document.addEventListener("keydown", onKey);

            control.focus();

        });

    }

    /* Pergunta em qual carteira colocar o aporte */

    function askWallet({ selected } = {}) {

        const wallets = list();

        const pick = wallets.some(w => w.id === selected)
            ? selected
            : MAIN_ID;

        return modal({

            title: "Em qual carteira deseja colocar este aporte?",

            text: "Escolha a carteira que vai receber o aporte.",

            okLabel: "Confirmar aporte",

            build(box) {

                const group = el("div", "cw-options");

                function sync() {

                    group.querySelectorAll(".cw-option").forEach(label => {
                        label.classList.toggle(
                            "selected",
                            label.querySelector("input").checked
                        );
                    });

                }

                wallets.forEach(wallet => {

                    const label = el("label", "cw-option");
                    const input = document.createElement("input");

                    input.type = "radio";
                    input.name = "cw-wallet";
                    input.value = wallet.id;
                    input.checked = wallet.id === pick;

                    input.addEventListener("change", sync);

                    label.append(input, el("span", "", wallet.name));

                    group.append(label);

                });

                box.append(group);

                sync();

                return {
                    getValue: () => group.querySelector("input:checked")?.value,
                    focus: () => group.querySelector("input:checked")?.focus()
                };

            }

        });

    }

    /* Pergunta o nome e cria uma carteira nova */

    function promptNewWallet() {

        return modal({

            title: "Nova carteira",

            text: "Dê um nome para a carteira. Depois de criar, você poderá escolher essa carteira ao fazer um aporte.",

            okLabel: "Criar carteira",

            build(box) {

                const input = el("input", "cw-input");

                input.type = "text";
                input.maxLength = 30;
                input.placeholder = "Ex: Aposentadoria";

                box.append(input);

                return {
                    getValue: () => input.value,
                    focus: () => input.focus()
                };

            },

            validate(value) {

                const result = add(value);

                return result.error
                    ? { error: result.error }
                    : { value: result.wallet };

            }

        });

    }


    return {
        MAIN_ID,
        list,
        nameOf,
        normalize,
        add,
        remove,
        getActive,
        setActive,
        askWallet,
        promptNewWallet
    };

})();