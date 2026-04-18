<?php
    $mapa_masculino = [
        'a' => 'Abdomen',
        'b' => 'Cuerpo entero',
        'c' => 'Papada',
        'd' => 'Pecho'
    ];
$mapa_feminino = [
    'a' => 'Cuerpo entero',
    'b' => 'Celulitis',
    'c' => 'Flacidez en el brazo',
    'd' => 'Abdomen'
];
// compatibilidade retroativa caso algum fluxo ainda envie como pergunta1
$mapa_legacy = [
    'a' => 'Arrugas y "patas de gallo"',
    'b' => 'Flacidez y pérdida de contorno del rostro',
    'c' => 'Manchas y tono de piel irregular',
    'd' => 'Piel apagada y sin vitalidad'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $preocupacao_texto = 'tu preocupación';
    $sexo = isset($_POST['pergunta1']) ? $_POST['pergunta1'] : null; // 'f' ou 'm'
    if (isset($_POST['pergunta2'])) {
        $raw = $_POST['pergunta2'];
        $keys = array_map('trim', explode(',', $raw));
        $seleccionados = [];
        foreach ($keys as $k) {
            if ($sexo === 'f') {
                $seleccionados[] = isset($mapa_feminino[$k]) ? $mapa_feminino[$k] : $k;
            } else {
                $seleccionados[] = isset($mapa_masculino[$k]) ? $mapa_masculino[$k] : $k;
            }
        }
        $preocupacao_texto = implode(', ', $seleccionados);
    } elseif (isset($_POST['pergunta1'])) {
        // fallback legado (caso a preocupação venha erradamente em pergunta1)
        $preocupacao_key = $_POST['pergunta1'];
        $preocupacao_texto = isset($mapa_legacy[$preocupacao_key]) ? $mapa_legacy[$preocupacao_key] : $preocupacao_texto;
    }
    // Ajuste dinâmico do texto de audiência conforme gênero selecionado no Passo 1
    $audiencia_genero = ($sexo === 'm') ? 'hombres' : 'mujeres';
    // Preposição acordada com gênero e número
    $audiencia_preposicao = ($sexo === 'm') ? 'a los' : 'a las';
    // Nacionalidade em espanhol (acordo de gênero)
    $audiencia_nacionalidade = ($sexo === 'm') ? 'españoles' : 'españolas';
    // URL destino do VSL (evita duplicação)
    $vslUrl = 'https://vitavants.com/vsl-vitagrasa-np/';
    
    $html_resultado = '<div class="card-container result-card-conversion">
        <main class="quiz-content result-content-conversion">
            <div class="result-hook">
                <div class="checkmark-wrapper">
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
                </div>
                <h1>ANÁLISIS CONCLUIDO:</h1>
                <p class="lead-headline">Hay indicios de que <span class="lead-highlight">tus células de grasa</span> pueden estar <span class="lead-highlight">inflamadas</span>.</p>
            </div>
            <div class="vsl-section">
                <p class="vsl-intro-text lead-subheadline">Mira cómo <span class="lead-highlight">desinflamar</span> tus células de grasa — sin salir de casa — y <span class="lead-highlight">eliminar hasta 20 kg</span> en <span class="lead-highlight">pocas semanas</span>, a partir de tu preocupación por <strong>' . htmlspecialchars($preocupacao_texto, ENT_QUOTES, 'UTF-8') . '</strong>.</p>
                <a href="' . htmlspecialchars($vslUrl, ENT_QUOTES, 'UTF-8') . '" class="vsl-link">
                    <div class="vsl-thumbnail">
                        <img src="img/tumb_pressel.webp" alt="Miniatura de la presentación en video">
                        <div class="play-button"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></div>
                    </div>
                </a>
            </div>
            <div class="cta-section">
                <div class="cta-wrapper">
                    <a href="' . htmlspecialchars($vslUrl, ENT_QUOTES, 'UTF-8') . '" class="cta-button final-cta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
                        <span>SÍ, QUIERO VER AHORA</span>
                    </a>
                </div>
                <p class="cta-subtext">Acceso inmediato, 100% gratuito y privado.</p>
            </div>
            
            <div class="bullet-points-wrapper">
                <h3 class="bullet-title">En la presentación exclusiva, descubrirás:</h3>
                <div class="bullet-item"><span class="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p><strong>Cómo</strong> eliminar grasa <span style="text-transform: uppercase;">sin dietas</span> restrictivas, sin gimnasio, sin riesgos — solo <strong>desinflamando</strong> el cuerpo.</p></div>

                <div class="bullet-item"><span class="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p>Una <span style="text-transform: uppercase;">mezcla simple</span> de <strong>4 ingredientes</strong> naturales — derrite grasa 24h/día.</p></div>

                <div class="bullet-item"><span class="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p>Por qué tienes <strong>hambre</strong> constante — y cómo detenerla de forma natural.</p></div>

                <div class="bullet-item"><span class="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p><span style="text-transform: uppercase;">Truco matutino</span> de <strong>2 minutos</strong> — activa la quema de grasa todo el día.</p></div>
            </div>

            <div class="trust-urgency-wrapper">
                <div class="live-viewers"><span class="live-dot"></span><strong>Únete ' . htmlspecialchars($audiencia_preposicao, ENT_QUOTES, 'UTF-8') . ' 1.465 ' . htmlspecialchars($audiencia_genero, ENT_QUOTES, 'UTF-8') . ' ' . htmlspecialchars($audiencia_nacionalidade, ENT_QUOTES, 'UTF-8') . '</strong> que ya se han beneficiado de este método.</div>
                <p class="urgency-text">⚠️ Debido a la exclusividad, el acceso a esta presentación puede terminar en cualquier momento.</p>
            </div>
        </main>
    </div>';
} else { header('Location: index.php'); exit(); }
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Informe de Análisis</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <?php
        // Seleciona CSS conforme ambiente (dev/test vs prod)
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
        $isLocal = strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false;
        $cssUrl = $isLocal 
            ? 'assets/css/style.css?v=copy-pt-pt-final' 
            : 'https://4lifenutrition.site/quiz-rejuvenescimento/assets/css/style.css?v=copy-final-final';
    ?>
    <link id="main-style" rel="stylesheet" href="<?php echo htmlspecialchars($cssUrl, ENT_QUOTES, 'UTF-8'); ?>">
</head>
<body>
    <div class="background-pattern"></div>
    <?php if (isset($html_resultado)) { echo $html_resultado; } ?>
    <script>
      // Logs de depuração para verificar carregamento de CSS e possíveis erros
      (function () {
        function logStylesheets() {
          try {
            const sheets = Array.from(document.styleSheets).map(s => s.href || '[inline]');
            console.log('[Depuración] Hojas de estilo detectadas:', sheets);
          } catch (e) {
            console.warn('[Depuración] No fue posible listar styleSheets:', e);
          }
        }

        function attachLinkEvents() {
          const link = document.getElementById('main-style');
          if (!link) {
            console.warn('[Depuración] Link main-style no encontrado');
            return;
          }
          link.addEventListener('load', function () {
            console.log('[Depuración] CSS cargado con éxito:', link.href);
            logStylesheets();
          });
          link.addEventListener('error', function (evt) {
            console.error('[Depuración] Falló la carga del CSS:', link.href, evt);
            logStylesheets();
          });
          // Caso o evento não dispare, ainda registramos após DOM pronto
          setTimeout(logStylesheets, 1000);
        }

        window.addEventListener('error', function (e) {
          console.error('[Depuración] Error global capturado:', e.message, e.filename, e.lineno);
        }, true);

        document.addEventListener('DOMContentLoaded', function () {
          console.log('[Depuración] resultado.php DOM cargado');
          attachLinkEvents();
        });
      })();
    </script>
</body>
</html>