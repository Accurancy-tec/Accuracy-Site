/* =========================================================
   APARELHOS CONECTADOS (página Perfil)
   Lista onde a conta está aberta (app e navegadores) e permite
   desconectar um aparelho, todos os outros ou todos de uma vez.
   Rotas: auth/sessoes, auth/sessaoEncerrar, auth/sessoesEncerrar.
========================================================= */
(function () {
    "use strict";

    const API = window.ACCURACY_API_URL + "/auth/";
    const lista = document.getElementById("listaAparelhos");
    const status = document.getElementById("aparelhosStatus");
    const botaoOutros = document.getElementById("desconectarOutros");
    const botaoTodos = document.getElementById("sairDeTodos");

    const confirmacao = document.getElementById("confirmOverlay");
    const confirmTitulo = document.getElementById("confirmTitulo");
    const confirmTexto = document.getElementById("confirmTexto");
    const confirmOk = document.getElementById("confirmOk");
    const confirmCancelar = document.getElementById("confirmCancelar");

    if (!lista) return;

    let ocupado = false;
    let aoConfirmar = null;
    let focoAnterior = null;

    async function chamar(rota, corpo) {
        const resposta = await fetch(API + rota, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            body: JSON.stringify(corpo || {})
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.success !== true) {
            throw new Error(dados.message || "Não foi possível concluir agora. Tente de novo.");
        }
        return dados;
    }

    function avisar(texto) {
        status.textContent = texto || "";
    }

    /* "2026-11-26T14:03:00Z" -> "há 5 min", "hoje, 14:03", "3 de nov." */
    function quando(iso) {
        const data = new Date(iso);
        if (Number.isNaN(data.getTime())) return "";

        const minutos = Math.floor((Date.now() - data.getTime()) / 60000);
        if (minutos < 1) return "agora";
        if (minutos < 60) return `há ${minutos} min`;

        const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const hoje = new Date();
        const ontem = new Date(hoje);
        ontem.setDate(hoje.getDate() - 1);

        if (data.toDateString() === hoje.toDateString()) return `hoje, ${hora}`;
        if (data.toDateString() === ontem.toDateString()) return `ontem, ${hora}`;
        return data.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    }

    function icone(sessao) {
        const nome = sessao.dispositivo || "";
        const celular = sessao.plataforma !== "Site" || /Android|iPhone|iPad/i.test(nome);
        return celular ? "bi-phone" : "bi-laptop";
    }

    function descricao(sessao) {
        const origem = sessao.plataforma === "Site" ? "Site"
            : sessao.plataforma === "Android" ? "App Android" : "Login";
        if (sessao.atual) return `${origem} · em uso agora`;

        const ultimoUso = quando(sessao.ultimo_uso_em);
        if (!ultimoUso) return origem;
        return ultimoUso === "agora" ? `${origem} · usado agora` : `${origem} · último uso ${ultimoUso}`;
    }

    function itemDaLista(sessao) {
        const item = document.createElement("li");
        item.className = "aparelho";

        const simbolo = document.createElement("span");
        simbolo.className = "aparelho-icone";
        simbolo.innerHTML = `<i class="bi ${icone(sessao)}" aria-hidden="true"></i>`;

        const textos = document.createElement("div");
        textos.className = "aparelho-textos";

        const nome = document.createElement("strong");
        nome.textContent = sessao.dispositivo || "Aparelho";
        textos.appendChild(nome);

        if (sessao.atual) {
            const atual = document.createElement("span");
            atual.className = "aparelho-atual";
            atual.textContent = "Este navegador";
            textos.appendChild(atual);
        }

        const detalhe = document.createElement("small");
        const entrada = new Date(sessao.criado_em);
        detalhe.textContent = Number.isNaN(entrada.getTime())
            ? descricao(sessao)
            : `${descricao(sessao)} · entrou em ${entrada.toLocaleDateString("pt-BR")}`;
        textos.appendChild(detalhe);

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "v2-ghost-danger";
        botao.textContent = sessao.atual ? "Sair" : "Desconectar";
        botao.setAttribute("aria-label", sessao.atual
            ? "Sair deste navegador"
            : `Desconectar ${sessao.dispositivo || "aparelho"}`);
        botao.addEventListener("click", () => confirmarUm(sessao));

        item.append(simbolo, textos, botao);
        return item;
    }

    function mostrar(sessoes) {
        lista.replaceChildren(...sessoes.map(itemDaLista));

        if (sessoes.length === 0) {
            const vazio = document.createElement("li");
            vazio.className = "aparelho-vazio";
            vazio.textContent = "Nenhum aparelho conectado.";
            lista.appendChild(vazio);
        }

        const outros = sessoes.filter(s => !s.atual).length;
        botaoOutros.disabled = outros === 0;
        botaoOutros.lastChild.textContent = outros === 0 ? " Nenhum outro aparelho"
            : outros === 1 ? " Desconectar o outro aparelho" : ` Desconectar os outros ${outros}`;
    }

    async function carregar() {
        try {
            const dados = await chamar("sessoes");
            mostrar(Array.isArray(dados.sessoes) ? dados.sessoes : []);
        } catch (erro) {
            const falha = document.createElement("li");
            falha.className = "aparelho-vazio";
            falha.textContent = erro.message;
            lista.replaceChildren(falha);
        }
    }

    /* A sessão deste navegador acabou: sai sem chamar a API de novo. */
    function sairDaqui(aviso) {
        if (typeof window.accuracyEncerrarSessao === "function") {
            window.accuracyEncerrarSessao(aviso);
            return;
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("usuario");
        window.location.href = "login.php";
    }

    async function executar(acao) {
        if (ocupado) return;
        ocupado = true;
        botaoOutros.disabled = true;
        botaoTodos.disabled = true;
        avisar("");

        try {
            const dados = await acao();
            if (dados.encerrou_atual) {
                sairDaqui("Você saiu da conta neste navegador.");
                return;
            }
            avisar(dados.message || "Pronto.");
            await carregar();
        } catch (erro) {
            avisar(erro.message);
            await carregar();
        } finally {
            ocupado = false;
            botaoTodos.disabled = false;
        }
    }

    function confirmarUm(sessao) {
        if (sessao.atual) {
            confirmar("Sair deste navegador?",
                "Os outros aparelhos continuam conectados. Para voltar, entre com seu e-mail e senha.",
                "Sair",
                () => executar(() => chamar("sessaoEncerrar", { id_sessao: sessao.id_sessao })));
            return;
        }
        confirmar(`Desconectar ${sessao.dispositivo || "este aparelho"}?`,
            "A conta fecha nesse aparelho na hora. Se você não reconhece esse acesso, troque a senha também.",
            "Desconectar",
            () => executar(() => chamar("sessaoEncerrar", { id_sessao: sessao.id_sessao })));
    }

    botaoOutros.addEventListener("click", () => {
        confirmar("Desconectar os outros aparelhos?",
            "Só este navegador continua com a conta aberta.",
            "Desconectar",
            () => executar(() => chamar("sessoesEncerrar", { manter_atual: true })));
    });

    botaoTodos.addEventListener("click", () => {
        confirmar("Sair de todos os aparelhos?",
            "A conta fecha em todos os lugares, inclusive neste navegador.",
            "Sair de todos",
            () => executar(() => chamar("sessoesEncerrar", { manter_atual: false })));
    });

    /* ---------- janela de confirmação ---------- */

    function confirmar(titulo, texto, rotuloOk, acao) {
        aoConfirmar = acao;
        focoAnterior = document.activeElement;
        confirmTitulo.textContent = titulo;
        confirmTexto.textContent = texto;
        confirmOk.textContent = rotuloOk;
        confirmacao.hidden = false;
        confirmCancelar.focus();
    }

    function fecharConfirmacao() {
        confirmacao.hidden = true;
        aoConfirmar = null;
        if (focoAnterior && typeof focoAnterior.focus === "function") focoAnterior.focus();
    }

    confirmOk.addEventListener("click", () => {
        const acao = aoConfirmar;
        fecharConfirmacao();
        if (acao) acao();
    });

    confirmCancelar.addEventListener("click", fecharConfirmacao);

    confirmacao.addEventListener("click", evento => {
        if (evento.target === confirmacao) fecharConfirmacao();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && !confirmacao.hidden) fecharConfirmacao();
    });

    carregar();
})();
