// =========================================================
// PROGRESSO DOS CURSOS
// Guarda no navegador quais vídeos de cada trilha o aluno
// já assistiu. É usado pela página Cursos e pela Trilha.
//
// Obs.: fica salvo só neste navegador (localStorage). Para
// o progresso acompanhar o aluno em outro computador, seria
// preciso guardar no banco de dados.
// =========================================================

(function () {

    // Cada usuário logado tem o seu próprio progresso
    function idUsuario() {
        try {
            const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
            if (usuario && usuario.id_usuario) {
                return String(usuario.id_usuario);
            }
        } catch (erro) { /* ignora */ }

        return "visitante";
    }

    function chave(idTrilha) {
        return "accuracy_progresso_" + idUsuario() + "_" + idTrilha;
    }

    // Lista com os códigos dos vídeos já assistidos
    function ler(idTrilha) {
        try {
            const lista = JSON.parse(localStorage.getItem(chave(idTrilha)) || "[]");

            if (!Array.isArray(lista)) {
                return [];
            }

            return lista.filter(function (item) {
                return typeof item === "string";
            });
        } catch (erro) {
            return [];
        }
    }

    // Marca um vídeo como assistido e devolve a lista atualizada
    function marcar(idTrilha, idVideo) {
        const lista = ler(idTrilha);

        if (idVideo && lista.indexOf(idVideo) === -1) {
            lista.push(idVideo);

            try {
                localStorage.setItem(chave(idTrilha), JSON.stringify(lista));
            } catch (erro) { /* sem espaço ou bloqueado: segue sem salvar */ }
        }

        return lista;
    }

    // Porcentagem de 0 a 100
    function percentual(assistidos, total) {
        if (!total || total <= 0) {
            return 0;
        }

        return Math.min(100, Math.round((assistidos / total) * 100));
    }

    window.AccuracyProgresso = {
        ler: ler,
        marcar: marcar,
        percentual: percentual
    };

})();
