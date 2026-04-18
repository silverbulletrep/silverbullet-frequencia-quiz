# Delay Sincronizado com VTurb — Virada de Chave e Guia de Implementação

Este documento registra a nossa virada de chave para sincronizar a exibição de elementos da página (classe `esconder`) com o tempo assistido do vídeo no VTurb SmartPlayer, incluindo passo a passo, validações, erros encontrados e as soluções aplicadas.

## Objetivo
- Exibir o container da oferta apenas após 10 segundos de reprodução real do vídeo.
- Evitar liberação instantânea por cache do VTurb ou mutações inesperadas.
- Manter rastreabilidade completa via logs e validação tripla (código + logs + backend).

## Virada de Chave
- Usar a API oficial do VTurb no evento `player:ready`: `displayHiddenElements(DELAY_SECONDS, [".esconder"], { persist: false })` para delegar a contagem de tempo de reprodução ao próprio player.
- Impor guarda de ocultação (`ensureHidden`) até atingir o limiar, prevenindo liberações antecipadas causadas por cache ou mutações de estilo/class.
- Detectar a liberação via `MutationObserver` e marcar o estado de gating como concluído (`gatingComplete` / `showOffer`).

Referências no código:
- Agendamento no `player:ready`: `src/pages/Fim.jsx:90–98`
- Guarda de ocultação: `src/pages/Fim.jsx:75–89`
- Observação de mutações e conclusão: `src/pages/Fim.jsx:132–137`
- Seção alvo: `src/pages/Fim.jsx:295`
- CSS da classe: `src/pages/Fim.module.scss:72–74` (duplicada também em `src/pages/Fim.module.scss:392–394`)

## Passo a Passo
1) Definir a classe de ocultação
- Garantir `.esconder { display: none; }` sem `!important` para permitir que o VTurb altere `display` quando necessário.
- Código: `src/pages/Fim.module.scss:72–74`.

2) Marcar o container alvo
- Aplicar a classe `esconder` no container que deve ser exibido aos 10s.
- Código: `src/pages/Fim.jsx:295`.

3) Configurar o delay centralizado
- Definir `DELAY_SECONDS = 797` (13 minutos e 17 segundos) próximo à lógica do player.
- Código: `src/pages/Fim.jsx:45–46`.

4) Agendar a liberação via VTurb no `player:ready`
- No handler `onReady`, chamar:
  - `smart.displayHiddenElements(DELAY_SECONDS, ['.esconder'], { persist: false })`
  - `persist: false` evita que visitas anteriores liberem instantaneamente.
- Código: `src/pages/Fim.jsx:90–98`.

5) Prevenir liberação prematura
- Implementar `ensureHidden()` que força `display: none` nos elementos com `.esconder` enquanto `shownRef.current` for `false`.
- Invocar `ensureHidden()` em `player:ready` e `play`.
- Código: `src/pages/Fim.jsx:75–89`, `src/pages/Fim.jsx:99–106`.

6) Detectar liberação e concluir gating
- Usar `MutationObserver` sobre o alvo `.esconder`. Quando o `display` deixar de ser `none` e `shownRef.current` ainda for `false`:
  - Marcar `shownRef.current = true`
  - Atualizar `gatingComplete` e `showOffer`
- Código: `src/pages/Fim.jsx:132–137`.

7) Logs obrigatórios
- Probes de visibilidade com `getComputedStyle` e `getBoundingClientRect` em pontos críticos:
  - `player:ready`, `play` e ao anexar o vídeo.
- Código: `src/pages/Fim.jsx:61–74`, `src/pages/Fim.jsx:90–106`.

8) Backend e base de API
- `API_BASE_URL` centralizado: `src/lib/api.ts:1–20`.
- Uso de `API_BASE_URL` no `Fim.jsx` ao enviar status do player: `src/pages/Fim.jsx:47–55`.
- Health check: `GET /api/health` (`api/app.ts:47–66`).
- Status do player: `POST /api/player/status` (`api/app.ts:38–42`).

## Validação Tripla
- Código: verificar se o handler `player:ready` está chamando `displayHiddenElements` com `persist: false` e se a classe `.esconder` não usa `!important`.
- Logs: observar `[FIM] player:ready detectado`, probes de visibilidade, e mutações.
- Backend: `GET /api/health` → 200 OK `{ success: true, message: 'ok' }` e `POST /api/player/status` → 200 OK `{ success: true }`.

## Erros Encontrados e Soluções
- Liberação instantânea após `play`
  - Causa: cache/persistência do VTurb e/ou mutações internas reativando `display`.
  - Solução: `persist: false` em `displayHiddenElements`, `ensureHidden()` para impedir visibilidade antes do limiar e detecção via `MutationObserver` para marcar a conclusão apenas quando realmente liberado.

- `timeupdate` nunca disparava
  - Causa: Shadow DOM fechado do VTurb impede acessar o `<video>` e registrar eventos diretamente.
  - Solução: usar `player:ready` + `displayHiddenElements` ao invés de depender de `timeupdate`. A contagem de tempo de reprodução fica sob responsabilidade do player.

- `.esconder` com `!important`
  - Causa: `!important` bloqueia a alteração de `display` feita pelo VTurb.
  - Solução: remover `!important`; manter somente `display: none`.

- Duplicação de regra `.esconder`
  - Causa: mesma regra definida duas vezes em `Fim.module.scss` (linhas `72–74` e `392–394`).
  - Solução: manter uma única declaração para reduzir risco de divergência. (Melhoria futura)

- Fallback por tempo de página interferindo
  - Causa: timer de página liberando elemento sem relação com tempo de vídeo.
  - Solução: remover fallback de página quando o requisito é exclusivamente tempo de vídeo.

- Conflito de portas do backend (EADDRINUSE)
  - Causa: servidor já escutando em `:3001`.
  - Solução: validar endpoints diretamente; se necessário, parar processo antigo antes de subir outro.

## Boas Práticas e Recomendações
- Centralizar delay (ex.: constante `DELAY_SECONDS`) e seletor (`['.esconder']`).
- Evitar seletor CSS redundante; manter uma única regra para `.esconder`.
- Não usar `!important` em estilos que dependem de controle do player.
- Registrar logs em pontos de decisão (`ready`, `play`, mutações), incluindo timestamps.
- Parametrizar `API_BASE_URL` por ambiente (dev/prod) e nunca usar URL relativa.
- Criar um hook reutilizável (ex.: `useSmartPlayerGating`) para eliminar duplicação e padronizar instrumentação.

## Referências
- `src/pages/Fim.jsx:45–106, 119–137, 295`
- `src/pages/Fim.module.scss:72–74, 392–394`
- `src/lib/api.ts:1–20`
- `api/app.ts:38–42, 47–66`
