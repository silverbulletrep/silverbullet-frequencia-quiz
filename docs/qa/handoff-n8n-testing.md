# Guia de Testes: Integração N8N (Disparo de Emails)

Este documento detalha o funcionamento técnico e os procedimentos de teste para a integração de disparo de emails via N8N.

## 1. Arquitetura Centralizada
A lógica de envio foi centralizada para garantir consistência entre Stripe e PayPal.

- **Localização**: `api/lib/n8n.ts`
- **Função**: `sendPurchaseToN8N(email: string)`
- **Payload**: Atualmente envia um JSON simples `{ "email": "..." }`, conforme mapeado no workflow do N8N (`{{ $json.body }}`).

## 2. Mecanismo de Bypass (DEBUG_BYPASS)
Para permitir testes sem a necessidade de uma transação real (Stripe/PayPal), implementamos um atalho de depuração nos arquivos de rotas.

### Onde está implementado:
- `api/routes/paypal.ts`: Rota `/finalize-email`
- `api/routes/stripe.ts`: Rota `/finalize`

### Como funciona:
Se o campo de ID da transação for preenchido com a string exata `"DEBUG_BYPASS"`, o sistema:
1.  **Pula** a validação externa (não consulta a API do PayPal ou Stripe).
2.  **Executa** diretamente o disparo para o N8N.
3.  Retorna um JSON de sucesso simulado: `{"success": true, "bypassed": true, "n8n": true}`.

## 3. Como Executar Testes Manuais

### Via cURL (Lado do Servidor)
É a forma mais rápida de validar se a porta e o webhook estão acessíveis:

**PayPal Simulado:**
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"orderID":"DEBUG_BYPASS","email":"seu-email@teste.com"}' \
http://localhost:3005/api/paypal/finalize-email
```

**Stripe Simulado:**
```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"payment_intent_id":"DEBUG_BYPASS","email":"seu-email@teste.com"}' \
http://localhost:3005/api/stripe/finalize
```

## 4. Variáveis de Ambiente
A configuração da URL do N8N é feita via `.env`:
- `N8N_WEBHOOK_URL`: URL completa do webhook. 
- **Nota**: Webhooks de teste do N8N (geralmente com `/webhook-test/`) devem ser configurados aqui se precisar capturar payloads no modo de edição do N8N.

## 5. Segurança e Produção
O código de bypass está ativo tanto em `development` quanto em `production`. Embora facilite os testes, deve-se ter ciência de que o endpoint de finalização aceita essa flag. O risco é minimizado pois o N8N apenas disparará um email para o endereço fornecido no corpo da requisição.
