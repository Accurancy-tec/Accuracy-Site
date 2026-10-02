const API_BASE_URL =
    "https://accuracyappapi.onrender.com";


const inputs =
    document.querySelectorAll(
        ".code-input"
    );


const verifyButton =
    document.getElementById(
        "verifyBtn"
    );


const resendLink =
    document.getElementById(
        "resendLink"
    );


const timerElement =
    document.getElementById(
        "timer"
    );


let tempoRestante = 30;

let intervalo;


const email =
    sessionStorage.getItem(
        "email_verificacao"
    );


inputs.forEach(
    (input, index) => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value
                        .replace(
                            /\D/g,
                            ""
                        );


                if (
                    input.value &&
                    index <
                        inputs.length - 1
                ) {

                    inputs[
                        index + 1
                    ].focus();

                }

            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                        "Backspace" &&

                    input.value ===
                        "" &&

                    index > 0
                ) {

                    inputs[
                        index - 1
                    ].focus();

                }

            }
        );


        input.addEventListener(
            "paste",
            event => {

                event.preventDefault();


                const codigo =
                    event.clipboardData
                        .getData("text")
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            6
                        );


                codigo
                    .split("")
                    .forEach(
                        (
                            numero,
                            i
                        ) => {

                            if (
                                inputs[i]
                            ) {

                                inputs[
                                    i
                                ].value =
                                    numero;

                            }

                        }
                    );


                if (
                    inputs[
                        codigo.length - 1
                    ]
                ) {

                    inputs[
                        codigo.length - 1
                    ].focus();

                }

            }
        );

    }
);


/* =========================
   TIMER
========================= */

function iniciarTimer() {

    clearInterval(
        intervalo
    );


    tempoRestante =
        30;


    resendLink.style.pointerEvents =
        "none";


    resendLink.style.opacity =
        "0.5";


    intervalo =
        setInterval(
            () => {

                tempoRestante--;


                timerElement.textContent =
                    `00:${String(
                        tempoRestante
                    ).padStart(
                        2,
                        "0"
                    )}`;


                if (
                    tempoRestante <=
                    0
                ) {

                    clearInterval(
                        intervalo
                    );


                    timerElement.textContent =
                        "";


                    resendLink.style.pointerEvents =
                        "auto";


                    resendLink.style.opacity =
                        "1";

                }

            },
            1000
        );

}


/* =========================
   VERIFICAR CÓDIGO
========================= */

verifyButton.addEventListener(
    "click",
    async () => {

        const codigo =
            Array.from(inputs)
                .map(
                    input =>
                        input.value
                )
                .join("");


        if (
            codigo.length !== 6
        ) {

            console.error(
                "Digite os 6 números do código."
            );

            return;

        }


        if (!email) {

            console.error(
                "E-mail de verificação não encontrado."
            );

            return;

        }


        try {

            const resposta =
                await fetch(
                    `${API_BASE_URL}/user/verifyEmail.php`,
                    {

                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email_usuario:
                                    email,

                                codigo:
                                    codigo
                            })

                    }
                );


            const resultado =
                await resposta.json();


            console.log(
                "Resultado da verificação:",
                resultado
            );


            if (
                resultado.status ===
                "sucesso"
            ) {

                sessionStorage.removeItem(
                    "email_verificacao"
                );


                window.location.href =
                    "login.php";


            } else {

                console.error(
                    resultado.mensagem ||
                    "Código inválido."
                );

            }


        } catch (erro) {

            console.error(
                "Erro ao verificar código:",
                erro
            );

        }

    }
);


/* =========================
   REENVIAR CÓDIGO
========================= */

resendLink.addEventListener(
    "click",
    async event => {

        event.preventDefault();


        if (!email) {

            console.error(
                "E-mail de verificação não encontrado."
            );

            return;

        }


        try {

            resendLink.style.pointerEvents =
                "none";


            resendLink.style.opacity =
                "0.5";


            const resposta =
                await fetch(
                    `${API_BASE_URL}/user/resendVerification.php`,
                    {

                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email_usuario:
                                    email
                            })

                    }
                );


            const resultado =
                await resposta.json();


            console.log(
                "Resultado do reenvio:",
                resultado
            );


            if (
                resultado.status ===
                "sucesso"
            ) {

                console.log(
                    "Novo código enviado para o e-mail."
                );


                iniciarTimer();


            } else {

                console.error(
                    resultado.mensagem ||
                    "Não foi possível reenviar o código."
                );


                resendLink.style.pointerEvents =
                    "auto";


                resendLink.style.opacity =
                    "1";

            }


        } catch (erro) {

            console.error(
                "Erro ao reenviar código:",
                erro
            );


            resendLink.style.pointerEvents =
                "auto";


            resendLink.style.opacity =
                "1";

        }

    }
);


/* =========================
   INICIAR
========================= */

iniciarTimer();