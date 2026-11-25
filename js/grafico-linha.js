/* =========================================================
   GRÁFICO DE LINHA (SVG)

   GraficoLinha.desenhar(elemento, pontos, opcoes)
     pontos : [{ data: "2026-11-25", valor: 1234.5 }, ...]
     opcoes : { altura, formatarValor, formatarData, rotulo }

   - Ocupa a largura do elemento e se redesenha ao redimensionar.
   - A linha "se forma" da esquerda para a direita ao aparecer.
   - Passando o mouse (ou o dedo) mostra a data e o valor do ponto.
   - Setas do teclado percorrem os pontos quando o gráfico tem foco.
========================================================= */
const GraficoLinha = (function () {
    "use strict";

    const NS = "http://www.w3.org/2000/svg";
    const MARGEM = { topo: 16, direita: 14, baixo: 28, esquerda: 64 };
    let sequencia = 0;

    const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const moedaCurta = new Intl.NumberFormat("pt-BR", {
        style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1
    });

    function dataLonga(iso) {
        const [a, m, d] = String(iso).split("-").map(Number);
        return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
    }

    function dataCurta(iso) {
        const [a, m, d] = String(iso).split("-").map(Number);
        return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(/\./g, "");
    }

    function svg(tag, atributos = {}) {
        const el = document.createElementNS(NS, tag);
        Object.entries(atributos).forEach(([chave, valor]) => el.setAttribute(chave, valor));
        return el;
    }

    /* Valores "redondos" para as linhas de grade */
    function escala(minimo, maximo, divisoes = 4) {
        if (minimo === maximo) {
            const folga = Math.abs(minimo) * 0.1 || 1;
            minimo -= folga;
            maximo += folga;
        }

        const bruto = (maximo - minimo) / divisoes;
        const potencia = Math.pow(10, Math.floor(Math.log10(bruto)));
        const passo = [1, 2, 2.5, 5, 10].map(f => f * potencia).find(p => p >= bruto) || bruto;
        const inicio = Math.floor(minimo / passo) * passo;
        const fim = Math.ceil(maximo / passo) * passo;
        const linhas = [];

        for (let v = inicio; v <= fim + passo / 2; v += passo) {
            linhas.push(Number(v.toFixed(6)));
        }

        return { inicio, fim, linhas };
    }

    function desenhar(elemento, pontos, opcoes = {}) {
        if (!elemento) return;

        const config = {
            altura: 240,
            formatarValor: v => moeda.format(v),
            formatarData: dataLonga,
            rotulo: "Evolução do patrimônio",
            ...opcoes
        };

        if (elemento._graficoObservador) {
            elemento._graficoObservador.disconnect();
        }

        const id = `grafico-${++sequencia}`;
        let primeiraVez = true;

        function montar() {
            const largura = Math.max(280, elemento.clientWidth);
            const altura = config.altura;
            const areaL = largura - MARGEM.esquerda - MARGEM.direita;
            const areaA = altura - MARGEM.topo - MARGEM.baixo;

            const valores = pontos.map(p => p.valor);
            const { inicio, fim, linhas } = escala(Math.min(...valores), Math.max(...valores));
            const x = i => MARGEM.esquerda + (pontos.length === 1 ? areaL / 2 : (i / (pontos.length - 1)) * areaL);
            const y = v => MARGEM.topo + areaA - ((v - inicio) / (fim - inicio || 1)) * areaA;

            const raiz = svg("svg", {
                viewBox: `0 0 ${largura} ${altura}`,
                width: largura,
                height: altura,
                class: "grafico-linha",
                role: "img",
                "aria-label": `${config.rotulo}: de ${config.formatarValor(valores[0])} em ${config.formatarData(pontos[0].data)} para ${config.formatarValor(valores[valores.length - 1])} em ${config.formatarData(pontos[pontos.length - 1].data)}`
            });

            const defs = svg("defs");
            const gradiente = svg("linearGradient", { id: `${id}-area`, x1: 0, y1: 0, x2: 0, y2: 1 });
            gradiente.append(
                svg("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": .22 }),
                svg("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": 0 })
            );
            defs.appendChild(gradiente);
            raiz.appendChild(defs);

            // Grade e valores do eixo Y
            const grade = svg("g", { class: "grafico-grade" });
            linhas.forEach(v => {
                const py = y(v);
                grade.appendChild(svg("line", { x1: MARGEM.esquerda, x2: largura - MARGEM.direita, y1: py, y2: py }));
                const texto = svg("text", { x: MARGEM.esquerda - 10, y: py + 4, "text-anchor": "end" });
                texto.textContent = moedaCurta.format(v);
                grade.appendChild(texto);
            });

            // Datas do eixo X (até 5, espaçadas)
            const quantasDatas = Math.min(5, pontos.length);
            for (let k = 0; k < quantasDatas; k++) {
                const i = quantasDatas === 1 ? 0 : Math.round((k / (quantasDatas - 1)) * (pontos.length - 1));
                const texto = svg("text", {
                    x: x(i),
                    y: altura - 8,
                    "text-anchor": k === 0 ? "start" : (k === quantasDatas - 1 ? "end" : "middle")
                });
                texto.textContent = dataCurta(pontos[i].data);
                grade.appendChild(texto);
            }
            raiz.appendChild(grade);

            // Linha e área
            const caminho = pontos.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ");
            const base = MARGEM.topo + areaA;
            const area = svg("path", {
                d: `${caminho} L${x(pontos.length - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`,
                fill: `url(#${id}-area)`,
                class: "grafico-area"
            });
            const linha = svg("path", { d: caminho, class: "grafico-traco", fill: "none" });
            raiz.append(area, linha);

            // Marcador do ponto escolhido
            const guia = svg("line", { class: "grafico-guia", y1: MARGEM.topo, y2: base, x1: 0, x2: 0, visibility: "hidden" });
            const ponto = svg("circle", { class: "grafico-ponto", r: 5, cx: 0, cy: 0, visibility: "hidden" });
            raiz.append(guia, ponto);

            const dica = document.createElement("div");
            dica.className = "grafico-dica";
            dica.hidden = true;

            elemento.replaceChildren(raiz, dica);
            elemento.tabIndex = 0;

            // Formação da linha: só na primeira vez (redimensionar não repete a animação)
            if (primeiraVez && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                const comprimento = linha.getTotalLength();
                linha.style.strokeDasharray = comprimento;
                linha.style.strokeDashoffset = comprimento;
                area.style.opacity = 0;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    linha.classList.add("desenhando");
                    area.classList.add("desenhando");
                    linha.style.strokeDashoffset = 0;
                    area.style.opacity = 1;
                }));
            }
            primeiraVez = false;

            let indiceAtual = -1;

            function mostrar(i) {
                indiceAtual = i;
                const px = x(i);
                const py = y(pontos[i].valor);

                guia.setAttribute("x1", px);
                guia.setAttribute("x2", px);
                ponto.setAttribute("cx", px);
                ponto.setAttribute("cy", py);
                guia.setAttribute("visibility", "visible");
                ponto.setAttribute("visibility", "visible");

                dica.innerHTML = "";
                const dataEl = document.createElement("span");
                dataEl.textContent = config.formatarData(pontos[i].data);
                const valorEl = document.createElement("strong");
                valorEl.textContent = config.formatarValor(pontos[i].valor);
                dica.append(dataEl, valorEl);
                dica.hidden = false;

                const escalaReal = elemento.clientWidth / largura;
                const esquerda = Math.min(Math.max(px * escalaReal - dica.offsetWidth / 2, 0), elemento.clientWidth - dica.offsetWidth);
                dica.style.transform = `translate(${esquerda}px, ${Math.max(py * escalaReal - dica.offsetHeight - 14, 0)}px)`;
            }

            function esconder() {
                indiceAtual = -1;
                guia.setAttribute("visibility", "hidden");
                ponto.setAttribute("visibility", "hidden");
                dica.hidden = true;
            }

            function indicePelaPosicao(evento) {
                const caixa = raiz.getBoundingClientRect();
                const px = ((evento.clientX - caixa.left) / caixa.width) * largura;
                const relativo = (px - MARGEM.esquerda) / areaL;
                return Math.min(pontos.length - 1, Math.max(0, Math.round(relativo * (pontos.length - 1))));
            }

            raiz.addEventListener("pointermove", e => mostrar(indicePelaPosicao(e)));
            raiz.addEventListener("pointerdown", e => mostrar(indicePelaPosicao(e)));
            raiz.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") esconder(); });
            elemento.onkeydown = e => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                const inicioTeclado = indiceAtual < 0 ? pontos.length - 1 : indiceAtual;
                mostrar(Math.min(pontos.length - 1, Math.max(0, inicioTeclado + (e.key === "ArrowRight" ? 1 : -1))));
            };
            elemento.onblur = esconder;
        }

        montar();

        let larguraAnterior = elemento.clientWidth;
        elemento._graficoObservador = new ResizeObserver(() => {
            if (Math.abs(elemento.clientWidth - larguraAnterior) > 4) {
                larguraAnterior = elemento.clientWidth;
                montar();
            }
        });
        elemento._graficoObservador.observe(elemento);
    }

    return { desenhar };
})();
