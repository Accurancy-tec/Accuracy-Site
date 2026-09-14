const formulario = document.getElementById("formLogin");

if (formulario) {

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const dados = new FormData(formulario);

        fetch("login.php", {
            method: "POST",
            body: dados
        })
        .then(resposta => resposta.json())
        .then(resultado => {

            if (resultado.success) {

                window.location.href = "dashboard.php";

            } else {

                alert(resultado.message);

            }

        })
        .catch(erro => {

            console.error("Erro na requisição:", erro);

            alert("Erro ao fazer login.");

        });

    });

}