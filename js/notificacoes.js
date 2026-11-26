/* =========================================================
   NOTIFICAÇÕES (sino do topo)

   Mostra quantas notificações não foram lidas e, ao abrir,
   a lista vinda da API (/notificacoes/listar). Clicar em uma
   notificação a marca como lida.
========================================================= */
(function () {
    "use strict";

    const botao = document.getElementById("v2NotifBtn");
    const painel = document.getElementById("v2NotifPainel");
    const lista = document.getElementById("v2NotifLista");
    const contador = document.getElementById("v2NotifContador");
    const lerTodas = document.getElementById("v2NotifLerTodas");

    if (!botao || !painel || !lista || !contador) {
        return;
    }

    const INTERVALO_MS = 60 * 1000;

    const ICONES = {
        Aporte: "bi-arrow-left-right",
        Meta: "bi-flag",
        Sistema: "bi-info-circle",
        Aprendizado: "bi-mortarboard",
        "Notícia": "bi-newspaper",
        "Preço": "bi-graph-up"
    };

    function api(caminho, opcoes = {}) {
        return fetch(`${window.ACCURACY_API_URL}/notificacoes/${caminho}`, {
            ...opcoes,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        }).then(r => r.json().then(dados => {
            if (!r.ok || dados.success !== true) throw new Error(dados.message || `HTTP ${r.status}`);
            return dados;
        }));
    }

    function mostrarContador(quantidade) {
        contador.hidden = !(quantidade > 0);
        contador.textContent = quantidade > 9 ? "9+" : String(quantidade);
        botao.setAttribute("aria-label", quantidade > 0
            ? `Notificações: ${quantidade} não lida${quantidade > 1 ? "s" : ""}`
            : "Notificações");
    }

    /* "agora", "há 5 min", "há 3 h", "ontem", "12 nov" */
    function quando(iso) {
        const data = new Date(iso);
        if (Number.isNaN(data.getTime())) return "";

        const minutos = Math.round((Date.now() - data.getTime()) / 60000);
        if (minutos < 1) return "agora";
        if (minutos < 60) return `há ${minutos} min`;
        if (minutos < 24 * 60) return `há ${Math.round(minutos / 60)} h`;
        if (minutos < 48 * 60) return "ontem";

        return data.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
    }

    function item(notificacao) {
        const li = document.createElement("li");
        li.className = "v2-notif-item" + (notificacao.lida ? "" : " nao-lida");
        li.dataset.id = notificacao.id_notificacao;
        li.tabIndex = 0;

        const icone = document.createElement("i");
        icone.className = `bi ${ICONES[notificacao.tipo] || "bi-bell"}`;
        icone.setAttribute("aria-hidden", "true");

        const texto = document.createElement("div");
        const titulo = document.createElement("strong");
        titulo.textContent = notificacao.titulo;
        const mensagem = document.createElement("p");
        mensagem.textContent = notificacao.mensagem;
        const hora = document.createElement("small");
        hora.textContent = quando(notificacao.criado_em);

        texto.append(titulo, mensagem, hora);
        li.append(icone, texto);
        return li;
    }

    function estado(texto) {
        lista.replaceChildren();
        const li = document.createElement("li");
        li.className = "v2-notif-vazio";
        li.textContent = texto;
        lista.appendChild(li);
    }

    async function carregarLista() {
        lista.innerHTML = '<li class="v2-notif-carregando"><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span></li>';

        try {
            const dados = await api("listar?limite=30");
            mostrarContador(dados.nao_lidas);
            lerTodas.hidden = dados.nao_lidas === 0;

            if (!dados.notificacoes.length) {
                estado("Nenhuma notificação por enquanto. Suas compras, vendas e metas aparecem aqui.");
                return;
            }

            lista.replaceChildren(...dados.notificacoes.map(item));
        } catch (erro) {
            estado("Não foi possível carregar as notificações.");
        }
    }

    async function atualizarContador() {
        if (document.visibilityState === "hidden" || !localStorage.getItem("token")) return;

        try {
            mostrarContador((await api("contador")).nao_lidas);
        } catch (erro) {
            /* sem rede: mantém o número anterior */
        }
    }

    async function marcar(id) {
        try {
            const dados = await api("marcar-lidas", {
                method: "POST",
                body: JSON.stringify(id ? { id_notificacao: Number(id) } : {})
            });
            mostrarContador(dados.nao_lidas);
            lerTodas.hidden = dados.nao_lidas === 0;
        } catch (erro) {
            window.V2Toast?.("Não foi possível atualizar a notificação.");
        }
    }

    function abrir(aberto) {
        painel.hidden = !aberto;
        botao.setAttribute("aria-expanded", String(aberto));
        if (aberto) carregarLista();
    }

    botao.addEventListener("click", e => {
        e.stopPropagation();
        abrir(painel.hidden);
    });

    document.addEventListener("click", e => {
        if (!painel.hidden && !painel.contains(e.target)) abrir(false);
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !painel.hidden) {
            abrir(false);
            botao.focus();
        }
    });

    function aoEscolher(e) {
        const alvo = e.target.closest(".v2-notif-item.nao-lida");
        if (!alvo) return;
        alvo.classList.remove("nao-lida");
        marcar(alvo.dataset.id);
    }

    lista.addEventListener("click", aoEscolher);
    lista.addEventListener("keydown", e => { if (e.key === "Enter") aoEscolher(e); });

    lerTodas.addEventListener("click", () => {
        lista.querySelectorAll(".nao-lida").forEach(li => li.classList.remove("nao-lida"));
        marcar(null);
    });

    // Uma operação acabou de ser registrada: o número muda na hora.
    window.addEventListener("accuracy:resumo-atualizado", atualizarContador);
    document.addEventListener("visibilitychange", atualizarContador);
    setInterval(atualizarContador, INTERVALO_MS);
    atualizarContador();
})();
