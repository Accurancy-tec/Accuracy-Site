/* Accuracy: visualizacao de venda, sem alterar saldo ou registrar operacao na API. */
(() => {
  "use strict";
  const corpo = document.getElementById("v2Body");
  const tabela = corpo?.closest("table");
  if (!corpo || !tabela || !window.V2Dados) return;
  const fmtDinheiro = new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" });
  const fmtQuantidade = new Intl.NumberFormat("pt-BR", { maximumFractionDigits:8 });
  const dialogo = document.createElement("dialog");
  dialogo.className = "acc-venda-dialogo";
  dialogo.setAttribute("aria-labelledby", "acc-venda-titulo");
  dialogo.innerHTML = `
    <form method="dialog" novalidate class="acc-venda-caixa">
      <div class="acc-venda-cabecalho"><div><span class="acc-venda-etiqueta">Minha carteira</span><h2 id="acc-venda-titulo">Vender ativo</h2></div><button type="submit" value="cancel" class="acc-venda-fechar" aria-label="Fechar">×</button></div>
      <p class="acc-venda-identificacao" id="acc-venda-identificacao"></p>
      <p class="acc-venda-disponivel" id="acc-venda-disponivel"></p>
      <label class="acc-venda-label" for="acc-venda-qtd">Quantidade que deseja vender</label>
      <div class="acc-venda-contador">
        <button class="acc-venda-menos" type="button" aria-label="Diminuir quantidade">−</button>
        <input id="acc-venda-qtd" type="number" step="any" min="0" inputmode="decimal" autocomplete="off" aria-label="Quantidade de unidades para vender">
        <button class="acc-venda-mais" type="button" aria-label="Aumentar quantidade">+</button>
      </div>
      <div class="acc-venda-contador-info"><span id="acc-venda-contagem" aria-live="polite">0 de 0 unidades</span><button type="button" class="acc-venda-maximo">Máximo</button></div>
      <div class="acc-venda-resumo"><span>Valor estimado da venda</span><strong id="acc-venda-total">—</strong></div>
      <p class="acc-venda-alerta">Venda simulada: a API registra a operacao. Confirme apenas se o banco credita vendas no saldo; o site verificara o saldo apos a operacao.</p>
      <div class="acc-venda-acoes-finais">
        <button type="button" class="acc-venda-confirmar">Confirmar venda</button>
        <button type="submit" value="cancel" class="acc-venda-voltar">Cancelar</button>
      </div>
    </form>`;
  document.body.appendChild(dialogo);
  const identificacao = dialogo.querySelector("#acc-venda-identificacao");
  const disponivel = dialogo.querySelector("#acc-venda-disponivel");
  const quantidade = dialogo.querySelector("#acc-venda-qtd");
  const total = dialogo.querySelector("#acc-venda-total");
  const contagem = dialogo.querySelector("#acc-venda-contagem");
  const menos = dialogo.querySelector(".acc-venda-menos");
  const mais = dialogo.querySelector(".acc-venda-mais");
  const maximo = dialogo.querySelector(".acc-venda-maximo");
  const casas = valor => {
    const numero = Number(valor);
    return Number.isInteger(numero) ? 0 : 8;
  };
  const passo = () => (posicao && casas(posicao.quantidade_item) > 0 ? 0.00000001 : 1);
  function alterarQuantidade(direcao) {
    if (!posicao) return;
    const limite = Number(posicao.quantidade_item);
    const atual = Number(quantidade.value) || 0;
    const novo = Math.min(limite, Math.max(0, Math.round((atual + direcao * passo()) * 1e8) / 1e8));
    quantidade.value = novo > 0 ? String(novo) : "";
    atualizarPrevia();
  }
  menos.addEventListener("click", () => alterarQuantidade(-1));
  mais.addEventListener("click", () => alterarQuantidade(1));
  maximo.addEventListener("click", () => {
    if (!posicao) return;
    quantidade.value = String(posicao.quantidade_item);
    atualizarPrevia();
  });
  let posicao = null;
  function atualizarPrevia() {
    if (!posicao) return;
    const qtd = Number(quantidade.value);
    const max = Number(posicao.quantidade_item);
    const valida = Number.isFinite(qtd) && qtd > 0 && qtd <= max;
    quantidade.setCustomValidity(qtd > max ? "Quantidade superior à disponível." : "");
    contagem.textContent = `${fmtQuantidade.format(valida ? qtd : Math.min(Math.max(qtd || 0, 0), max))} de ${fmtQuantidade.format(max)} unidade(s)`;
    menos.disabled = !(qtd > 0);
    mais.disabled = qtd >= max;
    total.textContent = valida ? fmtDinheiro.format(qtd * Number(posicao.cotacao ?? posicao.preco_medio_item)) : "—";
  }
  quantidade.addEventListener("input", atualizarPrevia);
  async function abrirVenda(simbolo) {
    const id = document.querySelector("#v2Wallets .v2-wallet.selected[data-id]")?.dataset.id || localStorage.getItem("accuracy_carteira_ativa");
    if (!id) return;
    try {
      const resumo = await V2Dados.carregar();
      const carteira = resumo.carteiras.find(c => String(c.id_carteira) === String(id));
      const ativo = carteira?.ativos.find(a => String(a.simbolo_ativo) === simbolo);
      if (!ativo || !(Number(ativo.quantidade_item) > 0)) {
        window.V2Toast?.("Não foi possível identificar a posição do ativo.");
        return;
      }
      posicao = ativo;
      contextoVenda = { carteiraId: String(id), simbolo: String(ativo.simbolo_ativo) };
      identificacao.textContent = `${ativo.simbolo_ativo} · ${carteira.nome_carteira}`;
      disponivel.textContent = `Disponível: ${fmtQuantidade.format(ativo.quantidade_item)} unidade(s)`;
      quantidade.value = "";
      quantidade.max = String(ativo.quantidade_item);
      quantidade.step = String(passo());
      atualizarPrevia();
      dialogo.showModal();
      quantidade.focus();
    } catch (erro) {
      console.error("Prévia de venda:", erro);
      window.V2Toast?.("Não foi possível carregar as posições.");
    }
  }
  // ACC_VENDA_REAL_V1 - venda via endpoint ja existente na API, sem alterar PHP.
  const confirmar = dialogo.querySelector(".acc-venda-confirmar");
  let enviando = false;
  let contextoVenda = null;
  const API_VENDA = "https://accuracyappapi.onrender.com";
  function valorNumero(valor) {
    return Number(String(valor ?? "").replace(",", "."));
  }
  async function consultarSaldo(token) {
    const resposta = await fetch(`${API_VENDA}/carteiras/saldo`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
    });
    const dados = await resposta.json();
    if (!resposta.ok || dados.success !== true || !Number.isFinite(Number(dados.saldo_atual))) {
      throw new Error("Nao foi possivel verificar o saldo disponivel.");
    }
    return Number(dados.saldo_atual);
  }
  function obterPosicao(carteira, simbolo) {
    return carteira?.ativos?.find(a => String(a.simbolo_ativo) === String(simbolo));
  }
  // Guardar ID da carteira no momento em que a previa abre.
  const abrirOriginal = abrirVenda;
  // Nao sobrescrever a funcao original: registrar o ID a partir da identificacao quando abrir.
  dialogo.addEventListener("close", () => { if (!enviando) contextoVenda = null; });
  confirmar.addEventListener("click", async () => {
    if (enviando || !posicao || !contextoVenda) {
      window.V2Toast?.("Abra a venda novamente antes de confirmar.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { window.V2Toast?.("Sessao expirada. Entre novamente."); return; }
    const qtd = valorNumero(quantidade.value);
    const max = Number(posicao.quantidade_item);
    const preco = Number(posicao.cotacao ?? posicao.preco_medio_item);
    if (!Number.isFinite(qtd) || qtd <= 0 || qtd > max || !Number.isFinite(preco) || preco <= 0) {
      window.V2Toast?.("Informe uma quantidade valida e confira o preco.");
      return;
    }
    const totalVenda = Number((qtd * preco).toFixed(2));
    if (totalVenda <= 0) { window.V2Toast?.("Valor de venda invalido."); return; }
    if (!window.confirm(`Confirmar a venda simulada de ${fmtQuantidade.format(qtd)} unidade(s) de ${contextoVenda.simbolo} por aproximadamente ${fmtDinheiro.format(totalVenda)}?\n\nA operacao sera registrada na API. O credito no saldo depende das regras atuais do banco.`)) return;
    enviando = true;
    confirmar.disabled = true;
    confirmar.textContent = "Registrando venda...";
    try {
      // Conferir quantidade no servidor antes de registrar.
      const dadosAtuais = await V2Dados.refresh();
      const carteiraAtual = dadosAtuais.carteiras.find(c => String(c.id_carteira) === String(contextoVenda.carteiraId));
      const ativoAtual = obterPosicao(carteiraAtual, contextoVenda.simbolo);
      if (!ativoAtual || qtd > Number(ativoAtual.quantidade_item) + 1e-8) {
        throw new Error("A quantidade disponivel mudou. Atualize a pagina e tente novamente.");
      }
      const saldoAntes = await consultarSaldo(token);
      const payload = {
        ativo_aporte: contextoVenda.simbolo,
        name_ativo: ativoAtual.nome_ativo || contextoVenda.simbolo,
        categoria_ativo: ativoAtual.categoria_ativo || "Outros",
        id_carteira: Number(contextoVenda.carteiraId),
        tipo_aporte: "Venda",
        quantidade_aporte: qtd,
        valor_aporte: totalVenda,
        preco_unitario: preco,
        recorrencia_aporte: "Único",
        observacao_aporte: "Venda pela pagina de carteiras"
      };
      const resposta = await fetch(`${API_VENDA}/aportes/registrar-aporte`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const texto = await resposta.text();
      let dados;
      try { dados = JSON.parse(texto); } catch { throw new Error("A API nao retornou JSON."); }
      if (!resposta.ok || (dados.sucesso !== true && dados.success !== true)) {
        throw new Error(dados.mensagem || dados.message || `Erro HTTP ${resposta.status}`);
      }
      dialogo.close();
      // Nunca repetir POST automaticamente: a venda ja foi confirmada pelo servidor.
      let alerta = "Venda registrada. Confira o saldo atualizado.";
      try {
        const saldoDepois = await consultarSaldo(token);
        const esperado = saldoAntes + totalVenda;
        if (saldoDepois + 0.02 < esperado) {
          alerta = `ATENCAO: venda registrada, mas saldo nao foi creditado integralmente (antes ${fmtDinheiro.format(saldoAntes)}, depois ${fmtDinheiro.format(saldoDepois)}). Nao repita a operacao; revise o banco.`;
        }
      } catch (e) {
        alerta = "Venda registrada, mas nao foi possivel verificar o saldo. Nao repita a venda; confira o historico.";
      }
      alert(alerta);
      window.location.reload();
    } catch (erro) {
      console.error("Venda de ativo:", erro);
      window.V2Toast?.(erro.message || "Falha ao registrar venda.");
    } finally {
      enviando = false;
      confirmar.disabled = false;
      confirmar.textContent = "Confirmar venda";
    }
  });
  // A tabela é reconstruída pela carteira-v2.js a cada seleção; esta função reinsere as ações.
  function adicionarAcoes() {
    const cabecalho = tabela.querySelector("thead tr");
    if (cabecalho && !cabecalho.querySelector(".acc-venda-th")) {
      const th = document.createElement("th");
      th.className = "num acc-venda-th";
      th.textContent = "Ação";
      cabecalho.append(th);
    }
    corpo.querySelectorAll("tr").forEach(linha => {
      if (linha.querySelector(".acc-venda-td")) return;
      const simbolo = linha.querySelector("td:first-child strong")?.textContent?.trim();
      if (!simbolo) {
        const td = linha.querySelector("td[colspan='5']");
        if (td) td.colSpan = 6;
        return;
      }
      const td = document.createElement("td");
      td.className = "num acc-venda-td";
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "acc-venda-acao";
      botao.textContent = "Vender";
      botao.dataset.simbolo = simbolo;
      botao.title = "Abrir prévia de venda";
      td.append(botao);
      linha.append(td);
    });
  }
  let ocupado = false;
  const observer = new MutationObserver(() => {
    if (ocupado) return;
    ocupado = true;
    try { adicionarAcoes(); } finally { ocupado = false; }
  });
  observer.observe(corpo, {childList:true,subtree:true});
  adicionarAcoes();
  corpo.addEventListener("click", event => {
    const botao = event.target.closest(".acc-venda-acao");
    if (botao) abrirVenda(botao.dataset.simbolo);
  });
})();