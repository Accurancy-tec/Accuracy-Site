<?php
/**
 * Cabeçalho comum das páginas da área logada.
 *
 * Antes de incluir, a página define:
 *   $tituloPagina   título exibido na aba ("Carteira")
 *   $estilosPagina  (opcional) lista de CSS específicos da página
 */
$tituloPagina = $tituloPagina ?? "Accuracy";
$estilosPagina = $estilosPagina ?? [];
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#060b18">
<title><?= htmlspecialchars($tituloPagina) ?> - Accuracy</title>

<link rel="preconnect" href="https://accuracyappapi.onrender.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<!-- Tema antes de tudo: evita piscar a cor errada ao abrir a página -->
<script src="js/config.js?v=1"></script>
<script src="js/Tema.js?v=2"></script>
<link rel="stylesheet" href="css/Tema.css?v=2">
<link rel="stylesheet" href="css/base-v2.css?v=2">

<?php foreach ($estilosPagina as $estilo): ?>
<link rel="stylesheet" href="<?= htmlspecialchars($estilo) ?>">
<?php endforeach; ?>

<link rel="stylesheet" href="css/layout-v2.css?v=5">
<link rel="stylesheet" href="css/shell.css?v=1">

<script src="js/usuario-global.js?v=2"></script>
<script src="js/avatar-global.js?v=10"></script>
