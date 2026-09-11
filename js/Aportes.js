    const $ = (selector) => document.querySelector(selector);

    const amount = $("#amount");
    const asset = $("#asset");
    const type = $("#type");
    const date = $("#date");
    const recurrence = $("#recurrence");
    const recurrenceDay = $("#recurrenceDay");
    const recurrenceDayBox = $("#recurrenceDayBox");
    const observation = $("#observation");

    const contributionList = $("#contributionList");
    const emptyState = $("#emptyState");

    const totalMonth = $("#totalMonth");
    const activeRecurring = $("#activeRecurring");
    const contributionCount = $("#contributionCount");
    const monthlyAverage = $("#monthlyAverage");
    const nextContribution = $("#nextContribution");

    let contributions = [];


    function money(value) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value);
    }
    function formatQty(value) {
        return Number(value).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }


    function getAmount() {
        return Number(
            amount.value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
        ) || 0;
    }

    function mapFromServer(item) {
        return {
            id: item.id_aporte,
            asset: item.ativo_aporte,
            amount: Number(item.preco_aporte),
            type: item.tipo_aporte,
            date: item.data_aporte,
            recurrence: item.recorrencia_aporte,
            recurrenceDay: item.dia_recorrencia,
            observation: item.observacao_aporte || "",
            precoAtual: item.preco_atual,
            rentabilidade: item.rentabilidade,
            quantidade: item.quantidade
        };
    }

    async function carregarAportes() {
        try {
            const resposta = await fetch("listar_aporte.php");
            const resultado = await resposta.json();

            if (!resultado.success) {
                toast(resultado.message || "Erro ao carregar aportes.");
                return;
            }

            contributions = resultado.aportes.map(mapFromServer);
            render();

        } catch (erro) {
            console.error("Erro ao carregar aportes:", erro);
            toast("Erro de conexão ao carregar aportes.");
        }
    }

    function toast(message) {
        const box = $("#toast");
        const text = $("#toastMessage");

        text.textContent = message;
        box.classList.add("show");

        setTimeout(() => box.classList.remove("show"), 2500);
    }

    function today() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    date.value = today();

    $("#currentDate").textContent = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric"
    });

    document.querySelectorAll("[data-value]").forEach(button => {
        button.addEventListener("click", () => {
            const value = Number(button.dataset.value);
            amount.value = money(value);

            document.querySelectorAll("[data-value]").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
        });
    });

    $("#otherValue").addEventListener("click", () => {
        amount.focus();
        amount.select();
        document.querySelectorAll("[data-value]").forEach(btn => btn.classList.remove("selected"));
    });

    amount.addEventListener("input", () => {
        let value = amount.value.replace(/\D/g, "");

        if (!value) {
            amount.value = "";
            return;
        }

        amount.value = money(Number(value) / 100);
    });

    recurrence.addEventListener("change", () => {
        const isRecurring = recurrence.value !== "none";
        recurrenceDayBox.classList.toggle("hidden", !isRecurring);

        if (!isRecurring) {
            recurrenceDay.value = "";
        }
    });

    $("#confirmBtn").addEventListener("click", async () => {

        const value = getAmount();

        if (value <= 0) {
            toast("Digite um valor válido.");
            amount.focus();
            return;
        }

        if (!date.value) {
            toast("Selecione uma data.");
            return;
        }

        if (
            recurrence.value !== "none" &&
            (!recurrenceDay.value || recurrenceDay.value < 1 || recurrenceDay.value > 31)
        ) {
            toast("Informe o dia da recorrência.");
            recurrenceDay.focus();
            return;
        }

        const dados = new URLSearchParams();
        dados.append("ativo", asset.value);
        dados.append("valor", value);
        dados.append("tipo", type.value);
        dados.append("recorrencia", recurrence.value);
        dados.append("data", date.value);
        dados.append("dia_recorrencia", recurrenceDay.value || "");
        dados.append("observacao", observation.value.trim());

        try {
            const resposta = await fetch("cadastrar_aporte.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: dados
            });

            const resultado = await resposta.json();

            if (!resultado.success) {
                toast(resultado.message || "Erro ao salvar aporte.");
                return;
            }

            toast("Aporte adicionado com sucesso!");
            clearForm();
            await carregarAportes();

        } catch (erro) {
            toast("Erro de conexão ao salvar aporte.");
        }

    });

    function clearForm() {
        observation.value = "";
        recurrence.value = "none";
        recurrenceDay.value = "";
        recurrenceDayBox.classList.add("hidden");

        document.querySelectorAll("[data-value]").forEach(btn => btn.classList.remove("selected"));
    }

    function assetIcon(name) {
        const icons = {
            PETR4: ["P4", "green-bg"],
            Bitcoin: ["₿", "orange-bg"],
            "CDB Nubank": ["CDB", "cyan-bg"],
            XPML11: ["FII", "yellow-bg"]
        };

        return icons[name] || ["AT", "blue-bg"];
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    }

    function recurrenceText(item) {
        if (item.recurrence === "weekly") return "Semanal";
        if (item.recurrence === "monthly") return `Mensal - dia ${item.recurrenceDay}`;
        return "Único";
    }

    function render() {

        contributionList.innerHTML = "";

        if (contributions.length === 0) {
            emptyState.style.display = "block";
            updateCards();
            return;
        }

        emptyState.style.display = "none";

        const sorted = [...contributions].sort((a, b) => new Date(b.date) - new Date(a.date));

        sorted.forEach(item => {
            console.log(item);

            const [icon, color] = assetIcon(item.asset);
            const element = document.createElement("div");
            element.className = "aporte-item";

            element.innerHTML = `
                <div class="left">
                    <div class="asset-icon ${color}">${icon}</div>

                    <div class="aporte-info">
                        <strong>${item.asset}</strong>
                        <p>${item.type} • ${formatDate(item.date)}</p>
                        <small>
                            ${recurrenceText(item)}
                            ${item.observation ? ` • ${item.observation}` : ""}
                        </small>
                    </div>
                </div>

            <div class="right">
        <strong class="aporte-value">${money(item.amount)}</strong>

    ${item.quantidade !== null && item.quantidade !== undefined
                    ? `<small class="aporte-qtd">${formatQty(item.quantidade)} ações</small>`
                    : ""
                }

        ${item.rentabilidade !== null && item.rentabilidade !== undefined
                    ? `<small style="color:${item.rentabilidade >= 0 ? "#22c55e" : "#ef4444"};">
                ${item.rentabilidade >= 0 ? "▲" : "▼"} ${item.rentabilidade}%
            </small>`
                    : ""
                }

        <button class="delete-btn" data-delete="${item.id}" title="Excluir aporte">
            <i class="bi bi-trash"></i>
        </button>
            </div>
            `;

            contributionList.appendChild(element);
        });

        contributionCount.textContent = `${contributions.length} ${contributions.length === 1 ? "aporte" : "aportes"}`;

        updateCards();
    }

    contributionList.addEventListener("click", async event => {

        const button = event.target.closest("[data-delete]");
        if (!button) return;

        const id = Number(button.dataset.delete);
        const item = contributions.find(c => c.id === id);
        if (!item) return;

        const confirmado = confirm(`Excluir o aporte de ${money(item.amount)} em ${item.asset}?`);
        if (!confirmado) return;

        try {
            const dados = new URLSearchParams();
            dados.append("id_aporte", id);

            const resposta = await fetch("excluir_aporte.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: dados
            });

            const resultado = await resposta.json();

            if (!resultado.success) {
                toast(resultado.message || "Erro ao excluir.");
                return;
            }

            contributions = contributions.filter(c => c.id !== id);
            render();
            toast("Aporte excluído.");

        } catch (erro) {
            toast("Erro de conexão ao excluir.");
        }

    });

    function updateCards() {

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const monthContributions = contributions.filter(item => {
            const d = new Date(item.date + "T00:00:00");
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const total = monthContributions.reduce((sum, item) => sum + item.amount, 0);
        totalMonth.textContent = money(total);

        const recurring = contributions.filter(item => item.recurrence !== "none");
        activeRecurring.textContent = `${recurring.length} ${recurring.length === 1 ? "ativo" : "ativos"}`;

        const values = contributions.map(item => item.amount);
        const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        monthlyAverage.textContent = money(average);

        const monthly = recurring.find(item => item.recurrence === "monthly");

        if (monthly) {
            nextContribution.textContent = `Próximo: dia ${monthly.recurrenceDay}`;
        } else if (recurring.length) {
            nextContribution.textContent = "Próximo aporte programado";
        } else {
            nextContribution.textContent = "Nenhum aporte programado";
        }
    }

    $("#notificationBtn").addEventListener("click", () => {
        toast("Você não possui novas notificações.");
    });

    carregarAportes();