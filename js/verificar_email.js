const inputs = Array.from(document.querySelectorAll(".code-input"));
const btn = document.getElementById("confirmBtn");
const statusRow = document.getElementById("statusRow");
const resendLink = document.getElementById("resendLink");
const timerEl = document.getElementById("timer");

function updateButtonState() {
    const preenchido = inputs.every(input => input.value.length === 1);
    btn.disabled = !preenchido;
}

inputs.forEach((input, index) => {

    input.addEventListener("input", function () {

        let valor = this.value.replace(/\D/g, "");

        if (valor.length > 1) {

            valor = valor.slice(0, 6);

            valor.split("").forEach((numero, i) => {

                if (inputs[i]) {
                    inputs[i].value = numero;
                    inputs[i].classList.add("filled");
                    inputs[i].classList.remove("error");
                }

            });

            if (valor.length < 6) {
                inputs[valor.length].focus();
            } else {
                inputs[5].focus();
            }

        } else {

            this.value = valor;

            if (valor !== "") {

                this.classList.add("filled");
                this.classList.remove("error");

                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

            } else {

                this.classList.remove("filled");

            }
        }

        statusRow.textContent = "";
        statusRow.className = "status-row";

        updateButtonState();
    });


    input.addEventListener("keydown", function (event) {

        if (event.key === "Backspace") {

            if (this.value === "" && index > 0) {

                inputs[index - 1].focus();
                inputs[index - 1].value = "";
                inputs[index - 1].classList.remove("filled");

            }

        }

    });


    input.addEventListener("paste", function (event) {

        event.preventDefault();

        const codigo = (event.clipboardData || window.clipboardData)
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        codigo.split("").forEach((numero, i) => {

            if (inputs[i]) {
                inputs[i].value = numero;
                inputs[i].classList.add("filled");
                inputs[i].classList.remove("error");
            }

        });

        if (codigo.length < 6) {
            inputs[codigo.length].focus();
        } else {
            inputs[5].focus();
        }

        updateButtonState();
    });

});


btn.addEventListener("click", async function () {

    const codigo = inputs
        .map(input => input.value)
        .join("");

    if (codigo.length !== 6) {
        return;
    }

    btn.disabled = true;
    btn.textContent = "Verificando...";

    const dados = new FormData();
    dados.append("codigo", codigo);

    try {

        const resposta = await fetch("confirmacodigo.php", {
            method: "POST",
            body: dados
        });

        const resultado = await resposta.json();

        if (resultado.success) {

            statusRow.className = "status-row success";
            statusRow.textContent = resultado.message;

            btn.textContent = "Confirmado ✓";

            setTimeout(() => {
                window.location.href = "login.php";
            }, 1000);

        } else {

            statusRow.className = "status-row error";
            statusRow.textContent = resultado.message;

            btn.textContent = "Confirmar código";
            btn.disabled = false;

            inputs.forEach(input => {
                input.classList.add("error");
            });

        }

    } catch (erro) {

        console.error(erro);

        statusRow.className = "status-row error";
        statusRow.textContent = "Erro ao verificar o código.";

        btn.textContent = "Confirmar código";
        btn.disabled = false;
    }

});


let seconds = 30;

const countdown = setInterval(() => {

    seconds--;

    if (seconds <= 0) {

        clearInterval(countdown);

        timerEl.textContent = "";

        resendLink.innerHTML = "Reenviar código";

    } else {

        timerEl.textContent = seconds + "s";

    }

}, 1000);


resendLink.addEventListener("click", function (event) {

    if (seconds > 0) {
        event.preventDefault();
    }

});


inputs[0].focus();