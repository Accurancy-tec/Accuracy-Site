/* =========================================================
   CADASTRO E LOGIN

   Cadastro: nome, e-mail e senha são obrigatórios; telefone
   é opcional (a API valida o formato quando preenchido).
   Nenhum dado do formulário é escrito no console.
========================================================= */

const API_URL = window.ACCURACY_API_URL + "/";

async function enviarParaApi(rota, dados) {
    const resposta = await fetch(`${API_URL}${rota}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json().catch(() => null);

    if (!resultado) {
        throw new Error("O servidor não respondeu como esperado. Tente novamente em instantes.");
    }

    return resultado;
}

function limparErros(formulario) {
    formulario.querySelectorAll(".mensagem-erro").forEach(erro => { erro.textContent = ""; });
    formulario.querySelectorAll(".input-erro").forEach(input => {
        input.classList.remove("input-erro");
        input.removeAttribute("aria-invalid");
    });
}

/* Mensagem logo abaixo do campo (cria o <small> quando ainda não existe) */
function mostrarErroCampo(input, mensagem) {
    input.classList.add("input-erro");
    input.setAttribute("aria-invalid", "true");

    // The message goes right below the field (or below its show-password wrapper).
    const campo = input.closest(".password-field") || input;
    let erro = campo.nextElementSibling;

    if (!erro || !erro.classList.contains("mensagem-erro")) {
        erro = document.createElement("small");
        erro.className = "mensagem-erro";
        erro.id = `${input.id}-erro`;
        campo.insertAdjacentElement("afterend", erro);
    }
    input.setAttribute("aria-describedby", erro.id);

    erro.textContent = mensagem;
}

function ocupado(botao, sim, textoOcupado) {
    if (!botao) return;
    if (!botao.dataset.texto) botao.dataset.texto = botao.textContent.trim();
    botao.disabled = sim;
    botao.textContent = sim ? textoOcupado : botao.dataset.texto;
}


/* =========================================================
   CADASTRO
========================================================= */

const formularioCadastro = document.getElementById("formCadastro");

function validarCadastro(formulario) {
    limparErros(formulario);
    let valido = true;

    const nome = formulario.elements.nome_usuario;
    const email = formulario.elements.email_usuario;
    const senha = formulario.elements.senha_usuario;
    const telefone = formulario.elements.telefone_usuario;
    const termos = formulario.elements.aceite_termos;

    if (nome.value.trim().length < 2) {
        mostrarErroCampo(nome, "Informe seu nome.");
        valido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        mostrarErroCampo(email, "Digite um e-mail válido.");
        valido = false;
    }

    if (senha.value.length < 8) {
        mostrarErroCampo(senha, "A senha precisa ter pelo menos 8 caracteres.");
        valido = false;
    }

    const digitosTelefone = telefone.value.replace(/\D/g, "");
    if (digitosTelefone && !/^\d{10,11}$/.test(digitosTelefone)) {
        mostrarErroCampo(telefone, "Use o DDD + número, ou deixe em branco.");
        valido = false;
    }

    if (termos && !termos.checked) {
        document.getElementById("erroCadastro").textContent = "Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.";
        valido = false;
    }

    return valido;
}

if (formularioCadastro) {
    formularioCadastro.addEventListener("submit", async event => {
        event.preventDefault();

        const erroGeral = document.getElementById("erroCadastro");
        erroGeral.textContent = "";

        if (!validarCadastro(formularioCadastro)) {
            return;
        }

        const campos = formularioCadastro.elements;
        const dados = {
            nome_usuario: campos.nome_usuario.value.trim(),
            email_usuario: campos.email_usuario.value.trim().toLowerCase(),
            senha_usuario: campos.senha_usuario.value
        };

        const telefone = campos.telefone_usuario.value.replace(/\D/g, "");
        if (telefone) {
            dados.telefone_usuario = telefone;
        }

        const botao = formularioCadastro.querySelector("button[type=submit]");
        ocupado(botao, true, "Criando conta...");

        try {
            const resultado = await enviarParaApi("auth/registrarNovoUsuario", dados);

            if (resultado.status === "sucesso" || resultado.success === true) {
                sessionStorage.setItem("email_verificacao", dados.email_usuario);
                window.location.href = "confirmacodigo.php";
                return;
            }

            erroGeral.textContent = resultado.mensagem || resultado.message || "Não foi possível criar a conta. Tente novamente.";
        } catch (erro) {
            erroGeral.textContent = erro.message;
        } finally {
            ocupado(botao, false);
        }
    });
}


/* =========================================================
   LOGIN
========================================================= */

const formularioLogin = document.getElementById("formLogin");

function mensagemDeLogin(mensagem) {
    const texto = String(mensagem || "").toLowerCase();

    if (texto.includes("verificado") || texto.includes("confirme seu e-mail")) {
        return "Seu e-mail ainda não foi confirmado. Veja o código que enviamos para a sua caixa de entrada.";
    }

    return "E-mail ou senha incorretos.";
}

/* Aviso deixado por outra tela: sessão encerrada, senha redefinida... */
if (formularioLogin) {
    const aviso = document.getElementById("avisoLogin");
    const texto = sessionStorage.getItem("accuracy_aviso_login");
    const emailSalvo = sessionStorage.getItem("email_login");

    sessionStorage.removeItem("accuracy_aviso_login");
    sessionStorage.removeItem("email_login");

    if (aviso && texto) {
        aviso.textContent = texto;
        aviso.hidden = false;
    }

    if (emailSalvo) {
        formularioLogin.elements.email_usuario.value = emailSalvo;
        formularioLogin.elements.senha_usuario.focus();
    }

    // "Esqueci minha senha" já abre com o e-mail digitado aqui.
    const linkEsqueci = document.getElementById("linkEsqueciSenha");
    if (linkEsqueci) {
        linkEsqueci.addEventListener("click", () => {
            const digitado = formularioLogin.elements.email_usuario.value.trim();
            if (digitado) sessionStorage.setItem("email_recuperacao", digitado);
        });
    }
}

if (formularioLogin) {
    formularioLogin.addEventListener("submit", async event => {
        event.preventDefault();
        limparErros(formularioLogin);

        const email = formularioLogin.elements.email_usuario;
        const senha = formularioLogin.elements.senha_usuario;

        if (!email.value.trim() || !senha.value) {
            mostrarErroCampo(!email.value.trim() ? email : senha, "Preencha o e-mail e a senha.");
            return;
        }

        const botao = formularioLogin.querySelector("button[type=submit]");
        ocupado(botao, true, "Entrando...");

        // The free API server sleeps when idle and the first request can take up to a minute.
        const avisoLogin = document.getElementById("avisoLogin");
        const avisoLento = setTimeout(() => {
            if (!avisoLogin) return;
            avisoLogin.textContent = "O servidor está iniciando. A primeira entrada depois de um tempo parado pode levar até um minuto.";
            avisoLogin.hidden = false;
        }, 6000);

        try {
            const resultado = await enviarParaApi("auth/loginUnico", {
                email_usuario: email.value.trim(),
                senha_usuario: senha.value
            });

            if (resultado.success !== true) {
                const mensagem = resultado.message || resultado.mensagem || "";
                const naoVerificado = /verificado|confirme seu e-mail/i.test(mensagem);

                if (naoVerificado) {
                    sessionStorage.setItem("email_verificacao", email.value.trim().toLowerCase());
                }

                mostrarErroCampo(naoVerificado ? email : senha, mensagemDeLogin(mensagem));
                return;
            }

            if (resultado.admin === true) {
                localStorage.setItem("admin_token", resultado.token);
                localStorage.setItem("admin", JSON.stringify(resultado.user));
                window.location.href = "admin.php";
                return;
            }

            localStorage.removeItem("accuracy_profile_data");
            localStorage.removeItem("accuracy_avatar");
            localStorage.setItem("token", resultado.token);

            if (resultado.refreshToken) {
                localStorage.setItem("refreshToken", resultado.refreshToken);
            } else {
                localStorage.removeItem("refreshToken");
            }

            localStorage.setItem("usuario", JSON.stringify(resultado.user));
            window.location.href = "dashboard.php";
        } catch (erro) {
            mostrarErroCampo(email, "Não foi possível conectar. Verifique a internet e tente de novo.");
        } finally {
            clearTimeout(avisoLento);
            if (avisoLogin) avisoLogin.hidden = true;
            ocupado(botao, false);
        }
    });
}
