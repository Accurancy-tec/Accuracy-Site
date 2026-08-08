<?php
session_start();
include('configs/conexao.php');
if(!isset($_SESSION["nome"])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Perfil - Accuracy</title>

<link rel="stylesheet" href="css/perfil.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

</head>

<body>

<div class="app">

    <!-- SIDEBAR -->
    <aside class="sidebar">

        <div class="top">

            <div class="logo">
                <div class="logo-box"></div>
                <span>Accuracy</span>
            </div>

            <div class="divider"></div>

            <nav class="menu">

                <a href="dashboard.php">Dashboard</a>
                <a href="carteira.php">Carteira</a>
                <a href="historico.php">Histórico</a>
                <a href="aportes.php">Aportes</a>
                <a>Relatórios</a>
                <a class="active">Perfil</a>

            </nav>

        </div>

        <div class="user">

            <div class="avatar">N</div>

            <div>
                <strong><?php echo htmlspecialchars($_SESSION["nome"]); ?></strong>
                <p>Perfil do usuário</p>
            </div>

        </div>

    </aside>

    <!-- MAIN -->
    <main class="main">

        <header class="topbar">

            <div>
                <h1>Meu Perfil</h1>
                <p>Gerencie suas informações pessoais</p>

                
            </div>

        </header>

        <!-- PROFILE CARD -->
        <section class="profile-card">

            <div class="profile-header">

                <div class="big-avatar">N</div>

                <div>
                    <h2>Nome da pessoa</h2>
                    <p class="email">usuario@email.com</p>
                </div>

            </div>

            <div class="profile-grid">

                <div class="field">
                    <label>Nome completo</label>
                    <input type="text"
                </div>

                <div class="field">
                    <label>Email</label>
                    <input type="email" value="usuario@email.com">
                </div>

                <div class="field">
                    <label>Senha</label>
                    <input type="password" value="********">
                </div>

                <div class="field">
                    <label>Data de criação</label>
                    <input type="text" value="18/06/2026" disabled>
                </div>

            </div>

            <button class="btn">Salvar alterações</button>

        </section>

    </main>

</div>

</body>
</html>

