import { sendPurchaseToN8N } from './api/lib/n8n.ts';

// Override env var before import/execution if possible, but dotenv.config() is inside n8n.ts
// Wait, dotenv.config() loads .env, but process.env takes precedence if set before or if set in shell.
process.env.N8N_WEBHOOK_URL = 'https://n8n-n8n.6jcwzd.easypanel.host:5678/webhook-test/producao';

console.log('Testing N8N webhook:', process.env.N8N_WEBHOOK_URL);
sendPurchaseToN8N('teste_manual_v3@teste.com').then((res) => {
    console.log('Result:', res);
});
