# Story 002: Ajustar Velocidade de Reprodução de Áudio no AudioUpsell

**Status**: Ready for Review
**Prioridade**: Média
**Tipo**: Melhoria
**Agente**: @dev

## Contexto
O áudio na página de Upsell de Áudio (`src/pages/AudioUpsell.jsx`) é atualmente percebido como "acelerado". A implementação atual força estritamente a taxa de 1.0x e impede ajustes. Precisamos reduzir para **0.9x**.

Além disso, existe um botão (CTA) que é liberado em um momento específico da mensagem ("pitch"). Precisamos garantir que essa liberação continue sincronizada com o conteúdo do áudio, mesmo com a velocidade alterada.

## Auditoria Atual
- **Velocidade Atual**: Forçada em **1.0x**.
    - O código possui um listener `onRateChange` que redefine `playbackRate = 1` se alterado.
- **Arquivo de Áudio**: Localizado em `public/Audio/Upsell-Audio.mp3`.
- **Sincronização CTA (Botão de Compra)**:
    - O botão é liberado quando `audio.currentTime >= 485` (8:05 de áudio).
    - **Por que continua sincronizado?**: Diferente do tempo de relógio, o `currentTime` é a posição absoluta dentro do arquivo de áudio. Se o áudio toca a 0.9x, o navegador leva mais tempo real para chegar na marca de 485s, mas quando chega lá, o locutor estará exatamente no mesmo ponto da frase. **Portanto, a sincronia entre FALA e BOTÃO é nativamente preservada pelo uso de `currentTime`.**
- **Sincronização Barra de Progresso Global (Topo)**:
    - **Requisito (Novo)**: "Start Imediato com Ilusão de Velocidade".
    - **Comportamento**:
        1.  **Ao Carregar Página**: A barra deve iniciar imediatamente (sem esperar o play).
        2.  **Curva de Progresso**: Deve progredir rapidamente no início (ex: `easeOutQuad` ou logarítmico) para dar a impressão de velocidade, depois desacelerar.
        3.  **Sincronia Final**: A barra **só deve atingir 100% quando o áudio terminar**. Se o usuário não der play, a barra deve "quase" chegar lá (ex: assintotar em 95-98%) mas nunca finalizar sozinha.
    - **Implementação Sugerida**:
        -   Manter um timer interno (`t_fake`) que cresce rápido até ~30% e desacelera até 98% (assíntota).
        -   Calcular `P_audio = audio.currentTime / audio.duration`.
        -   Exibir `P_final = MAX(P_fake, P_audio)`.
        -   **Trava Final**: `P_final` não pode exceder 99% a menos que `audio.ended` seja `true`.

## Objetivos
1.  Reduzir velocidade para **0.9x**.
2.  Remover travas de velocidade.
3.  Corrigir a barra de progresso global para respeitar a duração real ajustada pela velocidade.

## Tarefas de Implementação
- [x] **Ajustar Velocidade**:
    - [x] Remover listener `onRateChange` ou a lógica de reset para 1.0x em `src/pages/AudioUpsell.jsx`.
    - [x] Definir `d.playbackRate = 0.9` no `togglePlay` e inicialização.
- [x] **Corrigir Barra de Progresso (Topo)**:
    - [x] Alterar o cálculo de `EXPECTED_DURATION_SEC` ou a lógica de progresso.
    - [x] Idealmente, vincular `setStageProgress` ao `onTimeUpdate` do áudio (assim como o anel visual), em vez de um timer independente.
    - [x] Se não for possível vincular, ajustar `EXPECTED_DURATION_SEC` para `OriginalDuration / 0.9`.

## Critérios de Aceite
- [x] Áudio toca a **0.9x** e mantém o tom natural (`preservesPitch`).
- [x] CTA ("Botão de Compra") aparece no momento correto da fala (sincronizado).
- [x] Barra de progresso no topo da tela termina junto com o áudio (e não antes).

## Plano de Teste Manual
1.  **Verificar Velocidade**: Ouvir o áudio e sentir se está mais lento. Abrir console e digitar `document.querySelector('audio').playbackRate` (deve ser 0.9).
2.  **Verificar Pitch**: A voz não deve parecer grossa/robótica.
3.  **Verificar CTA**:
    - Adiantar áudio para 8:00 (480s).
    - Esperar 5 segundos de *conteúdo* (na velocidade 0.9x, levará ~5.5s reais).
    - O botão deve aparecer.
4.  **Verificar Barra de Progresso**:
    - Adiantar áudio para perto do final.
    - A barra superior não deve estar cheia se o áudio ainda não acabou.

## Arquivos
- `src/pages/AudioUpsell.jsx` (modificado)
- `public/Audio/Upsell-Audio.mp3`

## Dev Agent Record

### Change Log
- `src/pages/AudioUpsell.jsx`: Alterado playbackRate de 1.0 para 0.9, removida trava onRateChange, ajustado EXPECTED_DURATION_SEC para 867s, sincronizada barra de progresso global com onTimeUpdate do áudio.

### Completion Notes
- Todas as 4 alterações aplicadas e verificadas via análise estática.
- Nenhuma referência antiga a 1.0x permanece no arquivo.
- Barra de progresso agora travada em 99% até audio.ended.
- Agent Model: Antigravity (Gemini)



## QA Results

### Gate: PASS
- **Date**: 2026-02-10
- **Reviewer**: Quinn (@qa)
- **Decision**: APPROVE
- **Notes**: Manual code review confirmed all ACs met. Speed reduced to 0.9x, locks removed, progress bar logic updated. Low risk.
