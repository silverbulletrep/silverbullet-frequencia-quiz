

**Stripe Checkout – Plano de Integração (MVP)**
- Objetivo: Criar uma sessão de Checkout de assinatura via backend e redirecionar o usuário ao Stripe ao clicar no CTA do /vsl2.
- Abordagem mais fácil: Usar Stripe Checkout Session com `mode: 'subscription'` e `price_data` inline (sem precisar cadastrar produtos/price no dashboard). Opcional: aplicar um cupom “50% OFF” apenas no primeiro mês (criado no dashboard).

**Gate 0.5 – Auditoria Rápida de Infraestrutura**
- Frontend: roda em `http://localhost:5173` (Vite).
- Backend: Express em `http://localhost:3001` com rota `GET /api/health`.
- Proxy: o Vite proxia `/api` para `http://localhost:3001` (vite.config.ts já configurado).
- Banco: não necessário para este MVP do checkout.
- Teste de saúde:
  - Acessa `http://localhost:3001/api/health` para resposta JSON `{ success: true, message: 'ok' }`.
  - Alternativamente, via proxy: `http://localhost:5173/api/health` com ambos os servidores rodando.

**Padrão de Configuração da API (Frontend)**
- Usa sempre `API_BASE_URL` e URLs completas.
- Em Vite, prefira `VITE_API_URL`, mas manteremos a fallback conforme seu padrão:
  - `const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';`

---

# Guia de Integração Stripe (MVP).md

## 1) Preparar ambiente e dependências

- Contexto:
  - Vamos instalar a SDK do Stripe no backend e configurar variáveis de ambiente. O frontend só vai chamar o backend e redirecionar para `session.url`.

- Vidal: instale Stripe no backend
  - Comando:
    - `npm i stripe`
  - Crie `.env` na raiz do projeto com:
    - `STRIPE_SECRET_KEY=sk_live_ou_test_da_sua_conta`
    - `STRIPE_COUPON_ID=` (opcional; se quiser 50% off só no primeiro mês, crie um cupom “duration=once” no dashboard e preencha aqui)

- Chat: verifique se os serviços estão rodando
  - Frontend: `npm run client:dev`
  - Backend: `npm run server:dev`
  - Teste: `http://localhost:3001/api/health` deve responder JSON com `success: true`

## 2) Criar rota backend para Checkout Session

- Contexto:
  - Vamos criar um endpoint `POST /api/stripe/checkout-session` que recebe os dados básicos e cria uma sessão de assinatura mensal. E aplicamos logs detalhados (padrão obrigatório).

- Vidal: crie a rota `api/routes/stripe.ts` e registre em `api/app.ts`
  - `api/routes/stripe.ts`:
    - Implementação mínima com logs e response JSON válido:
    - Código sugerido:

```
import { Router, type Request, type Response } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

router.post('/checkout-session', async (req: Request, res: Response): Promise<void> => {
  const dados_entrada = {
    email: req.body?.email,
    // você pode adicionar metadata do quiz, plano, origem, etc.
  };

  try {
    console.log(`[STRIPE] Iniciando operação: criar_checkout_session`, { dados_entrada });

    const discounts = process.env.STRIPE_COUPON_ID
      ? [{ coupon: process.env.STRIPE_COUPON_ID }]
      : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          // Assinatura mensal: $59.99
          price_data: {
            currency: 'usd',
            unit_amount: 5999, // em cents
            product_data: {
              name: 'Inner Peace Plan - Monthly Subscription',
              description: 'Calm your mind & rediscover joy',
            },
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      // se quiser desconto 50% no primeiro mês: criar cupom `duration=once` e usar discounts
      discounts,
      // URLs de sucesso/cancelamento (vamos criar páginas simples)
      success_url: 'http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/checkout-cancel',
      customer_email: dados_entrada.email,
      metadata: {
        source: 'vsl2',
      },
    });

    console.log(`[STRIPE] Operação concluída com sucesso:`, {
      id_resultado: session.id,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      id: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error(`[STRIPE] Erro na operação: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
    });
  }
});

export default router;
```

  - `api/app.ts`:
    - Adicione:
      - `import stripeRoutes from './routes/stripe.js'`
      - `app.use('/api/stripe', stripeRoutes)`

- Chat: reinicie o backend após alterações
  - Se o nodemon não recarregar sozinho, pare e rode `npm run server:dev` novamente.
  - Teste `POST http://localhost:3001/api/stripe/checkout-session` (use Postman ou cURL) e valide que retorna `{ success: true, url: "...", id: "..." }`.

## 3) Centralizar configuração de API_BASE_URL (Frontend)

- Contexto:
  - Para evitar URLs hardcoded, vamos definir uma constante em cada arquivo que faz requisições, conforme padrão obrigatório.

- Vidal: adicione no topo dos componentes que fazem fetch:
  - `const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';`
  - Sempre use `fetch(`${API_BASE_URL}/api/...`)` (nunca URLs relativas).

- Chat: verifique se `vite.config.ts` já proxia `/api` para `3001`. Está ok.

## 4) Conectar o CTA “GET MY PLAN” no /vsl2

- Contexto:
  - No `PlanExtended.jsx` (ou diretamente no `VSL2.jsx`), o CTA “GET MY PLAN” precisa executar o `POST` e redirecionar para `session.url`.

- Vidal: implemente o handler no frontend
  - Exemplo (em `src/components/PlanExtended.jsx`):
    - No topo:
      - `const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';`
    - Crie o handler:

```
const handleCheckoutClick = async () => {
  const dados_entrada = { email: null }; // pode coletar email antes, se necessário
  try {
    console.log(`[CHECKOUT] Iniciando operação: criar sessão`, { dados_entrada });

    const response = await fetch(`${API_BASE_URL}/api/stripe/checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados_entrada),
    });

    const data = await response.json();
    if (!response.ok || !data?.url) {
      throw new Error(data?.error || 'Erro ao criar sessão de checkout');
    }

    console.log(`[CHECKOUT] Operação concluída com sucesso:`, {
      id_resultado: data.id,
      timestamp: new Date().toISOString(),
    });

    window.location.href = data.url;
  } catch (error) {
    console.error(`[CHECKOUT] Erro na operação: ${error.message}`, {
      dados_entrada,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    alert('Falha ao iniciar o checkout. Tente novamente mais tarde.');
  }
};
```

    - Conecte o handler no CTA:
      - Encontre o contêiner do botão (ex.: `styles.component4` ou wrapper) e aplique `onClick={handleCheckoutClick}`.
      - Se for um `div`, mantenha mas considere trocar por `<button>` para acessibilidade.

- Chat: teste no navegador `http://localhost:5173/vsl2` e clique no CTA
  - Deve redirecionar para a página de checkout do Stripe.

## 5) Páginas de sucesso e cancelamento

- Contexto:
  - Precisamos de páginas simples para feedback pós-checkout.

- Vidal: crie duas páginas no frontend
  - `src/pages/CheckoutSuccess.jsx` com texto de confirmação e coleta `session_id` da query string.
  - `src/pages/CheckoutCancel.jsx` com um botão para tentar novamente.
  - Adicione rotas correspondentes no seu router (`/checkout-success`, `/checkout-cancel`).
  - Opcional: Mostrar resumo da compra puxando a sessão do Stripe no backend (endpoint `GET /api/stripe/session/:id`), depois.

- Chat: valide navegação após o checkout
  - Pague no Stripe (test mode) e confirme que volta para `http://localhost:5173/checkout-success?session_id=...`.

## 6) Validações e Logs (Obrigatório)

- Checklist de Validação de Infra:
  - [ ] `http://localhost:3001/api/health` responde JSON.
  - [ ] Frontend e backend rodando sem erros no terminal.
  - [ ] Logs aparecem nos dois lados (backend `[STRIPE]`, frontend `[CHECKOUT]`).

- Checklist de URLs:
  - [ ] Todos os componentes importam/definem `API_BASE_URL`.
  - [ ] Nenhuma URL hardcoded ou relativa.
  - [ ] Portas corretas (frontend:5173, backend:3001).

- Validação Tripla:
  - [ ] Logs em tempo real (terminal e console).
  - [ ] Endpoint retorna JSON válido.
  - [ ] Fluxo end-to-end: CTA → Stripe → success/cancel.

## 7) Observações para o desconto de -50% no primeiro mês (opcional, simples)

- Contexto:
  - Para `29.99` no primeiro mês e `59.99` mensal depois, o caminho mais fácil é criar um `coupon` no Stripe Dashboard (`duration=once`, `percent_off=50`) e aplicá-lo via `discounts` na criação da sessão.
  - Alternativas mais avançadas exigem duas fases ou `trial_period_days` com invoice primeiro, que complica a UX.

- Vidal: crie um cupom no dashboard Stripe
  - `duration: once`
  - `percent_off: 50`
  - Copie o `id` do cupom e coloque em `.env` como `STRIPE_COUPON_ID=<id>`.

- Chat: confirme que a primeira cobrança ficou com -50%
  - Simule um pagamento e verifique no Stripe Dashboard.

---

**Plano de Trabalho Colaborativo (passo a passo)**

- Passo 1
  - Vidal: rode `npm i stripe`, crie `.env` e preencha `STRIPE_SECRET_KEY`.
  - Chat: enviei um prompt para mim com “Instalado stripe e .env criado, pronto para criar rota”.

- Passo 2
  - Vidal: adicione a rota `api/routes/stripe.ts` como mostrado e registre em `api/app.ts`.
  - Chat: enviei um prompt para mim com “Rota adicionada; reiniciei backend; resultado do POST /api/stripe/checkout-session”.

- Passo 3
  - Vidal: no `PlanExtended.jsx`, crie `handleCheckoutClick` e ligue no CTA.
  - Chat: enviei um prompt para mim com “Cliquei no CTA; fui redirecionado ao Stripe”.

- Passo 4
  - Vidal: crie páginas `/checkout-success` e `/checkout-cancel` e configure as rotas.
  - Chat: enviei um prompt para mim com “Finalizei compra; cheguei no success; tudo OK”.

- Passo 5 (opcional)
  - Vidal: crie um cupom `duration=once, percent_off=50` e adicione `STRIPE_COUPON_ID` no `.env`.
  - Chat: enviei um prompt para mim com “Cupom aplicado; primeira cobrança com -50% confirmada”.

---

**Notas finais**
- Não há Supabase no projeto; mantivemos o foco em Stripe e rotas Express.
- Mantivemos logs detalhados em operações críticas (backend e frontend) seguindo o padrão obrigatório.
- Evitamos criar dependências desnecessárias no frontend; não usamos `@stripe/stripe-js` pois o redirecionamento via `session.url` já resolve o MVP.
- Se quiser que o backend valide a sessão e persista no banco, criamos endpoints complementares depois.

Quer que eu já aplique os arquivos `api/routes/stripe.ts` e os ajustes no `api/app.ts` e plugar o CTA no `PlanExtended.jsx` para você testar em seguida?
        