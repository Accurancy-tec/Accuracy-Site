const FormularioCadastro = document.getElementById("formCadastro");

if (FormularioCadastro) {

    FormularioCadastro.addEventListener("submit", async function (event) {

        event.preventDefault();

        const DadosForm = new FormData(FormularioCadastro);
        const dados = Object.fromEntries(DadosForm.entries());

        console.log("Dados enviados:", dados);

        try {

            const resposta = await fetch(
                "http://localhost/accuracyAppApi/user/registerNewUser.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dados)
                }
            );

            console.log("Status HTTP:", resposta.status);

            const texto = await resposta.text();

            console.log("Resposta da API:", texto);

            let resultado;

            try {
                resultado = JSON.parse(texto);
            } catch (erro) {
                throw new Error(
                    "A API não retornou JSON. Resposta: " + texto
                );
            }

            console.log(
                "JSON:",
                JSON.stringify(resultado, null, 2)
            );

            if (
                resultado.success === true ||
                resultado.status === "sucesso"
            ) {

                sessionStorage.setItem(
                    "email_verificacao",
                    dados.email_usuario
                );

                window.location.href =
                    "http://localhost/Accuracy-Site/confirmacodigo.php";

            } else {

                console.error(
                    resultado.message ||
                    resultado.mensagem ||
                    "A API recusou o cadastro."
                );
            }

        } catch (erro) {

            console.error(
                "ERRO COMPLETO:",
                erro
            );
        }
    });
}


const formulario = document.getElementById("formLogin");

if (formulario) {

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const DadosForm = new FormData(formulario);
        const dados = Object.fromEntries(DadosForm.entries());

        console.log("Dados de login enviados:", dados);

        try {

            const resposta = await fetch(
                "http://localhost/accuracyAppApi/user/loginSite.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dados)
                }
            );

            console.log("Status HTTP:", resposta.status);

            const texto = await resposta.text();

            console.log(
                "Resposta bruta do login:",
                texto
            );

            let resultado;

            try {

                resultado = JSON.parse(texto);

            } catch (erro) {

                throw new Error(
                    "A API de login não retornou JSON. Resposta: " +
                    texto
                );
            }

            console.log(
                "Resultado da API:",
                resultado
            );

            console.log(
                "JSON:",
                JSON.stringify(resultado, null, 2)
            );

            if (resultado.success === true) {

                console.log("Login realizado com sucesso.");

                localStorage.setItem(
                    "token",
                    resultado.token
                );

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(resultado.user)
                );

                window.location.href =
                    "http://localhost/Accuracy-Site/dashboard.php";

            } else {

                console.error(
                    "LOGIN RECUSADO:",
                    resultado.message ||
                    resultado.mensagem ||
                    "E-mail ou senha incorretos."
                );
            }

        } catch (erro) {

            console.error(
                "ERRO NO LOGIN:",
                erro
            );
        }
    });
}

