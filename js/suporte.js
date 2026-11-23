const API_URL = "https://accuracyappapi.onrender.com/";

const $ = (s) => document.querySelector(s);

function esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function aviso(msg, erro = false) {
    const el = $("#aviso");
    el.textContent = msg;
    el.className = "aviso" + (erro ? " erro" : "");
    el.hidden = false;
    clearTimeout(aviso._t);
    aviso._t = setTimeout(() => (el.hidden = true), 5000);
}

const data = (s) => (s ? new Date(String(s).replace(" ", "T")).toLocaleDateString("pt-BR") : "");

// nome e inicial no topo (vêm do login do usuário)
try {
    const nome = (JSON.parse(localStorage.getItem("usuario")).nome_usuario || "").trim();
    $("#nomeTopo").textContent = nome;
    $("#inicialTopo").textContent = (nome.charAt(0) || "U").toUpperCase();
} catch (e) {}

async function api(acao, corpo = {}) {
    const r = await fetch(`${API_URL}auth/${acao}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(corpo)
    });

    // token do usuário expirou -> volta para o login
    if (r.status === 401) {
        window.location.href = "login.php";
        throw new Error("Sessão expirada.");
    }

    let dados = {};
    try { dados = await r.json(); } catch (e) {}

    if (!r.ok || dados.success === false) {
        throw new Error(dados.message || "Erro inesperado.");
    }
    return dados;
}

async function carregar() {
    try {
        const res = await api("perguntaListar");

        $("#listaPerguntas").innerHTML = res.perguntas.length
            ? res.perguntas.map((p) => `
            <article class="pergunta">
                <div class="cabeca">
                    <div>
                        <h4>${esc(p.assunto)}</h4>
                        <div class="quem">${data(p.criado_em)}</div>
                    </div>
                    <span class="chip ${p.resposta_pergunta ? "ok" : "atencao"}">${p.resposta_pergunta ? "Respondida" : "Aguardando"}</span>
                </div>
                <p class="texto">${esc(p.mensagem_pergunta)}</p>
                ${p.resposta_pergunta
                    ? `<div class="resposta"><small>Resposta da equipe · ${data(p.respondida_em)}</small>
                       <p class="texto">${esc(p.resposta_pergunta)}</p></div>`
                    : ""}
            </article>`).join("")
            : '<div class="card vazio">Você ainda não enviou perguntas.</div>';
    } catch (e) {
        aviso(e.message, true);
    }
}

$("#formPergunta").addEventListener("submit", async (e) => {
    e.preventDefault();
    const corpo = Object.fromEntries(new FormData(e.target).entries());

    try {
        const res = await api("perguntaEnviar", corpo);
        aviso(res.message);
        e.target.reset();
        carregar();
    } catch (err) {
        aviso(err.message, true);
    }
});

carregar();