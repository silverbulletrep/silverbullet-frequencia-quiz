# Handoff: Centralização e Correção do Webhook N8N (Disparo de Emails)

**Data**: 10/02/2026
**Responsável**: Antigravity (@dev)

## Resumo da Sessão
O objetivo principal foi auditar e corrigir o erro `node execution output incorrect data` no N8N. Identificamos que a inconsistência no envio de dados entre Stripe e PayPal, além da simplicidade excessiva do payload anterior, eram possíveis causas.

### Mudanças Principais
1.  **Centralização**: Criada `api/lib/n8n.ts` para unificar o disparo de webhooks.
2.  **Refatoração de Rotas**: `api/routes/paypal.ts` e `api/routes/stripe.ts` agora utilizam a biblioteca centralizada.
3.  **Habilitado DEBUG_BYPASS**: Adicionado suporte à flag `DEBUG_BYPASS` nos endpoints de finalização para permitir testes de integração sem compras reais.

### Entregáveis
- **Guia de Teste**: [handoff-n8n-testing.md](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/docs/qa/handoff-n8n-testing.md)
- **Biblioteca N8N**: `api/lib/n8n.ts`
- **Story Atualizada**: `docs/stories/story-003-1-fix-n8n-webhook.md`

## Instruções para o Desenvolvedor
1.  **Validar no N8N**: O payload enviado agora é sempre `{ "email": "..." }`. Confirme se o workflow do N8N está mapeando corretamente o campo `body` (como visto nos prints anexados na conversa).
2.  **Testes de Integração**: Utilize os comandos `curl` documentados no guia de QA para validar a conexão.
3.  **Logs**: Verifique os logs do servidor (`[N8N] ...`) para confirmar sucessos ou falhas de comunicação.

## Status das Tasks
- [x] Auditoria de código (PayPal/Stripe)
- [x] Centralização da lógica N8N
- [x] Implementação de log detalhado
- [x] Documentação de Handoff

---
*Fim da Sessão*
