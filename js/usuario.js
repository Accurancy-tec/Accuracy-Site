console.log("JavaScript carregado!");
const formulario = document.getElementById("formLogin");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();


    const email = document.getElementById("email");
    const senha = document.getElementById("senha");

    const dados = new FormData(formulario);

    fetch("login.php", {
        method: "POST",
        body: dados
    })

        .then(resposta => resposta.json())

        .then(resultado => {
            if (resultado.sucess) {

            
            window.location.href = "dashboard.php";
            }
            else {
                alert("Resultado.message");
            }

        })

        .catch(erro => {
            console.error("Erro na requisição:", erro);
        });
    })







