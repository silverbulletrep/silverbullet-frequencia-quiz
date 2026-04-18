# Correções de tracking por rota

Este guia descreve o passo a passo de correção para cada rota com falhas de envio de eventos ao endpoint /eventos, incluindo o motivo e a forma correta de ajuste para garantir compatibilidade total com o schema do backend.

## Correções globais obrigatórias

### 1) Evento desire_selected
- O que está errado: o payload atual envia attributes.headline e attributes.respostas, mas o backend exige attributes.desire.
- Por que quebra: o schema valida desire_selected com attributes.desire obrigatório. Payload inválido resulta em 400.
- Como corrigir:
  1. Atualizar createFunnelTracker para enviar attributes.desire.
  2. Atualizar todas as chamadas para passar somente a string final do desejo.

Arquivo: src/lib/funnelTracker.ts
- Ajuste necessário:
  - desireSelected deve enviar { attributes: { desire: string } }

## Rota /men-success

Arquivo: src/pages/MenSuccess.jsx
- O que está errado: step_progress pode violar a ordem se o funil não estiver em age imediatamente antes, ou se houver inconsistência com o índice anterior salvo no backend.
- Por que quebra: o backend rejeita step_progress quando from_step.index não é o último step registrado para o lead.
- Como corrigir:
  1. Confirmar que o último step do lead é QUIZ_PROGRESS_STEPS.age.
  2. Se o step anterior real for outro, ajustar from_step para o step imediatamente anterior (não pular etapas).
  3. Garantir que o envio ocorre apenas uma vez por entrada na rota.

## Rota /morning-feeling

Arquivo: src/pages/MorningFeeling.jsx
- O que está errado: desire_selected envia dois parâmetros (headline e respostas), gerando payload incompatível.
- Por que quebra: backend exige attributes.desire (string única), e não aceita campos extras.
- Como corrigir:
  1. Montar desireValue como string final (já existe no código).
  2. Chamar tracker.desireSelected(desireValue).

## Rota /transition

Arquivo: src/pages/Transition.jsx
- O que está errado: from_step usa id "prova_social" e index 4, enquanto o fluxo real usa index 3 (proofMen/proofWomen). Isso pode quebrar a ordem de steps.
- Por que quebra: backend rejeita step_progress quando a sequência de índices não é contígua.
- Como corrigir:
  1. Trocar from_step para o step imediatamente anterior real.
  2. Usar QUIZ_PROGRESS_STEPS.proofMen ou QUIZ_PROGRESS_STEPS.proofWomen conforme gênero do lead.
  3. Garantir que to_step permanece QUIZ_PROGRESS_STEPS.transition.

## Rota /vsl

Arquivo: src/pages/VSL.jsx
- O que está errado: depende do step_progress anterior correto. Se /transition foi ajustado, /vsl fica válido.
- Por que quebra: backend valida ordem de steps e não aceita salto.
- Como corrigir:
  1. Manter step_progress de transition -> vsl.
  2. Validar que o step anterior registrado é transition.

## Rota /quiz-step-1

Arquivo: src/pages/QuizStep1.jsx
- O que está errado: desire_selected envia dois parâmetros, gerando payload inválido.
- Por que quebra: backend exige attributes.desire.
- Como corrigir:
  1. Usar apenas selectedOption.text para montar o desire.
  2. Chamar tracker.desireSelected(selectedOption.text).

## Rota /quiz-step-2

Arquivo: src/pages/QuizStep2.jsx
- O que está errado: desire_selected envia dois parâmetros, gerando payload inválido.
- Por que quebra: backend exige attributes.desire.
- Como corrigir:
  1. Usar apenas selectedOption.text para montar o desire.
  2. Chamar tracker.desireSelected(selectedOption.text).

## Rota /quiz-step-3

Arquivo: src/pages/QuizStep3.jsx
- O que está errado: desire_selected envia dois parâmetros, gerando payload inválido.
- Por que quebra: backend exige attributes.desire.
- Como corrigir:
  1. Usar apenas selectedOption.text para montar o desire.
  2. Chamar tracker.desireSelected(selectedOption.text).

## Rota /quiz-step-4

Arquivo: src/pages/QuizStep4.jsx
- O que está errado: desire_selected envia dois parâmetros, gerando payload inválido.
- Por que quebra: backend exige attributes.desire.
- Como corrigir:
  1. Usar apenas selectedOption.text para montar o desire.
  2. Chamar tracker.desireSelected(selectedOption.text).

## Rota /quiz-step-5

Arquivo: src/pages/QuizStep5.jsx
- O que está errado: desire_selected envia dois parâmetros, gerando payload inválido.
- Por que quebra: backend exige attributes.desire.
- Como corrigir:
  1. Usar apenas selectedOption.text para montar o desire.
  2. Chamar tracker.desireSelected(selectedOption.text).

## Rota /quiz-step-6

Arquivo: src/pages/QuizStep6.jsx
- O que está errado: o tracker é criado, mas o evento desire_selected não é enviado.
- Por que quebra: não há registro do desejo final no backend, perdendo a etapa e o dado.
- Como corrigir:
  1. Identificar o selectedOption.
  2. Enviar tracker.desireSelected(selectedOption.text).
  3. Manter o navigate após o envio.

## Validação mínima para 100% de êxito

1. Verificar no console que todas as rotas acima disparam eventos sem 400.
2. Conferir que desire_selected sempre envia attributes.desire como string.
3. Conferir que step_progress respeita ordem sequencial de índices.
4. Validar com curl:

```
curl -X POST "https://bkend-aquisicao-worker-redis-supabase.6jcwzd.easypanel.host/eventos" \
  -H "Content-Type: application/json" \
  -d "{\"event\":\"desire_selected\",\"funnel_id\":\"quiz_frquencia_01\",\"lead_id\":\"lead_test\",\"timestamp\":\"2026-01-31T12:00:00Z\",\"attributes\":{\"desire\":\"teste\"}}"
```
