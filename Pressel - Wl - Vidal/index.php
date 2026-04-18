<?php
// Versão com copy ES
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análisis Dérmico Personalizado</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css?v=copy-pt-pt-final">
</head>
<body>
    <div class="background-pattern"></div>
    <div class="card-container">
        <header class="quiz-header">
            <div class="header-title-wrapper">
                <svg class="header-seal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <h1 class="logo-title">Análisis</h1>
            </div>
            <div id="progress-indicator" class="progress-indicator"><span></span><span></span><span></span><span></span><span></span></div>
        </header>
        <main id="quiz-content" class="quiz-content">
            <form id="quiz-form" action="resultado.php" method="POST" style="display: none;">
                <input type="hidden" name="pergunta1" id="form-resposta1"> <!-- sexo -->
                <input type="hidden" name="pergunta2" id="form-resposta2"> <!-- preocupação principal -->
                <input type="hidden" name="pergunta3" id="form-resposta3"> <!-- sentimento -->
                <input type="hidden" name="pergunta4" id="form-resposta4"> <!-- já fez atividade física ou tentou comer menos e não emagreceu? (sim/nao) -->
                <input type="hidden" name="pergunta5" id="form-resposta5"> <!-- faixa etária -->
            </form>

            <?php
            // Lê a copy do arquivo "headline pagina 1" para a etapa 1
            $headline2 = 'Ve el cambio en 7 días o menos';
            $headlineQuestion = 'Para comenzar, selecciona tu género:';
            $labelMulher = 'Mujer';
            $labelHomem = 'Hombre';
            try {
                $copyPath = __DIR__ . DIRECTORY_SEPARATOR . 'headline pagina 1';
                if (is_file($copyPath) && is_readable($copyPath)) {
                    $lines = @file($copyPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    if ($lines && is_array($lines)) {
                        // Normaliza e mapeia linhas conforme a referência
                        $lines = array_map(function($l){ return trim($l); }, $lines);
                        if (!empty($lines[1])) $headline2 = $lines[1];
                        if (!empty($lines[2])) $headlineQuestion = $lines[2];
                        if (!empty($lines[3])) $labelMulher = $lines[3];
                        if (!empty($lines[4])) $labelHomem = $lines[4];
                    }
                }
            } catch (Throwable $e) {
                // Mantém valores padrão em caso de erro
            }
            ?>
            <div id="question-1" class="quiz-step active">
                <div class="title-wrapper">
                    <span class="tag">Paso 1 de 5</span>
                    <h1><?php echo htmlspecialchars($headlineQuestion, ENT_QUOTES, 'UTF-8'); ?></h1>
                    <p class="subtitle"><?php echo htmlspecialchars($headline2, ENT_QUOTES, 'UTF-8'); ?></p>
                </div>
                <div class="options-container vertical">
                    <button type="button" class="option-button" data-question="1" data-value="f"><span class="emoji">👩</span> <?php echo htmlspecialchars($labelMulher, ENT_QUOTES, 'UTF-8'); ?></button>
                    <button type="button" class="option-button" data-question="1" data-value="m"><span class="emoji">👨</span> <?php echo htmlspecialchars($labelHomem, ENT_QUOTES, 'UTF-8'); ?></button>
                </div>
            </div>

            <div id="question-2" class="quiz-step">
                <div class="title-wrapper">
                    <span class="tag">Paso 2 de 5</span><h1>Al mirarte al espejo, ¿cuál es tu mayor preocupación?</h1>
                    <p class="subtitle">Tu respuesta nos permite personalizar el análisis.</p>
                </div>
                <div class="options-container grid">
                    <button type="button" class="option-button visual-option" data-question="2" data-value="a"><img src="img/rugas.webp" alt="Ilustración de arrugas en la piel"><span>Arrugas y "patas de gallo"</span><div class="select-indicator">Seleccionar</div></button>
                    <button type="button" class="option-button visual-option" data-question="2" data-value="b"><img src="img/flacidez.webp" alt="Ilustración de flacidez facial"><span>Flacidez y pérdida de contorno del rostro</span><div class="select-indicator">Seleccionar</div></button>
                    <button type="button" class="option-button visual-option" data-question="2" data-value="c"><img src="img/mancha.webp" alt="Ilustración de manchas en la piel"><span>Manchas y tono de piel irregular</span><div class="select-indicator">Seleccionar</div></button>
                    <button type="button" class="option-button visual-option" data-question="2" data-value="d"><img src="img/brilho.webp" alt="Ilustración de piel sin brillo"><span>Piel apagada y sin vitalidad</span><div class="select-indicator">Seleccionar</div></button>
                </div>
                <!-- Botón Continuar: visible solo cuando al menos 1 opción esté seleccionada -->
                <button type="button" id="continue-step-2" class="continue-button" aria-hidden="true" aria-disabled="true">Continuar</button>
            </div>

            <div id="question-3" class="quiz-step">
                 <div class="title-wrapper">
                    <span class="tag">Paso 3 de 5</span><h1>¿Y cómo te sientes respecto a eso?</h1>
                </div>
                <div class="options-container vertical">
                    <button type="button" class="option-button" data-question="3" data-value="d"><span class="emoji">😞</span> Siento que perdí el control sobre mi cuerpo</button>
                    <button type="button" class="option-button" data-question="3" data-value="b"><span class="emoji">👗</span> Parece que ninguna ropa me hace ver bonita</button>
                    <button type="button" class="option-button" data-question="3" data-value="c"><span class="emoji">🪞</span> Evito los espejos porque no me gusta lo que veo</button>
                    <button type="button" class="option-button" data-question="3" data-value="a"><span class="emoji">💔</span> Duele ver cómo cambió mi cuerpo</button>
                </div>
            </div>

            <!-- Novo Passo 4: Sim/Não -->
            <div id="question-4" class="quiz-step">
                 <div class="title-wrapper">
                    <span class="tag">Paso 4 de 5</span><h1>¿Has hecho actividad física o intentado comer menos y aun así no has adelgazado?</h1>
                </div>
                <div class="options-container vertical">
                    <button type="button" class="option-button" data-question="4" data-value="a"><span class="emoji">✅</span> Sí</button>
                    <button type="button" class="option-button" data-question="4" data-value="b"><span class="emoji">❌</span> No</button>
                </div>
            </div>
            
            <div id="question-5" class="quiz-step">
                 <div class="title-wrapper">
                    <span class="tag">Paso 5 de 5</span><h1>Para terminar, ¿en qué rango de edad te encuentras?</h1>
                </div>
                <div class="options-container vertical">
                    <button type="button" class="option-button" data-question="5" data-value="a">35-40 años<span class="chevron">&rsaquo;</span></button>
                    <button type="button" class="option-button" data-question="5" data-value="b">41-50 años<span class="chevron">&rsaquo;</span></button>
                    <button type="button" class="option-button" data-question="5" data-value="c">51-60 años<span class="chevron">&rsaquo;</span></button>
                    <button type="button" class="option-button" data-question="5" data-value="d">Más de 60 años<span class="chevron">&rsaquo;</span></button>
                </div>
            </div>

            <div id="loading-step" class="quiz-step">
                <div class="title-wrapper">
                    <h1>Procesando tu análisis...</h1>
                    <p class="subtitle">Estamos cruzando tus datos con nuestro sistema.</p>
                </div>
                <div class="loading-animation-wrapper">
                    <div class="transformation-container">
                        <img src="img/antes.webp" alt="Imagen de resultado antes" class="transform-image before-image">
                        <img src="img/depois.webp" alt="Imagen de resultado después" class="transform-image after-image">
                        <div class="scanner-line"></div>
                    </div>
                    <div class="loading-bar-container">
                        <div class="loading-bar"></div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="assets/js/quiz.js?v=copy-pt-pt-final"></script>
</body>
</html>
