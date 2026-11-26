/* =========================================================
   PERGUNTAS FREQUENTES + CONTATO COM A EQUIPE

   - Busca: filtra as perguntas pelo texto (sem acento/maiúscula).
   - Contato: envia a dúvida para a equipe (auth/perguntaEnviar)
     e lista as mensagens já enviadas com as respostas.
========================================================= */
(function () {
    "use strict";

    const $ = id => document.getElementById(id);

    function normalizar(texto) {
        return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    }


    /* =========================
       BUSCA NAS PERGUNTAS
    ========================= */

    const perguntas = [...document.querySelectorAll(".ajuda-grupo details")];
    const grupos = [...document.querySelectorAll(".ajuda-grupo")];
    const semResultado = $("ajudaSemResultado");

    $("ajudaBusca").addEventListener("input", e => {
        const termos = normalizar(e.target.value).split(/\s+/).filter(Boolean);
        let visiveis = 0;

        perguntas.forEach(item => {
            const texto = normalizar(item.textContent);
            const combina = termos.every(t => texto.includes(t));
            item.hidden = !combina;
            item.open = termos.length > 0 && combina;
            if (combina) visiveis++;
        });

        grupos.forEach(grupo => {
            grupo.hidden = ![...grupo.querySelectorAll("details")].some(d => !d.hidden);
        });

        semResultado.hidden = visiveis > 0;
    });


    /* =========================
       FALE COM A EQUIPE
    ========================= */

    async function api(acao, corpo = {}) {
        const resposta = await fetch(`${window.ACCURACY_API_URL}/auth/${acao}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify(corpo)
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.success === false) {
            throw new Error(dados.message || "Não foi possível falar com o servidor agora.");
        }
        return dados;
    }

    function data(valor) {
        if (!valor) return "";
        const d = new Date(String(valor).replace(" ", "T"));
        return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
    }

    function cartaoPergunta(p) {
        const artigo = document.createElement("article");
        artigo.className = "ajuda-mensagem";

        const cabeca = document.createElement("div");
        cabeca.className = "ajuda-mensagem-cabeca";
        const titulo = document.createElement("strong");
        titulo.textContent = p.assunto;
        const estado = document.createElement("span");
        estado.className = `ajuda-estado ${p.resposta_pergunta ? "respondida" : "aguardando"}`;
        estado.textContent = p.resposta_pergunta ? "Respondida" : "Aguardando resposta";
        cabeca.append(titulo, estado);

        const quando = document.createElement("small");
        quando.textContent = `Enviada em ${data(p.criado_em)}`;

        const texto = document.createElement("p");
        texto.textContent = p.mensagem_pergunta;

        artigo.append(cabeca, quando, texto);

        if (p.resposta_pergunta) {
            const resposta = document.createElement("div");
            resposta.className = "ajuda-resposta";
            const rotulo = document.createElement("small");
            rotulo.textContent = `Resposta da equipe · ${data(p.respondida_em)}`;
            const corpo = document.createElement("p");
            corpo.textContent = p.resposta_pergunta;
            resposta.append(rotulo, corpo);
            artigo.appendChild(resposta);
        }

        return artigo;
    }

    async function carregarMensagens() {
        const lista = $("listaPerguntas");

        try {
            const dados = await api("perguntaListar");

            if (!dados.perguntas.length) {
                lista.innerHTML = '<p class="ajuda-vazio">Você ainda não enviou mensagens.</p>';
            } else {
                lista.replaceChildren(...dados.perguntas.map(cartaoPergunta));
            }
        } catch (erro) {
            lista.innerHTML = '<p class="ajuda-vazio">Não foi possível carregar suas mensagens.</p>';
        } finally {
            lista.setAttribute("aria-busy", "false");
        }
    }

    $("formPergunta").addEventListener("submit", async e => {
        e.preventDefault();

        const form = e.target;
        const aviso = $("perguntaAviso");
        const assunto = form.elements.assunto.value.trim();
        const mensagem = form.elements.mensagem_pergunta.value.trim();

        if (!assunto || !mensagem) {
            aviso.textContent = "Preencha o assunto e a mensagem.";
            aviso.className = "ajuda-form-aviso erro";
            return;
        }

        const botao = form.querySelector("button");
        botao.disabled = true;
        aviso.textContent = "";

        try {
            const dados = await api("perguntaEnviar", { assunto, mensagem_pergunta: mensagem });
            aviso.textContent = dados.message || "Mensagem enviada.";
            aviso.className = "ajuda-form-aviso ok";
            form.reset();
            carregarMensagens();
        } catch (erro) {
            aviso.textContent = erro.message;
            aviso.className = "ajuda-form-aviso erro";
        } finally {
            botao.disabled = false;
        }
    });

    carregarMensagens();
})();
