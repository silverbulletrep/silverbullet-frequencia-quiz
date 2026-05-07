<!--
Session handoff for the selective quiz initial page port based on commit 8169419.
Documents the base, applied delta, scope boundaries, validation results, and known warnings.
-->

# Handoff: Port seletivo do quiz inicial a partir de 8169419

Data: 2026-05-07

Branch de trabalho: `port/quiz-initial-updates-from-8169419`

Base usada: `81694191ceb996d1b145305d1c5e8f6e635c44ac`

Delta aplicado: patch incremental de `5eafab20fc6fc2bb52fdca95d7513222ce1e8149..c057da285a023a51be3f73d12168928efa959cd0`

## Objetivo

Usar `8169419` como base e aplicar apenas as atualizacoes posteriores relacionadas a UTMify e primeira tela do quiz, sem trazer o restante das mudancas existentes entre `8169419` e o `main` atual.

## Estrategia usada

Em vez de restaurar arquivos inteiros de `c057da2`, foi aplicado somente o patch incremental `5eafab2..c057da2` nos arquivos auditados. Essa estrategia evita sobrescrever diferencas legitimas que ja existiam em `8169419`.

Arquivos alterados:

- `index.html`
- `src/pages/InitialQuestions.jsx`
- `src/pages/InitialQuestions.module.scss`
- `src/i18n/locales/pt/translation.json`
- `src/i18n/locales/de/translation.json`

## O que entrou

- Script UTMify no `<head>` do `index.html`.
- Expert strip na primeira tela do quiz.
- Selecao da imagem da especialista por rota PT/DE.
- Contador ao vivo com pequena flutuacao.
- CTAs `Sou Homem` / `Sou Mulher` e equivalentes em DE.
- Prova social com tres avatares.
- Novas chaves de traducao PT/DE para copy, contador e prova social.
- Remocao de residuos sem uso apos a troca do rating antigo: `headerStyles` e `STAR_SVG`.

## O que ficou fora

- Alteracoes gerais entre `8169419` e `5eafab2`.
- Qualquer mudanca de checkout, discount modal, idle logic, Alice/Johann, VSL ou funis posteriores.
- Qualquer novo asset ou ajuste de `/alma-gemea` alem do que ja existia em `8169419`.
- Artefatos de build em `dist/`.

## Validacao executada

- `git diff --check`: passou.
- Busca por marcadores `<<<<<<<`, `=======`, `>>>>>>>`: nenhum marcador encontrado.
- `npm run typecheck`: passou.
- `npm run build`: passou.

## Avisos observados

O build exibiu apenas avisos nao bloqueantes ja presentes no projeto:

- Deprecation warnings de Sass `@import` em arquivos `QuizStep*.module.scss`.
- Warnings do Vite sobre imports dinamicos e estaticos dos mesmos modulos.

Esses pontos ficaram fora do escopo para preservar o port seletivo.
