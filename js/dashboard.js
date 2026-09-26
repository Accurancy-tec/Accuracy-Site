const token = localStorage.getItem("token");
const usuarioSalvo = localStorage.getItem("usuario");

if (!token || !usuarioSalvo) {

    window.location.href = "login.php";

} else {

    const usuario = JSON.parse(usuarioSalvo);

    const nomeUsuario = document.getElementById("nomeUsuario");

    if (nomeUsuario) {
        nomeUsuario.textContent = usuario.nome_usuario;
    }

}
