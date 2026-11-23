const API_URL = "http://localhost:8080/";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* =========================================================
   Utilidades
   ========================================================= */

// Escapa texto antes de pôr no HTML (inclusive dentro de atributos)
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
    aviso._t = setTimeout(() => (el.hidden = true), 4500);
}

function sair() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    window.location.href = "login.php";
}

async function api(acao, corpo = {}) {
    const r = await fetch(`${API_URL}auth/${acao}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("admin_token")
        },
        body: JSON.stringify(corpo)
    });

    if (r.status === 401) { sair(); throw new Error("Sessão expirada."); }

    let dados = {};
    try { dados = await r.json(); } catch (e) {}

    if (!r.ok || dados.success === false) {
        throw new Error(dados.message || "Erro inesperado.");
    }
    return dados;
}

// Executa uma ação e mostra o resultado no aviso
async function acao(fn, okMsg) {
    try {
        const res = await fn();
        if (okMsg) aviso(okMsg);
        return res;
    } catch (e) {
        aviso(e.message, true);
    }
}

const data = (s) => (s ? new Date(String(s).replace(" ", "T")).toLocaleDateString("pt-BR") : "-");
const busca = () => $("#busca").value.trim().toLowerCase();
const contem = (texto) => String(texto ?? "").toLowerCase().includes(busca());

/* =========================================================
   Sessão (nome, nível, sair)
   ========================================================= */

let meuNivel = "Editor";

try {
    const eu = JSON.parse(localStorage.getItem("admin"));
    $("#admNome").textContent = eu.nome_usuario || "Administrador";
    $("#admInicial").textContent = (eu.nome_usuario || "A").trim().charAt(0).toUpperCase();
    meuNivel = eu.nivel || "Editor";
    $("#admNivel").textContent = meuNivel;
} catch (e) {}

$("#btnSair").addEventListener("click", sair);
$("#btnSairTopo").addEventListener("click", sair);

/* =========================================================
   Navegação entre seções (menu lateral)
   ========================================================= */

const SECOES = {
    usuarios:  { busca: "Buscar usuário por nome ou e-mail", carregar: () => carregarUsuarios() },
    cursos:    { busca: "Buscar curso por título ou categoria", carregar: () => carregarCursos() },
    noticias:  { busca: "Buscar notícia por título", carregar: () => carregarNoticias() },
    perguntas: { busca: "Buscar pergunta por assunto ou usuário", carregar: () => carregarPerguntas() },
    admins:    { busca: "Buscar administrador por nome ou e-mail", carregar: () => carregarAdmins() }
};

let secaoAtual = "usuarios";

function secaoDoHash() {
    const h = location.hash.replace("#", "");
    return SECOES[h] ? h : "usuarios";
}

function mostrar(sec) {
    secaoAtual = sec;
    $$(".secao").forEach((s) => (s.hidden = s.id !== "sec-" + sec));
    $$("#menu a").forEach((a) => a.classList.toggle("ativo", a.dataset.sec === sec));
    $("#busca").placeholder = SECOES[sec].busca;
    $("#busca").value = "";
    SECOES[sec].carregar();
}

$("#menu").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-sec]");
    if (!a) return;
    if (location.hash === "#" + a.dataset.sec) mostrar(a.dataset.sec);   // mesmo hash: recarrega
    else location.hash = a.dataset.sec;
});

window.addEventListener("hashchange", () => mostrar(secaoDoHash()));

// A busca do topo filtra a seção aberta, sem nova chamada à API
const RENDERIZAR = {
    usuarios: () => renderUsuarios(),
    cursos: () => renderCursos(),
    noticias: () => renderNoticias(),
    perguntas: () => renderPerguntas(),
    admins: () => renderAdmins()
};
$("#busca").addEventListener("input", () => RENDERIZAR[secaoAtual]());

// Filtros em pílulas (usuários e perguntas)
function ligarPilulas(seletor, aoMudar) {
    $(seletor).addEventListener("click", (e) => {
        const b = e.target.closest(".pilula");
        if (!b) return;
        $$(seletor + " .pilula").forEach((x) => x.classList.toggle("ativa", x === b));
        aoMudar(b.dataset.f);
    });
}

/* =========================================================
   USUÁRIOS
   ========================================================= */

let usuarios = [];
let filtroU = "todos";

async function carregarUsuarios() {
    const res = await acao(() => api("adminListarUsuarios"));
    if (!res) return;
    usuarios = res.usuarios;
    renderUsuarios();
}

function renderUsuarios() {
    const ativos = usuarios.filter((u) => u.ativo_usuario).length;
    $("#numTotal").textContent = usuarios.length;
    $("#numAtivos").textContent = ativos;
    $("#numInativos").textContent = usuarios.length - ativos;
    $("#topoTotal").textContent = usuarios.length;

    const lista = usuarios.filter((u) =>
        (filtroU === "todos" || (filtroU === "ativos") === u.ativo_usuario) &&
        (contem(u.nome_usuario) || contem(u.email_usuario))
    );

    $("#tabelaUsuarios").innerHTML = lista.length
        ? lista.map((u) => `
        <tr class="${u.ativo_usuario ? "" : "inativo"}">
            <td><strong>${esc(u.nome_usuario)}</strong></td>
            <td class="sec">${esc(u.email_usuario)}</td>
            <td class="sec">${data(u.criado_em)}</td>
            <td><span class="chip ${u.ativo_usuario ? "ok" : "ruim"}">${u.ativo_usuario ? "Ativo" : "Desativado"}</span></td>
            <td class="dir">
                <div class="linha-acoes">
                    <button class="btn btn-claro btn-pq" data-ed="${u.id_usuario}">Editar</button>
                    <button class="btn btn-claro btn-pq" data-st="${u.id_usuario}">${u.ativo_usuario ? "Desativar" : "Reativar"}</button>
                    <button class="btn btn-perigo btn-pq" data-del="${u.id_usuario}">Excluir</button>
                </div>
            </td>
        </tr>`).join("")
        : '<tr><td colspan="5" class="vazio">Nenhum usuário encontrado.</td></tr>';
}

ligarPilulas("#filtroUsuarios", (f) => { filtroU = f; renderUsuarios(); });

$("#tabelaUsuarios").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;

    if (b.dataset.ed) {
        const u = usuarios.find((x) => x.id_usuario == b.dataset.ed);
        const f = $("#formUsuario");
        f.id_usuario.value = u.id_usuario;
        f.nome_usuario.value = u.nome_usuario || "";
        f.email_usuario.value = u.email_usuario || "";
        f.telefone_usuario.value = u.telefone_usuario || "";
        $("#modalUsuario").showModal();
    }

    if (b.dataset.st) {
        const u = usuarios.find((x) => x.id_usuario == b.dataset.st);
        const novo = !u.ativo_usuario;
        if (!novo && !confirm(`Desativar a conta de ${u.nome_usuario}? Ele não conseguirá entrar.`)) return;
        await acao(
            () => api("adminAlterarUsuario", { id_usuario: u.id_usuario, ativo_usuario: novo }),
            novo ? "Conta reativada." : "Conta desativada."
        );
        carregarUsuarios();
    }

    if (b.dataset.del) {
        const u = usuarios.find((x) => x.id_usuario == b.dataset.del);
        if (!confirm(`EXCLUIR ${u.nome_usuario}?\nIsso apaga carteiras, aportes e histórico dele e não tem volta.\n\nPrefere só desativar?`)) return;
        await acao(() => api("adminDeletarUsuario", { id_usuario: u.id_usuario }), "Usuário excluído.");
        carregarUsuarios();
    }
});

$("#cancelarEdicao").addEventListener("click", () => $("#modalUsuario").close());

$("#formUsuario").addEventListener("submit", async (e) => {
    e.preventDefault();
    const corpo = Object.fromEntries(new FormData(e.target).entries());
    corpo.id_usuario = Number(corpo.id_usuario);
    const ok = await acao(() => api("adminAlterarUsuario", corpo), "Dados atualizados.");
    if (ok) {
        $("#modalUsuario").close();
        carregarUsuarios();
    }
});

/* =========================================================
   CURSOS / VÍDEOS
   ========================================================= */

let cursos = [];

async function carregarOpcoesCurso() {
    const o = await acao(() => api("adminOpcoesCurso"));
    if (!o) return;
    const opts = (l) => l.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    $("#categoriaCurso").innerHTML = opts(o.categorias);
    $("#nivelCurso").innerHTML = opts(o.niveis);
}

async function carregarCursos() {
    if (!$("#categoriaCurso").options.length) await carregarOpcoesCurso();
    const res = await acao(() => api("adminListarCursos"));
    if (!res) return;
    cursos = res.cursos;
    renderCursos();
}

function renderCursos() {
    const lista = cursos.filter((c) => contem(c.titulo_curso) || contem(c.categoria_curso));

    $("#gradeCursos").innerHTML = lista.length
        ? lista.map((c) => `
        <article class="curso">
            <div class="capa">${c.url_thumb_curso ? `<img src="${esc(c.url_thumb_curso)}" alt="" loading="lazy">` : ""}</div>
            <h4>${esc(c.titulo_curso)}</h4>
            <div>
                <span class="chip">${esc(c.categoria_curso)}</span>
                <span class="chip">${esc(c.nivel_curso)}</span>
            </div>
            <div class="meta">${c.duracao_minutos_curso} min · #${c.id_curso} · ${data(c.criado_em)}</div>
            <a class="link" href="${esc(c.url_video_curso)}" target="_blank" rel="noopener noreferrer">${esc(c.url_video_curso)}</a>
            <div class="rodape">
                <button class="btn btn-claro btn-pq" data-edcur="${c.id_curso}">Editar</button>
                <button class="btn btn-perigo btn-pq" data-delcur="${c.id_curso}">Excluir</button>
            </div>
        </article>`).join("")
        : '<div class="card vazio">Nenhum curso encontrado.</div>';
}

// Se a miniatura não carregar, some e fica o degradê
$("#gradeCursos").addEventListener("error", (e) => {
    if (e.target.tagName === "IMG") e.target.remove();
}, true);

function abrirFormCurso(c) {
    const f = $("#formCurso");
    f.reset();
    f.id_curso.value = c ? c.id_curso : "";
    if (c) {
        f.titulo_curso.value = c.titulo_curso || "";
        f.descricao_curso.value = c.descricao_curso || "";
        f.categoria_curso.value = c.categoria_curso;
        f.nivel_curso.value = c.nivel_curso;
        f.duracao_minutos_curso.value = c.duracao_minutos_curso;
        f.url_video_curso.value = c.url_video_curso || "";
        f.url_thumb_curso.value = c.url_thumb_curso || "";
    }
    $("#tituloFormCurso").textContent = c ? "Editando curso #" + c.id_curso : "Novo curso";
    $("#salvarCurso").textContent = c ? "Salvar alterações" : "Cadastrar curso";
    f.hidden = false;
    f.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fecharFormCurso() {
    $("#formCurso").hidden = true;
    $("#formCurso").reset();
}

$("#btnNovoCurso").addEventListener("click", () => abrirFormCurso(null));
$("#cancelarCurso").addEventListener("click", fecharFormCurso);

$("#formCurso").addEventListener("submit", async (e) => {
    e.preventDefault();
    const corpo = Object.fromEntries(new FormData(e.target).entries());
    const editando = corpo.id_curso !== "";

    if (editando) corpo.id_curso = Number(corpo.id_curso);
    else delete corpo.id_curso;

    const ok = await acao(
        () => api(editando ? "adminAlterarCurso" : "adminCriarCurso", corpo),
        editando ? "Curso atualizado." : "Curso cadastrado."
    );
    if (ok) {
        fecharFormCurso();
        carregarCursos();
    }
});

$("#gradeCursos").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;

    if (b.dataset.edcur) {
        abrirFormCurso(cursos.find((x) => x.id_curso == b.dataset.edcur));
    }

    if (b.dataset.delcur) {
        const c = cursos.find((x) => x.id_curso == b.dataset.delcur);
        if (!confirm(`Excluir o curso "${c.titulo_curso}"?`)) return;
        await acao(() => api("adminExcluirCurso", { id_curso: c.id_curso }), "Curso excluído.");
        carregarCursos();
    }
});

/* =========================================================
   NOTÍCIAS
   ========================================================= */

let noticias = [];

async function carregarNoticias() {
    if (!$("#categoriaNoticia").options.length) {
        const cat = await acao(() => api("adminCategoriasNoticia"));
        if (cat) {
            $("#categoriaNoticia").innerHTML = cat.categorias
                .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
        }
    }

    const res = await acao(() => api("adminListarNoticias"));
    if (!res) return;
    noticias = res.noticias;
    renderNoticias();
}

function renderNoticias() {
    const lista = noticias.filter((n) => contem(n.titulo_noticia) || contem(n.resumo_noticia));

    $("#tabelaNoticias").innerHTML = lista.length
        ? lista.map((n) => `
        <tr>
            <td><strong>${esc(n.titulo_noticia)}</strong>${n.resumo_noticia ? `<br><span class="dica">${esc(n.resumo_noticia)}</span>` : ""}</td>
            <td><span class="chip">${esc(n.categoria_noticia)}</span></td>
            <td class="sec">${data(n.publicada_em)}</td>
            <td class="sec">${esc(n.nome_administrador)}</td>
            <td class="dir"><button class="btn btn-perigo btn-pq" data-delnot="${n.id_noticia}">Excluir</button></td>
        </tr>`).join("")
        : '<tr><td colspan="5" class="vazio">Nenhuma notícia encontrada.</td></tr>';
}

$("#btnNovaNoticia").addEventListener("click", () => {
    $("#formNoticia").hidden = false;
    $("#formNoticia").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#cancelarNoticia").addEventListener("click", () => {
    $("#formNoticia").hidden = true;
    $("#formNoticia").reset();
});

$("#formNoticia").addEventListener("submit", async (e) => {
    e.preventDefault();
    const corpo = Object.fromEntries(new FormData(e.target).entries());
    const ok = await acao(() => api("adminCriarNoticia", corpo), "Notícia publicada.");
    if (ok) {
        e.target.reset();
        e.target.hidden = true;
        carregarNoticias();
    }
});

$("#tabelaNoticias").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-delnot]");
    if (!b || !confirm("Excluir esta notícia?")) return;
    await acao(() => api("adminExcluirNoticia", { id_noticia: Number(b.dataset.delnot) }), "Notícia excluída.");
    carregarNoticias();
});

/* =========================================================
   PERGUNTAS DOS USUÁRIOS
   ========================================================= */

let perguntas = [];
let filtroP = "pendentes";

function atualizarContador(n) {
    const el = $("#contadorPerguntas");
    el.textContent = n;
    el.hidden = !n;
}

async function carregarPerguntas() {
    const res = await acao(() => api("adminListarPerguntas", { filtro: filtroP }));
    if (!res) return;
    perguntas = res.perguntas;
    atualizarContador(res.pendentes);
    renderPerguntas();
}

function renderPerguntas() {
    const lista = perguntas.filter((p) =>
        contem(p.assunto) || contem(p.nome_usuario) || contem(p.email_usuario) || contem(p.mensagem_pergunta)
    );

    $("#listaPerguntas").innerHTML = lista.length
        ? lista.map((p) => {
            const respondida = !!p.resposta_pergunta;
            return `
        <article class="pergunta" data-id="${p.id_pergunta}">
            <div class="cabeca">
                <div>
                    <h4>${esc(p.assunto)}</h4>
                    <div class="quem">${esc(p.nome_usuario)} · ${esc(p.email_usuario)} · ${data(p.criado_em)}</div>
                </div>
                <span class="chip ${respondida ? "ok" : "atencao"}">${respondida ? "Respondida" : "Pendente"}</span>
            </div>
            <p class="texto">${esc(p.mensagem_pergunta)}</p>
            ${respondida ? `<div class="resposta"><small>Respondida por ${esc(p.respondida_por || "administrador")} em ${data(p.respondida_em)}</small></div>` : ""}
            <textarea class="campo" rows="3" placeholder="Escreva a resposta...">${esc(p.resposta_pergunta || "")}</textarea>
            <div class="botoes">
                <button class="btn btn-pq" data-resp="${p.id_pergunta}">${respondida ? "Atualizar resposta" : "Responder"}</button>
                <button class="btn btn-perigo btn-pq" data-delperg="${p.id_pergunta}">Excluir</button>
            </div>
        </article>`;
        }).join("")
        : '<div class="card vazio">Nenhuma pergunta nesta lista.</div>';
}

ligarPilulas("#filtroPerguntas", (f) => { filtroP = f; carregarPerguntas(); });

$("#listaPerguntas").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const item = b.closest(".pergunta");

    if (b.dataset.resp) {
        const texto = item.querySelector("textarea").value.trim();
        if (!texto) { aviso("Escreva a resposta antes de enviar.", true); return; }
        const ok = await acao(
            () => api("adminResponderPergunta", { id_pergunta: Number(b.dataset.resp), resposta_pergunta: texto }),
            "Resposta enviada."
        );
        if (ok) carregarPerguntas();
    }

    if (b.dataset.delperg) {
        if (!confirm("Excluir esta pergunta?")) return;
        await acao(() => api("adminExcluirPergunta", { id_pergunta: Number(b.dataset.delperg) }), "Pergunta excluída.");
        carregarPerguntas();
    }
});

/* =========================================================
   ADMINISTRADORES
   ========================================================= */

let admins = [];

async function carregarAdmins() {
    const res = await acao(() => api("adminListarAdmins"));
    if (!res) return;

    admins = res.administradores;
    meuNivel = res.meu_nivel;
    $("#admNivel").textContent = meuNivel;

    const master = meuNivel === "Master";
    $("#btnNovoAdmin").disabled = !master;
    $("#dicaMaster").hidden = master;
    if (!master) $("#formAdmin").hidden = true;

    renderAdmins();
}

function renderAdmins() {
    const lista = admins.filter((a) => contem(a.nome_administrador) || contem(a.email_administrador));

    $("#tabelaAdmins").innerHTML = lista.length
        ? lista.map((a) => `
        <tr>
            <td><strong>${esc(a.nome_administrador)}</strong></td>
            <td class="sec">${esc(a.email_administrador)}</td>
            <td><span class="chip ${a.nivel === "Master" ? "ok" : ""}">${esc(a.nivel)}</span></td>
            <td class="sec">${data(a.criado_em)}</td>
        </tr>`).join("")
        : '<tr><td colspan="4" class="vazio">Nenhum administrador encontrado.</td></tr>';
}

$("#btnNovoAdmin").addEventListener("click", () => {
    $("#formAdmin").hidden = false;
    $("#formAdmin").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#cancelarAdmin").addEventListener("click", () => {
    $("#formAdmin").hidden = true;
    $("#formAdmin").reset();
});

$("#formAdmin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const corpo = Object.fromEntries(new FormData(e.target).entries());
    const ok = await acao(() => api("adminCriarAdmin", corpo), "Administrador criado.");
    if (ok) {
        e.target.reset();
        e.target.hidden = true;
        carregarAdmins();
    }
});

/* =========================================================
   Início
   ========================================================= */

mostrar(secaoDoHash());

// contador de perguntas pendentes no menu (independe da seção aberta)
acao(() => api("adminListarPerguntas", { filtro: "pendentes" })).then((r) => r && atualizarContador(r.pendentes));