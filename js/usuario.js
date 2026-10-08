const API_URL = "https://accuracyappapi.onrender.com/";


/* =========================================================
   CADASTRO
========================================================= */

const FormularioCadastro = document.getElementById("formCadastro");

if (FormularioCadastro) {

    FormularioCadastro.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!validarCadastro(FormularioCadastro)) {
            return;
        }

        const DadosForm = new FormData(FormularioCadastro);

        const dados = Object.fromEntries(DadosForm.entries());


        /* Remove a máscara do CPF */

        if (dados.cpf_usuario) {

            dados.cpf_usuario =
                dados.cpf_usuario.replace(/\D/g, "");
        }


        /* Remove a máscara do telefone */

        if (dados.telefone_usuario) {

            dados.telefone_usuario =
                dados.telefone_usuario.replace(/\D/g, "");
        }


        console.log("Dados enviados:", dados);


        try {

            const resposta = await fetch(
                `${API_URL}auth/registrarNovoUsuario`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dados)
                }
            );


            console.log(
                "Status HTTP:",
                resposta.status
            );


            const texto = await resposta.text();


            console.log(
                "Resposta da API:",
                texto
            );


            let resultado;


            try {

                resultado = JSON.parse(texto);

            } catch (erro) {

                throw new Error(
                    "A API não retornou JSON. Resposta: " +
                    texto
                );

            }


            console.log(
                "JSON:",
                JSON.stringify(resultado, null, 2)
            );


            /*
             * Cadastro realizado com sucesso
             */

            if (
                resultado.success === true ||
                resultado.status === "sucesso"
            ) {

                /*
                 * Salva o e-mail para a página
                 * de confirmação do código
                 */

                sessionStorage.setItem(
                    "email_verificacao",
                    dados.email_usuario
                );


                /*
                 * Vai para a página de confirmação
                 */

                window.location.href =
                    "confirmacodigo.php";


            } else {

                /*
                 * Cadastro recusado pela API
                 */

                const mensagem =
                    resultado.message ||
                    resultado.mensagem ||
                    "A API recusou o cadastro.";

                console.error(
                    "CADASTRO RECUSADO:",
                    mensagem
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


/* =========================================================
   LOGIN
========================================================= */

const formulario = document.getElementById("formLogin");

if (formulario) {

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();


        const DadosForm =
            new FormData(formulario);

        const dados =
            Object.fromEntries(DadosForm.entries());


        console.log(
            "Dados de login enviados:",
            dados
        );


        try {

            const resposta = await fetch(
                `${API_URL}auth/loginSite`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dados)
                }
            );


            console.log(
                "Status HTTP:",
                resposta.status
            );


            const texto =
                await resposta.text();


            console.log(
                "Resposta bruta do login:",
                texto
            );


            let resultado;


            try {

                resultado =
                    JSON.parse(texto);

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

                console.log(
                    "Login realizado com sucesso."
                );


                localStorage.removeItem(
                    "accuracy_profile_data"
                );


                localStorage.removeItem(
                    "accuracy_avatar"
                );


                localStorage.setItem(
                    "token",
                    resultado.token
                );
                
                if (resultado.refreshToken) {
                    localStorage.setItem(
                        "refreshToken",
                        resultado.refreshToken
                    );
                } else {
                    localStorage.removeItem(
                        "refreshToken"
                    );
                }

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(resultado.user)
                );


                window.location.href =
                    "dashboard.php";


            } else {

                const mensagem =
                    resultado.message ||
                    resultado.mensagem ||
                    "E-mail ou senha incorretos.";


                console.error(
                    "LOGIN RECUSADO:",
                    mensagem
                );


                const mensagemUsuario =
                    tratarErroLogin(mensagem);


                if (
                    mensagem.toLowerCase().includes("senha")
                ) {

                    mostrarErroInput(
                        "senha_usuario",
                        "erroSenha",
                        mensagemUsuario
                    );

                } else {

                    mostrarErroInput(
                        "email_usuario",
                        "erroEmail",
                        mensagemUsuario
                    );

                }

            }


        } catch (erro) {

            console.error(
                "ERRO NO LOGIN:",
                erro
            );

        }

    });

}


/* =========================================================
   TRATAMENTO DE ERROS DO LOGIN
========================================================= */

function tratarErroLogin(mensagem) {

    if (!mensagem) {

        return "Não foi possível realizar o login.";

    }


    const erro = mensagem.toLowerCase();


    if (
        erro.includes("e-mail ainda não foi verificado")
    ) {

        return "Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada.";

    }


    if (
        erro.includes("e-mail ou senha") ||
        erro.includes("senha incorreta") ||
        erro.includes("credenciais inválidas")
    ) {

        return "E-mail ou senha incorretos.";

    }


    if (
        erro.includes("usuário não encontrado")
    ) {

        return "Usuário não encontrado.";

    }


    return "Email ou Senha incorretos.";

}


/* =========================================================
   TRATAMENTO DE ERROS DO CADASTRO
========================================================= */

function tratarErroCadastro(mensagem) {

    if (!mensagem) {

        return "Não foi possível realizar o cadastro.";

    }


    const erro = mensagem.toLowerCase();


    if (
        erro.includes("e-mail já cadastrado") ||
        erro.includes("email já cadastrado") ||
        erro.includes("e-mail já existe")
    ) {

        return "Este e-mail já está cadastrado.";

    }


    if (
        erro.includes("e-mail inválido") ||
        erro.includes("email inválido")
    ) {

        return "Digite um e-mail válido.";

    }


    if (
        erro.includes("senha")
    ) {

        return "A senha informada não atende aos requisitos.";

    }


    if (
        erro.includes("campos obrigatórios")
    ) {

        return "Preencha todos os campos obrigatórios.";

    }


    return "Não foi possível realizar o cadastro. Tente novamente.";

}


/* =========================================================
   MOSTRAR ERRO NO INPUT
========================================================= */

function mostrarErroInput(
    idInput,
    idErro,
    mensagem
) {

    const input =
        document.getElementById(idInput);

    const erro =
        document.getElementById(idErro);


    if (!input || !erro) {

        console.error(
            "Elemento de erro não encontrado."
        );

        return;

    }


    erro.textContent = mensagem;

    input.classList.add("input-erro");

}


/* =========================================================
   VALIDAR CADASTRO
========================================================= */

function validarCadastro(formulario) {

    let valido = true;


    /* Remove mensagens de erros anteriores */

    formulario
        .querySelectorAll(".mensagem-erro")
        .forEach(erro => {

            erro.textContent = "";

        });


    formulario
        .querySelectorAll(".input-erro")
        .forEach(input => {

            input.classList.remove("input-erro");

        });


    /* Verifica todos os inputs */

    const inputs =
        formulario.querySelectorAll("input");


    inputs.forEach(input => {


        /* Ignora campos que não precisam ser validados */

        if (
            input.type === "submit" ||
            input.type === "button" ||
            input.type === "hidden"
        ) {

            return;

        }


        const valor =
            input.value.trim();


        /* Campo vazio */

        if (valor === "") {

            mostrarErroCadastro(
                input,
                "Este campo é obrigatório."
            );

            valido = false;

        }

    });


    /* Validação do e-mail */

    const email =
        formulario.querySelector(
            'input[name="email_usuario"]'
        );


    if (
        email &&
        email.value.trim() !== ""
    ) {

        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.value.trim()
            );


        if (!emailValido) {

            mostrarErroCadastro(
                email,
                "Digite um e-mail válido."
            );

            valido = false;

        }

    }


    /* Validação da senha */

    const senha =
        formulario.querySelector(
            'input[name="senha_usuario"]'
        );


    if (
        senha &&
        senha.value !== ""
    ) {

        if (senha.value.length < 8) {

            mostrarErroCadastro(
                senha,
                "A senha deve ter no mínimo 8 caracteres."
            );

            valido = false;

        }

    }


    return valido;

}


/* =========================================================
   MOSTRAR ERRO DO CADASTRO
========================================================= */

function mostrarErroCadastro(
    input,
    mensagem
) {

    input.classList.add("input-erro");


    let erro =
        input.nextElementSibling;


    /* Se já existe uma mensagem de erro, usa ela */

    if (
        !erro ||
        !erro.classList.contains("mensagem-erro")
    ) {

        erro =
            document.createElement("small");

        erro.classList.add(
            "mensagem-erro"
        );


        input.insertAdjacentElement(
            "afterend",
            erro
        );

    }


    erro.textContent = mensagem;

}