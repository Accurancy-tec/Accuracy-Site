// Quiz of a trail (trilha.php?id=N): multiple choice questions; the answer is checked by the API,
// which only reveals the correct option after the user answers.
(function () {
    "use strict";

    const section = document.getElementById("trailQuiz");
    const list = document.getElementById("trailQuizList");
    const scoreLine = document.getElementById("trailQuizScore");
    const trailId = Number(new URLSearchParams(window.location.search).get("id"));
    const LETTERS = ["A", "B", "C", "D", "E"];

    if (!section || !Number.isInteger(trailId) || trailId <= 0) return;

    let questions = [];

    async function request(path, options = {}) {
        const response = await fetch(`${window.ACCURACY_API_URL}/cursos/${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success !== true) {
            throw new Error(data.message || "Não foi possível falar com o servidor.");
        }
        return data;
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function updateScore() {
        const answered = questions.filter(question => question.answered);
        const correct = answered.filter(question => question.is_correct).length;
        scoreLine.textContent = answered.length === 0
            ? `${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"} sobre esta trilha.`
            : `Você acertou ${correct} de ${answered.length} respondidas (${questions.length} no total).`;
    }

    function renderQuestion(question, index) {
        const item = element("li", "trail-quiz-item");
        item.append(element("p", "trail-quiz-question", `${index + 1}. ${question.question}`));

        const options = element("div", "trail-quiz-options");
        options.setAttribute("role", "group");
        options.setAttribute("aria-label", `Alternativas da pergunta ${index + 1}`);

        question.options.forEach((text, optionIndex) => {
            const button = element("button", "trail-quiz-option");
            button.type = "button";
            button.append(element("span", "trail-quiz-letter", LETTERS[optionIndex]), element("span", null, text));

            if (question.answered) {
                button.disabled = true;
                if (optionIndex === question.correct_option) button.classList.add("correct");
                else if (optionIndex === question.chosen_option) button.classList.add("wrong");
            } else {
                button.addEventListener("click", () => answer(question, optionIndex, item));
            }
            options.appendChild(button);
        });
        item.appendChild(options);

        if (question.answered) {
            const feedback = element("div", `trail-quiz-feedback ${question.is_correct ? "correct" : "wrong"}`);
            feedback.setAttribute("role", "status");
            feedback.append(element("strong", null, question.is_correct ? "Resposta certa!" : "Não foi dessa vez."));
            if (question.explanation) feedback.append(element("span", null, question.explanation));
            item.appendChild(feedback);

            const retry = element("button", "trail-quiz-retry", "Responder de novo");
            retry.type = "button";
            retry.addEventListener("click", () => {
                question.answered = false;
                item.replaceWith(renderQuestion(question, index));
                updateScore();
            });
            item.appendChild(retry);
        }
        return item;
    }

    async function answer(question, optionIndex, item) {
        item.querySelectorAll(".trail-quiz-option").forEach(button => { button.disabled = true; });
        try {
            const result = await request("responder-quiz", {
                method: "POST",
                body: JSON.stringify({ question_id: question.question_id, option: optionIndex })
            });
            Object.assign(question, {
                answered: true,
                chosen_option: optionIndex,
                is_correct: result.is_correct,
                correct_option: result.correct_option,
                explanation: result.explanation
            });
        } catch (error) {
            if (window.V2Toast) window.V2Toast(error.message);
        }
        item.replaceWith(renderQuestion(question, questions.indexOf(question)));
        updateScore();
    }

    async function load() {
        try {
            const data = await request(`quiz?id_trilha=${trailId}`);
            questions = data.questions || [];
        } catch (error) {
            return;
        }
        if (questions.length === 0) return;

        list.replaceChildren(...questions.map(renderQuestion));
        updateScore();
        section.hidden = false;
    }

    load();
})();
