# Resolução de Bug: Fundo de Tela (Background) Quebrado ou Distorcido

## 🐛 O Problema
Em telas com muito conteúdo que exigem rolagem (como `/processing` e `/resultado`), a imagem de fundo (`background-image`) apresentava dois comportamentos indesejados em produção (principalmente no mobile):
1. **Corte abrupto:** O fundo sumia na metade da rolagem para baixo, revelando frestas em branco.
2. **Distorção ou Tela em Branco:** Ao tentar arrumar fixando a imagem, um fundo branco sólido aparecia sobrepondo os textos e arruinando a leitura.

## 🔍 Causa Raiz
A anomalia foi causada por um conflito de especificidade no dimensionamento e na superposição (Eixo Z) dos elementos CSS:

1. **Altura Rígida Global (`height: 100%`)**: No `index.css`, os contêineres vitais (`html`, `body` e `#root`) estavam travados em `100%` da tela visível. Quando a tela ultrapassava a altura da tela inicial (100vh), o elemento de fundo parava de crescer.
2. **Estiramento Absoluto (`background-size: cover`)**: Setar a imagem diretamente na classe principal (`.processingPage`) fazia com que, ao rolar a página para baixo, o navegador tentasse "esticar" a imagem para cobrir todos os 3000px de altura, distorcendo completamente seu aspecto visual.
3. **Conflito de Cor vs Imagem**: A imagem de fundo e o `background-color` (branco, originário das variáveis do index.css) dividiam o mesmo elemento. Quando isolamos a imagem com um `z-index: -1` no pseudo-elemento, a camada base herdou o fundo branco opaco que cobriu toda a imagem.

## 🛠️ A Solução (One-Shot)
Para um desenvolvedor resolver esse problema de primeira, sem precisar de múltiplas interações e sem quebrar o layout das outras páginas, a implementação padrão da web moderna é **ancorar a imagem em um pseudo-elemento `fixed` atrelado à viewport**, enquanto o pai garante flexibilidade de altura.

### 1. Desbloquear a altura global (CSS Global, ex: `index.css`):
Mudar a trava de altura flexível do navegador:
```css
html, body, #root {
  min-height: 100dvh; /* Garante no mínimo 100% da viewport dinâmica, permitindo scroll expansivo */
  margin: 0;
  padding: 0;
}
```

### 2. Isolar o Fundo no Elemento Root da Página (Módulo SCSS da Tela):
Para a classe do container principal (ex: `.processingPage`), deve-se transferir toda a lógica de fundos (Cor Base + Imagem) para o pseudo-elemento `::before`, fazendo com que ele atue como um papel de parede fixo perfeito para mobile.

```scss
.processingPage {
  width: 100%;
  flex: 1;
  min-height: 100dvh; /* Acompanha o scroll */

  /* O fundo fixo fica isolado, nunca esticando a altura ou sobrepondo elementos */
  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh; /* O papel de parede terá sempre o tamanho exato da câmera móvel do celular */
    
    // As cores e a imagem devem morar juntas aqui
    background-color: var(--color-blue-9, #141319);
    background-image: url('../../img/background-desktop.webp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    
    z-index: -1; 
    pointer-events: none; // Permite o scroll desatrelado

    @media (max-width: 768px) {
      background-image: url('../../img/background-mobile.webp');
    }
  }

  // Demais configs do container...
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Dessa forma, a documentação e os elementos na tela deslizam suavemente num container transparente por cima do nosso papel de parede perfeito e intransmutável, solucionando o bug visual imediatamente de uma só vez (One-Shot fix).
