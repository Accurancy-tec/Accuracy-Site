// Progresso dos cursos: PostgreSQL via API autenticada; sem localStorage de aulas.
(function () {
    "use strict";
    const BASE = window.ACCURACY_API_URL + "/cursos/";
    const porTrilha = new Map();
    const pendentes = new Map();
    const emEnvio = new Map();
    let conta = null;

    function sessao() {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Sessão não encontrada. Entre novamente.");
        const partes = token.split(".");
        const p = JSON.parse(atob(partes[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (p.sub == null) throw new Error("Sessão inválida.");
        const id = String(p.sub);
        if (conta !== null && conta !== id) throw new Error("A conta mudou. Recarregue a página.");
        conta = id;
        return token;
    }
    async function api(rota, options = {}) {
        const token = sessao();
        const resp = await fetch(BASE + rota, {
            ...options, cache: "no-store",
            headers: { Authorization: "Bearer " + token, ...(options.headers || {}) }
        });
        sessao();
        const dados = await resp.json();
        if (!resp.ok || dados.success !== true) throw new Error(dados.message || dados.erro || "HTTP " + resp.status);
        return dados;
    }
    function videoId(url) {
        try {
            const u = new URL(url);
            const host = u.hostname.toLowerCase();
            let id = null;
            if (host === "youtu.be") id = u.pathname.split("/")[1];
            else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
                id = u.searchParams.get("v") || (/^\/(?:embed|shorts)\/([^/]+)/.exec(u.pathname) || [])[1];
            }
            return /^[A-Za-z0-9_-]{11}$/.test(id || "") ? id : null;
        } catch (_) { return null; }
    }
    function lista(id) { return porTrilha.get(String(id)) || []; }
    async function carregar() {
        const dados = await api("progresso");
        if (!Array.isArray(dados.progresso)) throw new Error("Resposta de progresso inválida.");
        const novo = new Map();
        for (const p of dados.progresso) {
            const id = String(p.id_trilha), video = videoId(p.url_video_curso);
            if (!video || !Number.isInteger(Number(p.id_atividade))) throw new Error("Atividade inválida no banco.");
            if (!novo.has(id)) novo.set(id, []);
            if (novo.get(id).some(x => x.video === video)) throw new Error("Atividade repetida na trilha.");
            novo.get(id).push({ ...p, id_atividade: Number(p.id_atividade), video,
                concluido_progresso: p.concluido_progresso === true || p.concluido_progresso === 1 });
        }
        porTrilha.clear();
        for (const [id, itens] of novo) porTrilha.set(id, itens.sort((a,b) => Number(a.ordem_atividade) - Number(b.ordem_atividade)));
    }
    function ler(id) { return lista(id).filter(p => p.concluido_progresso).map(p => p.video); }
    function percentual(feitos, total) { return total > 0 ? Math.min(100, Math.round(100 * feitos / total)) : 0; }
    function atual(id, video) { return lista(id).find(p => p.video === video); }
    function retomar(id) {
        const itens = lista(id);
        const incompletos = itens.filter(p => !p.concluido_progresso);
        const iniciado = incompletos.filter(p => p.atualizado_em && Number(p.ultima_posicao_segundos) > 0)
            .sort((a,b) => String(b.atualizado_em).localeCompare(String(a.atualizado_em)))[0];
        return iniciado || incompletos[0] || itens[0];
    }
    function enviar(item, keepalive) {
        return api("salvar-progresso", {method: "POST", keepalive: !!keepalive,
            headers: {"Content-Type": "application/json"}, body: JSON.stringify(item)});
    }
    function salvar(id, video, pct, segundos, keepalive = false) {
        const atividade = atual(id, video);
        if (!atividade) return Promise.reject(new Error("Vídeo não cadastrado nesta trilha."));
        const k = atividade.id_atividade;
        const anterior = pendentes.get(k);
        const item = {id_atividade: k,
            percentual_progresso: Math.max(anterior ? anterior.percentual_progresso : 0, Math.max(0, Math.min(100, Math.floor(pct)))),
            ultima_posicao_segundos: Math.max(0, Math.floor(segundos))};
        if (!Number.isFinite(item.percentual_progresso) || !Number.isFinite(item.ultima_posicao_segundos)) return Promise.reject(new Error("Posição inválida."));
        pendentes.set(k, item);
        if (emEnvio.has(k)) return emEnvio.get(k);
        const tarefa = (async () => {
            while (pendentes.has(k)) {
                const envio = pendentes.get(k);
                pendentes.delete(k);
                try {
                    const dados = await enviar(envio, keepalive);
                    Object.assign(atividade, dados.progresso);
                } catch (e) {
                    const novo = pendentes.get(k);
                    pendentes.set(k, novo ? {...novo, percentual_progresso: Math.max(novo.percentual_progresso, envio.percentual_progresso)} : envio);
                    throw e;
                }
            }
            return atividade;
        })();
        emEnvio.set(k, tarefa);
        tarefa.then(() => emEnvio.delete(k), () => emEnvio.delete(k));
        return tarefa;
    }
    window.AccuracyProgresso = { carregar, lista, ler, percentual, atual, retomar, salvar };
})();
