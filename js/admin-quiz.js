// Admin: quiz questions of each trail (auth/adminListarQuiz, adminCriarQuiz, adminExcluirQuiz).
// Uses the helpers of js/admin.js (api, acao, aviso, esc), which loads right after this file.
window.AdminQuiz = (function () {
    "use strict";

    const LETTERS = ["A", "B", "C", "D", "E"];
    const trailSelect = document.getElementById("quizTrail");
    const form = document.getElementById("formQuizQuestion");
    const list = document.getElementById("quizQuestions");

    let trailsLoaded = false;
    let questions = [];

    async function loadTrails() {
        if (trailsLoaded) return;
        const response = await fetch(`${window.ACCURACY_API_URL}/cursos/trilhas`);
        const data = await response.json().catch(() => ({}));
        const trails = Array.isArray(data.trilhas) ? data.trilhas : [];
        trailSelect.innerHTML = trails
            .map(trail => `<option value="${Number(trail.id_trilha)}">${esc(trail.titulo_trilha)}</option>`)
            .join("");
        trailsLoaded = trails.length > 0;
    }

    async function load() {
        try {
            await loadTrails();
        } catch (error) {
            aviso("Não foi possível carregar as trilhas.", true);
            return;
        }
        const trailId = Number(trailSelect.value);
        if (!trailId) return;
        const result = await acao(() => api("adminListarQuiz", { trail_id: trailId }));
        questions = result ? result.questions : [];
        render();
    }

    function render() {
        const term = (document.getElementById("busca").value || "").trim().toLowerCase();
        const visible = questions.filter(question =>
            question.question.toLowerCase().includes(term)
            || question.options.some(option => option.toLowerCase().includes(term)));

        list.innerHTML = visible.length ? visible.map(question => `
            <article class="card quiz-card">
                <p class="quiz-card-question">${esc(question.question)}</p>
                <ol class="quiz-card-options">
                    ${question.options.map((option, index) => `
                        <li class="${index === question.correct_option ? "correct" : ""}">
                            <b>${LETTERS[index]}</b> ${esc(option)}
                            ${index === question.correct_option ? '<span class="chip">correta</span>' : ""}
                        </li>`).join("")}
                </ol>
                ${question.explanation ? `<p class="dica">${esc(question.explanation)}</p>` : ""}
                <div class="quiz-card-foot">
                    <span class="dica">${question.answers} ${question.answers === 1 ? "resposta" : "respostas"} · ${question.correct_answers} certas</span>
                    <button class="btn btn-perigo btn-pq" data-delete-question="${question.question_id}">Excluir</button>
                </div>
            </article>`).join("")
            : '<div class="card vazio">Nenhuma pergunta nesta trilha ainda.</div>';
    }

    function closeForm() {
        form.hidden = true;
        form.reset();
    }

    trailSelect.addEventListener("change", load);

    document.getElementById("btnNewQuizQuestion").addEventListener("click", () => {
        form.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        form.elements.question.focus();
    });

    document.getElementById("cancelQuizQuestion").addEventListener("click", closeForm);

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const inputs = [...form.querySelectorAll("input[name=option]")];
        const checked = Number(form.querySelector("input[name=correct_option]:checked").value);
        const filled = inputs.map((input, index) => ({ text: input.value.trim(), index })).filter(option => option.text !== "");
        const correct = filled.findIndex(option => option.index === checked);

        if (correct < 0) {
            aviso("Marque como correta uma alternativa preenchida.", true);
            return;
        }

        const saved = await acao(() => api("adminCriarQuiz", {
            trail_id: Number(trailSelect.value),
            question: form.elements.question.value,
            options: filled.map(option => option.text),
            correct_option: correct,
            explanation: form.elements.explanation.value
        }), "Pergunta adicionada ao quiz.");
        if (saved) {
            closeForm();
            load();
        }
    });

    list.addEventListener("click", async event => {
        const button = event.target.closest("[data-delete-question]");
        if (!button || !window.confirm("Excluir esta pergunta? As respostas dos alunos a ela também serão apagadas.")) return;
        await acao(() => api("adminExcluirQuiz", { question_id: Number(button.dataset.deleteQuestion) }), "Pergunta excluída.");
        load();
    });

    return { load, render };
})();
