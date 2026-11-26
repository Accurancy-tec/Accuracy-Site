/* =========================================================
   DASHBOARD - ACRÉSCIMOS
   (carregar DEPOIS do resumoCarteiras.js e ANTES do
   dashboard-total.js)

   Não altera nenhum arquivo existente. Faz:

   1. spinner de carregamento nos blocos;
   2. cards por categoria com valores reais;
   3. gráfico da evolução (total investido acumulado por mês
      + valor atual da carteira hoje);
   4. data de hoje no cabeçalho.
========================================================= */

(function () {

    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    if (typeof ResumoCarteiras === "undefined") {

        console.error(
            "dashboard-extra.js: coloque este script DEPOIS do resumoCarteiras.js"
        );

        return;
    }

    /* Se o loading.js não estiver na página, o dashboard funciona sem spinner */
    const Carregando = typeof Loading !== "undefined"
        ? Loading
        : { on() { }, off() { } };


    /* =====================================================
       1. UMA SÓ BUSCA DO RESUMO
       O dashboard-total.js e este arquivo usam o mesmo
       ResumoCarteiras.load(); guardamos o resultado para
       não chamar a API duas vezes.
    ===================================================== */

    const carregarOriginal = ResumoCarteiras.load;

    let promessaResumo = null;

    ResumoCarteiras.load = function () {

        if (!promessaResumo) {
            promessaResumo = carregarOriginal();
        }

        return promessaResumo;
    };


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const blocoPrincipal = document.querySelector(".card-big");
    const blocoCards = document.querySelector(".grid");
    const blocoGrafico = document.querySelector(".chart-box");
    const botaoFiltro = document.querySelector(".chart-filter");


    /* =====================================================
       FORMATAÇÃO
    ===================================================== */

    function money(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function moneyCurto(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0
        });
    }


    /* =====================================================
       DATA DE HOJE NO CABEÇALHO
    ===================================================== */

    (function dataDeHoje() {

        const texto = document.querySelector(".v2-page-head p");

        if (!texto) {
            return;
        }

        const hoje = new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        texto.textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);
    })();


    /* =====================================================
       HISTÓRICO DE APORTES (rota nova da API)
    ===================================================== */

    async function carregarHistorico() {

        const token = localStorage.getItem("token");

        if (!token) {
            return [];
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/aportes/historico-aportes`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || data.sucesso !== true) {
                throw new Error(data.mensagem || `HTTP ${response.status}`);
            }

            return (data.aportes || []).filter(a => !a.removido_em);

        } catch (error) {

            console.error("Erro ao buscar histórico de aportes:", error);

            return [];
        }
    }


    /* =====================================================
       2. CARDS POR CATEGORIA
       Posição na tela: 0 Renda fixa | 1 Renda variável |
       2 Cripto | 3 último card (vira "Outros")
    ===================================================== */

    function preencherCards(resumo, cotacoes) {

        const categorias = {
            fixa: 0,
            variavel: 0,
            cripto: 0,
            outros: 0
        };

        resumo.forEach(carteira => {

            carteira.ativos.forEach(item => {

                const cotacao = cotacoes[item.simbolo_ativo];

                const valor = item.quantidade_item * (
                    cotacao !== undefined && cotacao !== null
                        ? Number(cotacao)
                        : item.preco_medio_item
                );

                switch (item.categoria_ativo) {

                    case "Renda Fixa":
                        categorias.fixa += valor;
                        break;

                    case "Ações":
                    case "FIIs":
                        categorias.variavel += valor;
                        break;

                    case "Cripto":
                        categorias.cripto += valor;
                        break;

                    default:
                        categorias.outros += valor;
                }
            });
        });

        const total = categorias.fixa + categorias.variavel +
            categorias.cripto + categorias.outros;

        const lista = [
            ["Renda fixa", categorias.fixa],
            ["Renda variável", categorias.variavel],
            ["Cripto", categorias.cripto],
            ["Outros", categorias.outros]
        ];

        const cards = document.querySelectorAll(".grid .card");

        lista.forEach(([titulo, valor], i) => {

            const card = cards[i];

            if (!card) {
                return;
            }

            const h4 = card.querySelector("h4");
            const p = card.querySelector("p");
            const span = card.querySelector("span");

            if (h4) {
                h4.textContent = titulo;
            }

            if (p) {
                p.textContent = money(valor);
            }

            if (span) {

                const parte = total > 0 ? (valor / total) * 100 : 0;

                span.classList.remove("green", "red");

                span.textContent = `${parte.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                })}% da carteira`;
            }
        });

        return total;
    }


    /* =====================================================
       3. GRÁFICO DA EVOLUÇÃO
    ===================================================== */

    // ACC_CHART_BANK_V2 - substitui apenas a evolucao patrimonial.
    let dadosGrafico = { aportes: [], resumo: [], valorAtual: null };
    let periodoGrafico = '1M';
    let mostrarCapital = true, mostrarMovimentos = true;
    const historicosGrafico = new Map();
    let renderGraficoId = 0;
    const diaMs = 86400000;
    const periodosGrafico = { '7D': 7, '1M': 30, '3M': 90, '6M': 180, '1A': 365 };
    const dataBR = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' });
    function diaGrafico(data) {
        const [d,m,a] = dataBR.format(data).split('/');
        return Date.UTC(+a,+m-1,+d);
    }
    const dataCurta = d => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', timeZone:'UTC' });
    const dataCompleta = d => new Date(d).toLocaleDateString('pt-BR', { timeZone:'UTC' });
    const numeroGrafico = n => n.toLocaleString('pt-BR',{ maximumFractionDigits: 0 });
    const valorGrafico = n => Number.isFinite(n) ? money(n) : '—';
    const sinalGrafico = n => Number.isFinite(n) ? (n > 0 ? '+' : n < 0 ? '−' : '') + money(Math.abs(n)) : '—';
    function operacoesGrafico() {
        return dadosGrafico.aportes.map(a => {
            const data = Date.parse(String(a.data_aporte || '').slice(0,10) + 'T00:00:00Z');
            const tipo = String(a.tipo_aporte || '').toLowerCase();
            const valor = Number(a.valor_aporte);
            const qtd = Number(a.quantidade_aporte);
            const simbolo = String(a.ativo_aporte || a.simbolo_ativo || '').trim();
            const metadados = (dadosGrafico.resumo || []).flatMap(c => c.ativos || []).find(p => String(p.simbolo_ativo || '').toUpperCase() === simbolo.toUpperCase());
            const categoria = String(a.categoria_ativo || metadados?.categoria_ativo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            return { data, tipo, valor, qtd, simbolo, categoria, id: Number(a.id_aporte)||0, carteira: a.id_carteira };
        }).filter(a => Number.isFinite(a.data) && Number.isFinite(a.valor) && a.valor >= 0 && ['compra','venda','dividendo'].includes(a.tipo)).sort((a,b)=>a.data-b.data || a.id-b.id);
    }
    function rotaGrafico(a) {
        if (a.categoria === 'renda fixa') return 'fixa';
        if (a.categoria === 'fiis' || a.categoria === 'fii') return 'historico-acoes';
        if (a.categoria === 'acoes' || a.categoria === 'acao') return 'historico-acoes';
        if (a.categoria === 'cripto' || a.categoria === 'criptomoedas') return 'historico-criptomoedas';
        if (a.categoria === 'moedas' || a.categoria === 'cambio' || /^(USD|EUR|GBP|JPY|CHF|CAD|AUD|CNY|ARS|BRL)[-\/]?BRL$/.test(a.simbolo.toUpperCase())) return 'historico-moedas';
        if (a.categoria === 'futuros') return 'historico-futuros';
        try {
            const rota = (window.ASSET_ROTA || {})[a.simbolo] || (JSON.parse(localStorage.getItem('accuracy_rotas_cotacao') || '{}') || {})[a.simbolo];
            if (rota === 'moedas') return 'historico-moedas';
            if (rota === 'cripto') return 'historico-criptomoedas';
            if (rota === 'futuros') return 'historico-futuros';
            if (rota === 'acao' && a.categoria !== 'internacional') return 'historico-acoes';
        } catch (_) {}
        if (/^[A-Z]{4}\d{1,2}$/.test(a.simbolo.toUpperCase())) return 'historico-acoes';
        return null;
    }
    async function buscarHistoricoGrafico(a, range) {
        const rota = rotaGrafico(a);
        if (!rota || rota === 'fixa' || !a.simbolo) return [];
        const chave = rota + ':' + a.simbolo + ':' + range;
        if (!historicosGrafico.has(chave)) {
            const tarefa = (async () => {
                const ctrl = new AbortController();
                const timer = setTimeout(()=>ctrl.abort(), 12000);
                try {
                    const resp = await fetch(`${API_BASE_URL}/brapi/${rota}?symbol=${encodeURIComponent(a.simbolo)}&range=${range}`, {signal:ctrl.signal});
                    if (!resp.ok) throw new Error('HTTP '+resp.status);
                    const json = await resp.json();
                    const item = json.results && json.results[0];
                    const pontos = item && (item.historicalDataPrice || item.data?.historicalDataPrice || item.prices || item.history || item.historical || item.data);
                    if (!Array.isArray(pontos)) return [];
                    return pontos.map(p=>{
                        const bruto = p.date ?? p.datetime ?? p.time;
                        let t = typeof bruto === 'number' || (typeof bruto === 'string' && /^\d+$/.test(bruto)) ? Number(bruto) : Date.parse(bruto);
                        if (t < 1e11) t *= 1000;
                        return { data: Math.floor(t/diaMs)*diaMs, preco: Number(p.close ?? p.adjustedClose ?? p.price) };
                    }).filter(p=>Number.isFinite(p.data)&&Number.isFinite(p.preco)&&p.preco>0).sort((p,q)=>p.data-q.data);
                } catch(e) { console.warn('Historico indisponivel:',a.simbolo,e); return []; }
                finally { clearTimeout(timer); }
            })();
            historicosGrafico.set(chave,tarefa);
        }
        const resultado = await historicosGrafico.get(chave);
        if (!resultado.length) historicosGrafico.delete(chave);
        return resultado;
    }
    async function serieGrafico(ops, inicio, hoje, range) {
        const ativos = new Map();
        const chave = a => rotaGrafico(a) + ':' + a.simbolo.toUpperCase();
        ops.forEach(a=>{ if(a.tipo!=='dividendo') ativos.set(chave(a),a); });
        const fila = Array.from(ativos.entries());
        const precos = new Map();
        let cursor = 0;
        await Promise.all(Array.from({length:Math.min(3,fila.length)},async()=>{
            while(cursor<fila.length){ const [k,a]=fila[cursor++]; precos.set(k,await buscarHistoricoGrafico(a,range)); }
        }));
        const pos = new Map(), saida = [];
        let capital = 0, dividendos = 0, i = 0, comprasTotais = 0;
        let erroQuantidade = false;
        for(let d=Math.min(inicio,ops.length?ops[0].data:inicio);d<=hoje;d+=diaMs){
            let compra=0,venda=0,div=0;
            while(i<ops.length && ops[i].data<=d){
                const a=ops[i++];
                if(a.tipo==='dividendo'){ dividendos+=a.valor; div+=a.valor; continue; }
                const sinal=a.tipo==='venda'?-1:1;
                capital+=sinal*a.valor;
                if(sinal>0){compra+=a.valor;comprasTotais+=a.valor;}else venda+=a.valor;
                const k=chave(a), p=pos.get(k)||{q:0,rota:rotaGrafico(a),k,idx:-1};
                const quantidade=p.rota==='fixa'?a.valor:a.qtd;
                if(!Number.isFinite(quantidade)||quantidade<=0||!a.simbolo) erroQuantidade=true;
                else p.q+=sinal*quantidade;
                if(p.q < -1e-7) erroQuantidade=true;
                pos.set(k,p);
            }
            if(d<inicio) continue;
            let patrimonio=0, valido=!erroQuantidade, fixa=false;
            for(const p of pos.values()){
                if(p.q<=1e-9) continue;
                if(p.rota==='fixa'){ patrimonio+=p.q; fixa=true; continue; }
                const lista=precos.get(p.k)||[];
                while(p.idx+1<lista.length && lista[p.idx+1].data<=d) p.idx++;
                const cot=lista[p.idx];
                // Nao preencher datas anteriores a primeira cotacao ou lacunas longas.
                if(!cot || d-cot.data>7*diaMs){valido=false;continue;}
                patrimonio+=p.q*cot.preco;
            }
            saida.push({d,capital,dividendos,comprasTotais,compra,venda,div,p:valido?patrimonio:null,fixa});
        }
        const atual=dadosGrafico.valorAtual;
        if(saida.length && atual!==null && Number.isFinite(Number(atual))) saida[saida.length-1].p=Number(atual);
        return saida;
    }
    function desenharGrafico(){
        if(!blocoGrafico) return;
        const id=++renderGraficoId;
        const hoje=diaGrafico(new Date());
        const ops=operacoesGrafico().filter(a=>a.data<=hoje);
        if(!ops.length){blocoGrafico.innerHTML='<div class="chart-placeholder"><i class="bi bi-graph-up-arrow"></i><span>Nenhuma movimentação disponível para o gráfico.</span></div>';return;}
        if(botaoFiltro) botaoFiltro.style.display='none';
        const inicio=hoje-(periodosGrafico[periodoGrafico]-1)*diaMs;
        const range=periodoGrafico==='1A'?'1y':periodoGrafico==='6M'?'1y':periodoGrafico==='3M'?'6mo':'3mo';
        const ultimoCapital=ops.reduce((s,a)=>s+(a.tipo==='compra'?a.valor:a.tipo==='venda'?-a.valor:0),0);
        const dividendos=ops.reduce((s,a)=>s+(a.tipo==='dividendo'?a.valor:0),0);
        const atual=dadosGrafico.valorAtual===null?null:Number(dadosGrafico.valorAtual);
        const resultado=Number.isFinite(atual)?atual+dividendos-ultimoCapital:null;
        const percentual=Number.isFinite(resultado)&&ultimoCapital>0?resultado/ultimoCapital*100:null;
        const pct=Number.isFinite(percentual)?`${percentual>0?'+':''}${percentual.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}%`:'—';
        const cor=resultado===null?'#92a7c0':resultado>=0?'#35d4a5':'#f17d8b';
        const card=(label,v,c='#e8f0ff')=>`<div class="acc-bank-card"><span>${label}</span><strong style="color:${c}">${v}</strong></div>`;
        blocoGrafico.innerHTML=`<style>
        .chart:has(.acc-bank){background:#0c1627!important;border-color:#25364d!important}.chart-box:has(.acc-bank){height:auto!important;min-height:0!important;display:block!important;overflow:visible!important}.acc-bank{width:100%;min-width:0;color:#e8f0ff;display:grid;gap:16px;font-family:Inter,Arial,sans-serif}.acc-bank *{box-sizing:border-box}.acc-bank-caption{color:#91a6c1;font-size:12px}.acc-bank-value{font-size:clamp(24px,3vw,36px);font-weight:750;letter-spacing:-.03em;color:#f0f5ff}.acc-bank-result{font-size:13px;margin-top:4px}.acc-bank-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.acc-bank-card{background:#101c2e;border:1px solid #25364d;border-radius:10px;padding:12px;min-width:0;display:grid;gap:6px}.acc-bank-card span{font-size:12px;color:#94a9c4}.acc-bank-card strong{font-size:clamp(14px,1.5vw,19px);overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.acc-bank-tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;border-top:1px solid #26364b;padding-top:12px}.acc-bank-periods,.acc-bank-checks{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.acc-bank-periods button{background:transparent;border:0;border-radius:6px;color:#94a9c4;padding:7px 11px;cursor:pointer;font:600 12px Inter,Arial,sans-serif}.acc-bank-periods button[aria-pressed=true]{background:#1c3658;color:#8dbfff}.acc-bank-checks label{display:flex;gap:5px;align-items:center;color:#9eb3ce;font-size:12px;cursor:pointer}.acc-bank-checks input{accent-color:#438ff5}.acc-bank-plot{position:relative;min-width:0;padding:12px;background:#101b2d;border:1px solid #1c2d44;border-radius:12px}.acc-bank-plot svg{display:block;width:100%;height:auto;touch-action:pan-y}.acc-bank-tip{position:absolute;top:10px;background:#15263f;border:1px solid #385579;border-radius:8px;color:#e8f0ff;padding:10px 12px;z-index:4;pointer-events:none;font-size:12px;line-height:1.55;max-width:90%;box-shadow:0 8px 25px #0005}.acc-bank-tip[hidden]{display:none}.acc-bank-note{color:#8ea5bf;font-size:11px;line-height:1.5}.acc-bank-loading{padding:85px 12px;text-align:center;color:#9cb3d1;font-size:13px}.acc-bank-axis{font-size:12px;fill:#96a9c3}.acc-bank-plot svg:focus{outline:1px solid #4b94f5;outline-offset:2px}@media(max-width:760px){.acc-bank-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.acc-bank-plot{padding:3px}.acc-bank-axis{font-size:15px}.acc-bank-tools{gap:8px}} 
        </style><div class="acc-bank"><div><div class="acc-bank-caption">Patrimônio atual da carteira</div><div class="acc-bank-value">${valorGrafico(atual)}</div><div class="acc-bank-result" style="color:${cor}">${sinalGrafico(resultado)} · ${pct} de resultado simples acumulado</div></div><div class="acc-bank-cards">${card('Compras líquidas',money(ultimoCapital))}${card('Resultado acumulado',sinalGrafico(resultado),cor)}${card('Maior patrimônio no período','—')}${card('Menor patrimônio no período','—')}</div><div class="acc-bank-tools"><div class="acc-bank-periods">${Object.keys(periodosGrafico).map(p=>`<button type="button" data-periodo="${p}" aria-pressed="${p===periodoGrafico}">${p}</button>`).join('')}</div><div class="acc-bank-checks"><label><input type="checkbox" data-capital ${mostrarCapital?'checked':''}> Compras líquidas</label><label><input type="checkbox" data-mov ${mostrarMovimentos?'checked':''}> Movimentações</label></div></div><div class="acc-bank-plot"><div class="acc-bank-loading">Consultando histórico de cotações...</div></div><div class="acc-bank-note">Linha azul: patrimônio • Linha azul-acinzentada: compras líquidas • Barras verdes: compras • Vermelhas: vendas • Douradas: dividendos.</div></div>`;
        const raiz=blocoGrafico.querySelector('.acc-bank');
        raiz.querySelectorAll('[data-periodo]').forEach(b=>b.addEventListener('click',()=>{periodoGrafico=b.dataset.periodo;desenharGrafico();}));
        raiz.querySelector('[data-capital]').addEventListener('change',e=>{mostrarCapital=e.target.checked;desenharGrafico();});
        raiz.querySelector('[data-mov]').addEventListener('change',e=>{mostrarMovimentos=e.target.checked;desenharGrafico();});
        serieGrafico(ops,inicio,hoje,range).then(serie=>{
            if(id!==renderGraficoId||!raiz.isConnected)return;
            pintarSerieGrafico(raiz,serie);
        }).catch(e=>{if(id===renderGraficoId){raiz.querySelector('.acc-bank-plot').textContent='Não foi possível montar o histórico.';console.error(e);}});
    }
    function pintarSerieGrafico(raiz,serie){
        const validos=serie.map(p=>p.p).filter(Number.isFinite);
        const cards=raiz.querySelectorAll('.acc-bank-card strong');
        cards[2].textContent=validos.length?money(Math.max(...validos)):'—';
        cards[3].textContent=validos.length?money(Math.min(...validos)):'—';
        const plot=raiz.querySelector('.acc-bank-plot');
        const n=serie.length, W=1000, left=25, right=890, top=24, bottom=330, H=mostrarMovimentos?490:380;
        const valores=[...validos,...(mostrarCapital?serie.map(p=>p.capital):[])];
        const min=Math.min(...(valores.length?valores:[0])), max=Math.max(...(valores.length?valores:[1]));
        const margem=Math.max((max-min)*.12,Math.abs(max)*.015,1);
        const low=min-margem,high=max+margem;
        const x=i=>left+i*(right-left)/Math.max(1,n-1), y=v=>bottom-(v-low)/(high-low)*(bottom-top);
        const linhas=Array.from({length:6},(_,i)=>{const v=low+(high-low)*i/5;return `<line x1="${left}" x2="${right}" y1="${y(v)}" y2="${y(v)}" stroke="#26384f" stroke-width=".9"/>${Number.isFinite(serie[n-1].p)&&Math.abs(y(v)-y(serie[n-1].p))<19?'':`<text x="${right+14}" y="${y(v)+4}" class="acc-bank-axis">${numeroGrafico(v)}</text>`}`;}).join('');
        let segmentos=[], seg=[];
        serie.forEach((p,i)=>{if(Number.isFinite(p.p))seg.push([x(i),y(p.p)]);else if(seg.length){segmentos.push(seg);seg=[];}});if(seg.length)segmentos.push(seg);
        const caminho=s=>s.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
        const areas=segmentos.filter(s=>s.length>1).map(s=>`<path d="${caminho(s)} L${s[s.length-1][0]} ${bottom} L${s[0][0]} ${bottom} Z" fill="url(#acc-bank-area)"/>`).join('');
        const linhasPat=segmentos.map(s=>s.length===1?`<circle cx="${s[0][0]}" cy="${s[0][1]}" r="3.5" fill="#65aaff"/>`:`<path d="${caminho(s)}" fill="none" stroke="#4b96ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('');
        const capital=mostrarCapital?`<path d="M${x(0)} ${y(serie[0].capital)}${serie.slice(1).map((p,i)=>` H${x(i+1)} V${y(p.capital)}`).join('')}" stroke="#58779f" stroke-width="1.6" fill="none" vector-effect="non-scaling-stroke"/>`:'';
        const ultimo=serie[n-1];
        const etiqueta=Number.isFinite(ultimo.p)?`<line x1="${left}" x2="${right}" y1="${y(ultimo.p)}" y2="${y(ultimo.p)}" stroke="#3a6ca7" opacity=".5"/><circle cx="${right}" cy="${y(ultimo.p)}" r="4" fill="#65aaff"/><rect x="${right+3}" y="${y(ultimo.p)-12}" width="104" height="24" rx="4" fill="#2865b6"/><text x="${right+55}" y="${y(ultimo.p)+4}" fill="#f3f7ff" font-size="12" font-weight="600" text-anchor="middle">${ultimo.p.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</text>`:'';
        const movMax=Math.max(1,...serie.flatMap(p=>[p.compra+p.div,p.venda]));
        const zero=427, escala=40/movMax, bw=Math.max(2,Math.min(11,(right-left)/n*.7));
        const barras=mostrarMovimentos?`<line x1="${left}" x2="${right}" y1="350" y2="350" stroke="#293b53"/><text x="${left}" y="367" class="acc-bank-axis">Movimentações financeiras (R$)</text><line x1="${left}" x2="${right}" y1="${zero}" y2="${zero}" stroke="#34465e"/><text x="${right+14}" y="391" class="acc-bank-axis">+${numeroGrafico(movMax)}</text><text x="${right+14}" y="431" class="acc-bank-axis">0</text>${serie.map((p,i)=>{let b='';if(p.compra)b+=`<rect x="${x(i)-bw/2}" y="${zero-p.compra*escala}" width="${bw}" height="${p.compra*escala}" rx="1" fill="#2ab899"/>`;if(p.div)b+=`<rect x="${x(i)-bw/2}" y="${zero-(p.compra+p.div)*escala}" width="${bw}" height="${p.div*escala}" rx="1" fill="#e6b85f"/>`;if(p.venda)b+=`<rect x="${x(i)-bw/2}" y="${zero}" width="${bw}" height="${p.venda*escala}" rx="1" fill="#e87989"/>`;return b;}).join('')}`:'';
        const marcadores=mostrarMovimentos?serie.map((p,i)=>Number.isFinite(p.p)&&(p.compra||p.venda||p.div)?`<circle cx="${x(i)}" cy="${y(p.p)}" r="4" fill="#101b2d" stroke="${p.venda?'#e87989':p.compra?'#39d4ae':'#e6b85f'}" stroke-width="1.5"/>`:'').join(''):'';
        const ticks=Array.from({length:6},(_,i)=>Math.round(i*(n-1)/5));
        plot.innerHTML=`<svg viewBox="0 0 ${W} ${H}" tabindex="0" role="img" aria-label="Evolução diária do patrimônio. Use as setas para consultar datas."><defs><linearGradient id="acc-bank-area" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#347ff0" stop-opacity=".3"/><stop offset="100%" stop-color="#347ff0" stop-opacity="0"/></linearGradient></defs>${linhas}${areas}${capital}${linhasPat}${marcadores}<line x1="${right}" x2="${right}" y1="${top}" y2="${mostrarMovimentos?467:bottom}" stroke="#36547b"/>${etiqueta}${barras}${ticks.map((i,j)=>`<text x="${x(i)}" y="${H-9}" text-anchor="${j===0?'start':j===5?'end':'middle'}" class="acc-bank-axis">${dataCurta(serie[i].d)}</text>`).join('')}<line data-cross x1="${right}" x2="${right}" y1="${top}" y2="${mostrarMovimentos?467:bottom}" stroke="#5189c9" stroke-width="1" visibility="hidden"/><circle data-dot r="4" fill="#7dbaff" stroke="#264f83" stroke-width="1.5" visibility="hidden"/></svg><div class="acc-bank-tip" role="status" hidden></div>`;
        const nota=raiz.querySelector('.acc-bank-note');
        if(validos.length<n)nota.textContent+=' Datas sem cotação suficiente ficam sem linha patrimonial.';
        if(serie.some(p=>p.fixa))nota.textContent+=' Renda fixa contabilizada pelo principal aplicado, sem juros históricos.';
        nota.textContent+=' Patrimônio histórico reconstruído pelas operações e preços de fechamento. Valor atual segue o cálculo do dashboard (pode usar preço médio quando não há cotação). Resultado simples inclui dividendos, não é rentabilidade ponderada.';
        const svg=plot.querySelector('svg'), tip=plot.querySelector('.acc-bank-tip'), cross=svg.querySelector('[data-cross]'), dot=svg.querySelector('[data-dot]');
        let ativo=n-1;
        function show(i){ativo=Math.max(0,Math.min(n-1,i));const p=serie[ativo];const xx=x(ativo);cross.setAttribute('x1',xx);cross.setAttribute('x2',xx);cross.setAttribute('visibility','visible');dot.setAttribute('cx',xx);dot.setAttribute('cy',Number.isFinite(p.p)?y(p.p):0);dot.setAttribute('visibility',Number.isFinite(p.p)?'visible':'hidden');tip.innerHTML=`<strong>${dataCompleta(p.d)}</strong><br>Patrimônio: ${valorGrafico(p.p)}<br>Compras líquidas: ${money(p.capital)}<br>Resultado acumulado: ${sinalGrafico(Number.isFinite(p.p)?p.p+p.dividendos-p.capital:null)}<br>Compras: ${money(p.compra)} · Vendas: ${money(p.venda)}<br>Dividendos: ${money(p.div)}`;tip.hidden=false;const r=svg.getBoundingClientRect();const pr=plot.getBoundingClientRect();const px=r.left-pr.left+xx/W*r.width;tip.style.left=Math.max(4,Math.min(pr.width-tip.offsetWidth-4,px-tip.offsetWidth/2))+'px';}
        function hide(){tip.hidden=true;cross.setAttribute('visibility','hidden');dot.setAttribute('visibility','hidden');}
        function ponteiro(e){const r=svg.getBoundingClientRect();show(Math.round(((e.clientX-r.left)/r.width*W-left)/(right-left)*(n-1)));}
        svg.addEventListener('pointermove',ponteiro);svg.addEventListener('pointerdown',ponteiro);svg.addEventListener('pointerleave',hide);svg.addEventListener('blur',hide);svg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(ativo+(e.key==='ArrowLeft'?-1:1));}if(e.key==='Escape')hide();});
    }


    /* =====================================================
       INICIAR
    ===================================================== */

    Carregando.on(blocoPrincipal);
    Carregando.on(blocoCards, { spinner: false });
    Carregando.on(blocoGrafico);

    (async function iniciar() {

        try {

            const [resumo, aportes] = await Promise.all([
                ResumoCarteiras.load(),
                carregarHistorico()
            ]);
            console.log("aportes do gráfico:", aportes);

            const simbolos = [
                ...new Set(resumo.flatMap(c => c.ativos.map(a => a.simbolo_ativo)))
            ];

            let cotacoes = {};

            if (typeof Cotacoes !== "undefined" && simbolos.length) {
                cotacoes = await Cotacoes.fetch(simbolos);
            }

            const totalInvestimentos = preencherCards(resumo, cotacoes);

            dadosGrafico = {
                aportes,
                resumo,
                valorAtual: simbolos.length || aportes.length ? totalInvestimentos : null
            };

            desenharGrafico();

        } catch (error) {

            console.error("Erro ao montar o dashboard:", error);

        } finally {

            Carregando.off(blocoPrincipal);
            Carregando.off(blocoCards);
            Carregando.off(blocoGrafico);
        }
    })();

})();
(function () {

    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    const cards = document.querySelectorAll(".grid .card");

    if (!cards.length) {
        return;
    }

    let distribuicao = null;
    let dashboardPintou = false;
    let aplicado = false;
    let observador = null;

    function dinheiro(valor) {
        return (Number(valor) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    /* mesma ordem dos cards: 0 Renda fixa | 1 Renda variável | 2 Cripto | 3 Outros */
    function indiceDoCard(categoria) {

        switch (categoria) {
            case "Renda Fixa": return 0;
            case "Ações":
            case "FIIs": return 1;
            case "Cripto": return 2;
            default: return 3;
        }
    }

    function aplicar() {

        if (aplicado || !distribuicao) {
            return;
        }

        aplicado = true;

        if (observador) {
            observador.disconnect();
        }

        const valores = [0, 0, 0, 0];

        distribuicao.itens.forEach(item => {
            valores[indiceDoCard(item.categoria)] += Number(item.valor) || 0;
        });

        const total = valores.reduce((soma, v) => soma + v, 0);

        valores.forEach((valor, i) => {

            const p = cards[i] && cards[i].querySelector("p");
            const span = cards[i] && cards[i].querySelector("span");

            if (p) {
                p.textContent = dinheiro(valor);
            }

            if (span) {

                const parte = total > 0 ? (valor / total) * 100 : 0;

                span.textContent = `${parte.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                })}% da carteira`;
            }
        });
    }

    /* espera o código acima pintar os cards primeiro, para o nosso valor ficar por cima */
    function observarCards() {

        observador = new MutationObserver(() => {
            dashboardPintou = true;
            aplicar();
        });

        cards.forEach(card => {
            observador.observe(card, { childList: true, characterData: true, subtree: true });
        });

        /* se o dashboard não mexer nos cards, aplica mesmo assim depois de um tempo */
        setTimeout(() => {
            dashboardPintou = true;
            aplicar();
        }, 8000);
    }

    async function carregar() {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const resposta = await fetch(`${API_BASE_URL}/carteiras/distribuicao`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const dados = await resposta.json();

            if (!resposta.ok || dados.sucesso !== true) {
                throw new Error(dados.mensagem || `HTTP ${resposta.status}`);
            }

            distribuicao = { itens: dados.distribuicao || [] };

            if (dashboardPintou) {
                aplicar();
            }

        } catch (erro) {
            console.error("Erro ao buscar a distribuição da carteira:", erro);
        }
    }

    observarCards();
    carregar();

})();