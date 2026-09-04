
     fetch("configs/API.php")
    .then(resposta => resposta.json())
    .then(dados => {

        console.log(dados);

        const preco = dados.results[0].data.regularMarketPrice;

        document.getElementById("precoPetr4").textContent =
            "R$ " + preco;

    })
    .catch(erro => {
        console.error("Erro:", erro);
    });