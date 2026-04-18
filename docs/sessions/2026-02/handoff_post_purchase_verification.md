# Handoff: Verificação Post-Purchase Email e Padrão de Logs

**Data:** 10/02/2026
**Objetivo:** Instruir o SM/Dev Agent a padronizar logs e documentar a lógica implementada na verificação de email pós-venda.

## 1. Contexto das Alterações Recentes
Para garantir a confiabilidade do envio de emails pós-venda (PayPal e Stripe), implementamos um fluxo de simulação e "Debug Bypass".

*   **Frontend (`src/pages/Fim.jsx`):**
    *   Adicionados botões "Simular PayPal (Debug)" e "Simular Stripe (Debug)".
    *   **Simulação:** Solicita email -> Envia ID especial `DEBUG_BYPASS` para o backend.
    *   **API Fix:** Corrigido `src/lib/api.ts` para respeitar `VITE_API_URL` em localhost (antes forçava produção).

*   **Backend (`api/routes/paypal.ts`, `api/routes/stripe.ts`):**
    *   **Bypass:** Se receber ID `DEBUG_BYPASS`, pula validação de transação real e dispara email para N8N diretamente.
    *   **HIT Logs:** Logs explícitos no início das rotas para confirmar recebimento.

## 2. Padrão de Logs para Simulação em Massa (Instrução para SM)
Para facilitar auditorias e simulações futuras, adotamos um padrão numérico de logs críticos. O SM deve instruir os devs a seguir este padrão em fluxos complexos:

*   **`01: Calling [Operação]...`**
    *   Indica o início de uma ação crítica (ex: chamar API de finalize).
    *   Deve conter dados contextuais essenciais.
*   **`02: Debug/Condition [Estado]...`**
    *   Logs intermediários que explicam *por que* algo aconteceu (ex: "Debug Bypass Ativo", "Condição X satisfeita").
    *   Crucial para entender desvios de fluxo em testes.
*   **`03: Response [Resultado]...`**
    *   Log final da operação. Deve indicar claramente Sucesso, Falha ou *Bypassed*.
    *   Deve conter dados de retorno (ex: `{ success: true, bypassed: true }`).

### Exemplo de Logs no Console (`Fim.jsx`):
```text
[FIM] 01: Calling finalizePayPalEmail...
[FIM] 02: Debug Bypass (Sending DEBUG_BYPASS ID to backend)
[FIM] 03: Finalize response: { success: true, bypassed: true, n8n: true }
```

## 3. Action Items para o SM (Adicionar ao Checklist da Story)
Por favor, adicione os seguintes itens no checklist da `docs/stories/story-003-verify-post-purchase-email.md` (ou stories futuras similares):

- [ ] **Mapeamento de Logs Detalhados:**
    - [ ] Implementar logs seguindo o padrão `01 (Call), 02 (Logic), 03 (Result)` em todas as funções críticas de checkout/finalize.
    - [ ] Garantir que o log `02` capture estados de simulação ou condições de borda.
- [ ] **Documentação da Lógica de Funções:**
    - [ ] Explicar no checklist (ou em docs técnicos) a lógica das funções alteradas:
        -   `simulatePurchase`: Como gera dados fake e aciona o fluxo.
        -   `finalizePayPalEmail`: Como trata o `DEBUG_BYPASS` para pular validação.
        -   `resolveApiBase`: Como decide entre localhost e produção (crucial para evitar erros 404/CORS).
