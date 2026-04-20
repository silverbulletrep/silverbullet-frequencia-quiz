# Handoff da Sessão: Localização DE e Refatoração de Checkout
**Data:** 18 de Abril de 2026
**Objetivo Concluído:** Localização Alemã (DE) das rotas do Funil de Aquisição, Paridade do Checkout de SDK (Stripe/PayPal), e preparação do N8N Payload para o JohannChat.

---

## ⚠️ Checklist de Qualidade (Manual QA)

Siga os passos abaixo para testar toda a implementação em seu ambiente local antes de fazer deploy em produção.

### 1. Teste de Pagamentos (Front-end Rendering)
*Dica:* Como o Vite estava rodando quando criamos o arquivo `.env`, você pode precisar parar e rodar `npm run dev` novamente para ele enxergar as variáveis de ambiente recém-criadas.
- [ ] **Ambiente:** Verifique se as variáveis `VITE_STRIPE_PUBLISHABLE_KEY` e `VITE_PAYPAL_CLIENT_ID` estão injetadas (já criei o `.env` para você). **Cuidado:** Você forneceu as chaves `LIVE` (produção). Se for processar um teste, será uma transação real.
- [ ] Acesso à Rota: Entre em `http://localhost:5173/de/fim`
- [ ] **Stripe Elements Renderizado:** Clique para comprar. O modal da Stripe deve carregar os campos de cartão perfeitamente (sem erro "Stripe não carregado").
- [ ] **PayPal SDK Renderizado:** O botão inteligente amarelo do PayPal deve aparecer na mesma modal.

### 2. Teste de Roteamento de Checkout (PT x DE)
- [ ] Rota `/de/fim`: O clique na compra abre o **Modal de SDK (Stripe/PayPal)**.
- [ ] Rota `/pt/fim` (ou apenas `/fim`): O clique na compra redireciona ou abre a **Hotmart** (fluxo antigo).

### 3. Teste do Upsell (Audio Upsell)
- [ ] Após concluir um checkout na rota DE, confirme se você é direcionado automaticamente para `/de/audio-upsell`.
- [ ] Na página do Upsell, observe se o áudio está carregando normalmente.
- [ ] Clique no botão de aceitar o Upsell e confirme se o modal de Checkout renderiza novamente para Stripe/PayPal com o valor para a versão de áudio (47 EUR ou valor correspondente).

### 4. Revisão de Traduções (i18n)
- [ ] Passe pelas rotas `/de/compont-test-1` até `/de/compont-test-6`. Verifique se o selo está traduzido para *"Vibrationsuntersuchung"* e não o antigo hardcoded "Exame Vibracional".
- [ ] Verifique no balão sob o player de vídeo em `/de/vsl` que a mensagem exibe a versão alemã de "Preparando as questões do seu exame vibracional...".

### 5. Validação de Chatbot (JohannChat & N8N)
- [ ] Caia na rota de chatbot simulando um abandono, por exemplo, `/de/quiz`.
- [ ] Verifique as strings na interface (Ex: Abaixo do nome do Johann, deve estar Escrito online, o placeholder deve ser *Nachricht*).
- [ ] **Integração N8N:** Digite algo no chat. Abra o F12 -> *Network (Rede)*. Identifique a requisição `POST` disparando para a URL do seu N8N.
- [ ] Clique na Payload da requisição e comprove que ele enviou com sucesso: `"language": "de"`.

---

## 🛠 Responsabilidades no lado do N8N (Ação do Backend Stakeholder)
Com a payload enviando o `"language"`, o passo final para ter a inteligência artificial multilíngue rodando fica sob sua posse no orchestrador N8N:

1. **Adicionar o Switch Node:** Logo após o Webhook Node, use as condições *(if data.language == "de")*.
2. **Prompts e Templates:** Troque o *System Prompt* de Português para Alemão nessa bifurcação. Se o webhook enviar respostas automáticas via Template Message (WhatsApp Cloud API), mude o Template ID para a ID em Alemão devidamente validada no Facebook Manager.

---
**Fim de Sessão.**
Qualquer falha num dos pontos do checklist poderá guiar nosso reajuste. Se todos marcarem check, o projeto já pode seguir para QA no Vercel/Hostinger e, posteriormente, liberação na rede de anúncios DE!
