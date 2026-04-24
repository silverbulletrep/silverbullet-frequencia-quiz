# Purchase Capture Implementation Plan

## Status
Official planning baseline for Epic 10 based on audited code and operations as of 2026-04-23.

## Objective

Consolidar a captura e a reconciliacao de compra entre Hotmart, Stripe e PayPal sem quebrar o funil atual, o onboarding operacional em N8N e a ponte futura para o Epic 13.

## Scope and guardrails

- Esta baseline oficializa o estado real atual dos pontos de captura e define o contrato alvo de compra reconciliada.
- Esta story nao implementa tabela nova, ledger unificado, idempotencia cross-provider nem persistencia final no CRM.
- Redirect, success page, navegacao para upsell e callback de frontend nao confirmam compra por si so.
- A confirmacao de compra continua vindo do backend, webhook ou callback confiavel do provider.
- O fluxo operacional atual do N8N deve continuar recebendo `buyer.email` ou equivalente e `lead_id` reconciliado quando disponivel.

## Inherited decisions from Story 10.1

Story 10.1 ja aprovou os principios abaixo e eles passam a valer aqui:

- `purchase` e `upsell_purchase` sao eventos de compra confirmada.
- `checkout_start` continua sendo o evento canonico de inicio de checkout.
- Compra confirmada depende de backend ou webhook como fonte de verdade.
- O contrato minimo precisa preservar compatibilidade com Hotmart atual, N8N, dashboard e consumers do CRM.
- Para Hotmart atual, `transaction` continua sendo identificador obrigatorio de reconciliacao.

## Audited current capture points

### Frontend ownership

| Layer | Current role | Audited fact |
|---|---|---|
| `src/pages/Fim.jsx` | Orquestra a pagina final da oferta | A pagina monta `FimBelowFold` e governa a UX, mas nao confirma compra |
| `src/pages/FimBelowFold.jsx` | Disparo de checkout da oferta principal | PT emite `checkout_start`, deriva `lead_id_short` e redireciona para Hotmart; DE abre `CheckoutModal` |
| `src/components/CheckoutModal.jsx` | Checkout proprio Stripe/PayPal | Stripe cria `PaymentIntent` com `lead_id` em metadata; PayPal cria order com `lead_id` em metadata e fecha `capture-order` + `finalize-email` |
| `src/pages/AudioUpsell.jsx` | Checkout do upsell | O upsell ja possui trilha propria e chama `updateLeadPurchase(...)` apos sucesso |

### Current provider capture map

| Provider | Frontend trigger | Backend confirmation handlers | Current operational output |
|---|---|---|---|
| Hotmart | `FimBelowFold.jsx` envia `checkout_start`, deriva `lead_id_short`, monta `sck` e redireciona | N8N recebe o webhook atual do provider | Lookup por `transaction`, registro de `purchase`, welcome email por `buyer.email` |
| Stripe | `CheckoutModal.jsx` cria `PaymentIntent` com metadata e chama `onSuccess` apos confirmar pagamento | `POST /api/stripe/payment-intent`, `POST /api/stripe/finalize`, `POST /api/stripe/webhook` | Meta CAPI + N8N, com flags `capi_dispatched` e `n8n_dispatched` na metadata do provider |
| PayPal | `CheckoutModal.jsx` cria order com metadata, chama `capture-order` e depois `finalize-email` | `POST /api/paypal/create-order`, `POST /api/paypal/capture-order`, `POST /api/paypal/finalize-email` | Meta CAPI + N8N, com `lead_id` propagado via `custom_id` |

### Current Hotmart operational facts

- O funil deriva `lead_id_short` a partir de `lead_id`.
- O checkout Hotmart recebe `sck` e `email` por query string.
- O `checkout_start` do frontend ja carrega `lead_id_short`, `checkout_origin` e `payment_method`.
- O fluxo operacional atual do N8N procura o lead por `body.data.purchase.transaction`.
- O N8N atual usa `body.data.buyer.email` para disparar o welcome email.

### Current Stripe operational facts

- O checkout proprio atual usa `PaymentIntent`, nao depende de redirect externo para confirmar compra.
- O frontend manda `lead_id` em metadata ao criar o `PaymentIntent`.
- O backend tem duas trilhas reais de fechamento: `finalize` e `webhook`.
- O webhook `payment_intent.succeeded` ja existe e usa corpo bruto para validacao de assinatura.
- `finalize` e `webhook` hoje tambem fazem CAPI e N8N.

### Current PayPal operational facts

- O frontend manda `lead_id` e `origin` em metadata na criacao da order.
- O backend grava esses dados em `purchase_units[].custom_id`.
- `capture-order` coleta evidencia transacional.
- `finalize-email` garante `COMPLETED`, resolve `lead_id` de `custom_id` e dispara CAPI + N8N.
- Quando o email nao volta na captura, o frontend coleta o email manualmente antes de chamar `finalize-email`.

## Normalized confirmed purchase contract

Toda compra confirmada deve resultar em um registro normalizado e auditavel com o shape minimo abaixo.

| Field | Required | Notes |
|---|---|---|
| `provider` | yes | `hotmart`, `stripe`, `paypal` |
| `provider_order_id` | yes | `transaction`, `order_id` ou identificador equivalente do pedido confirmado |
| `provider_payment_id` | conditional | Ex.: `payment_intent_id`, capture id ou equivalente |
| `provider_checkout_id` | conditional | Ex.: `checkout_session_id` quando existir |
| `lead_id` | yes after reconciliation | Pode chegar direto ou ser reconciliado depois; o registro final precisa ter `lead_id` |
| `lead_id_short` | conditional | Obrigatorio quando existir trilha Hotmart |
| `sck` | conditional | Obrigatorio quando a reconciliacao Hotmart usar query param |
| `buyer_email` | yes for current operations | Campo operacional minimo para onboarding atual |
| `payment_method` | yes | Metodo confirmado pelo provider ou metodo escolhido no checkout quando esse for o melhor dado disponivel |
| `gross_revenue` | yes | Valor bruto confirmado |
| `currency` | yes | ISO 4217 |
| `product_id` | yes | Produto principal ou upsell |
| `product_name` | yes | O checkout ou a camada de reconciliacao deve preencher o nome do produto confirmado |
| `checkout_origin` | yes | Origem funcional do checkout, ex.: `fim`, `audio_upsell`, `recovery_email` |
| `journey_type` | yes | `front`, `recovery`, `upsell` |
| `purchase_kind` | yes | `main` ou `upsell` |
| `confirmed_at` | yes | Timestamp da confirmacao confiavel |
| `source_layer` | yes | `backend` ou `webhook` |
| `source_system` | yes | `hotmart`, `stripe`, `paypal`, `n8n` ou camada de ingestao |

### Compatibility fields inherited from 10.1

O contrato normalizado nao elimina os campos de compatibilidade ja aprovados em 10.1:

- `purchase.product_id`
- `purchase.product_name` quando conhecido
- `purchase.value`
- `purchase.currency`
- `attributes.transaction`, `attributes.order_id` ou `attributes.checkout_id`
- payload bruto ou mapeamento equivalente que preserve `buyer.email`

## Required versus optional fields by provider

| Field | Hotmart | Stripe | PayPal |
|---|---|---|---|
| `lead_id` | reconciled | direct via metadata | direct via metadata/custom_id |
| `lead_id_short` | required | optional | optional |
| `sck` | required | no | no |
| `provider_order_id` | `transaction` | `payment_intent_id` no fluxo atual com `PaymentIntent`; `checkout_session_id` apenas como identificador complementar quando houver session | `order_id` |
| `provider_payment_id` | optional | `payment_intent_id` no fluxo atual | capture id quando existir |
| `provider_checkout_id` | optional | `checkout_session_id` quando existir | optional |
| `buyer_email` | `buyer.email` | `receipt_email`, billing email, customer email ou body email | `payer.email_address` ou email coletado no finalize |
| `payment_method` | vem do checkout/start ou payload provider | vem do PaymentIntent/charge | vem de order/capture quando disponivel |
| `checkout_origin` | required | required | required |
| `journey_type` | required | required | required |
| `purchase_kind` | required | required | required |

## Identity propagation and reconciliation

### Global rule

Cada compra confirmada precisa terminar com um `lead_id` reconciliado e auditavel, mesmo quando o provider nao carregar `lead_id` diretamente no evento final.

### Reconciliation precedence by provider

| Provider | Input identity chain | Reconciliation rule | Final audit key |
|---|---|---|---|
| Hotmart | `lead_id` -> `lead_id_short` -> `sck` -> `transaction` | preservar `transaction` como chave operacional atual e manter ponte audivel entre `lead_id_short/sck` e `lead_id` | `provider = hotmart + transaction` |
| Stripe | `lead_id` em metadata -> `payment_intent_id` -> `checkout_session_id` quando houver | o registro final deve casar metadata do intent com a confirmacao de `payment_intent.succeeded`; `finalize` nao cria compra paralela | `provider = stripe + payment_intent_id` |
| PayPal | `lead_id` em metadata -> `custom_id` -> `order_id` -> capture | o registro final deve reconciliar `lead_id` a partir de `custom_id` e usar `order_id` como ancora primaria | `provider = paypal + order_id` |

### Hotmart closure

Hotmart exige uma ponte explicita e preservada:

1. O funil gera `lead_id_short` a partir de `lead_id`.
2. `lead_id_short` vai para `sck` na URL do checkout.
3. O provider devolve `transaction` no callback/webhook de compra.
4. O sistema atual localiza o lead por `transaction`.
5. O plano oficial passa a exigir que a trilha `lead_id_short -> sck -> transaction -> lead_id` seja auditavel no CRM.

Regra oficial:

- `transaction` continua sendo o identificador minimo obrigatorio para Hotmart.
- `sck` e `lead_id_short` nao confirmam compra; eles semeiam a reconciliacao.
- O registro final de compra precisa guardar `transaction`, `lead_id_short`, `sck` e `lead_id` quando esses valores existirem.

### Stripe closure

- `lead_id` ja chega no backend via metadata do `PaymentIntent`.
- O identificador tecnico primario de compra confirmada passa a ser `payment_intent_id`.
- `checkout_session_id` entra apenas como identificador complementar quando o fluxo usar session.
- `finalize` e `webhook` devem convergir para o mesmo registro logico de compra.

### PayPal closure

- `lead_id` deve ser propagado em metadata no frontend e gravado em `custom_id` no backend.
- `order_id` e o identificador primario de reconciliacao.
- O capture id entra como `provider_payment_id` quando existir.
- `finalize-email` nao pode criar uma compra diferente da detectada em `capture-order`; ambos precisam fechar a mesma entidade logica.

## Source of truth for confirmation

| Provider | Confirmed purchase source of truth | Complementary step | Explicit non-source-of-truth |
|---|---|---|---|
| Hotmart | webhook ou callback confirmado do provider | ingestao operacional atual no N8N | redirect para checkout, volta para pagina, navegacao do usuario |
| Stripe | `payment_intent.succeeded` no webhook | `POST /api/stripe/finalize` para fechamento operacional, CAPI, N8N e reconciliacao imediata | `onSuccess` no frontend, success page, navegacao para upsell |
| PayPal | pedido `COMPLETED`, observado em `capture-order` ou garantido em `finalize-email` | `finalize-email` fecha email operacional, CAPI e N8N | aprovacao de checkout sem captura completa, redirect, navegacao do usuario |

Regra oficial:

- frontend pode indicar intencao e contexto;
- backend e webhook confirmam compra;
- sucesso visual ou navegacao nunca substituem confirmacao transacional.

## Journey type and purchase kind

### `journey_type`

| Value | Objective rule |
|---|---|
| `front` | compra iniciada no fluxo principal de oferta, sem touch de recovery associado |
| `recovery` | compra principal iniciada apos touch de recovery, com `origin_touch_id` ou `origin_run_id` quando essa camada existir |
| `upsell` | compra complementar iniciada no fluxo pos-compra, ex.: `audio_upsell` |

### `purchase_kind`

| Value | Objective rule |
|---|---|
| `main` | compra do produto principal do funil, mesmo quando acontecer via recovery |
| `upsell` | compra de oferta complementar, order bump ou extensao pos-compra |

Regra de combinacao:

- `journey_type = recovery` pode coexistir com `purchase_kind = main`.
- `journey_type = upsell` deve implicar `purchase_kind = upsell`.
- `event_type = purchase` representa a compra principal confirmada.
- `event_type = upsell_purchase` representa a compra complementar confirmada.

## Provider implementation closure

### Hotmart

Current state:

- checkout principal PT ja envia `lead_id_short`, `payment_method`, `checkout_origin` e `email` antes do redirect;
- a operacao atual do N8N depende de `transaction` e `buyer.email`.

Official closure for implementation:

- manter `sck` por compatibilidade operacional;
- preservar `transaction` como ancora minima de reconciliacao;
- formalizar a traducao `lead_id_short/sck -> lead_id`;
- normalizar a compra confirmada para o contrato comum;
- manter `buyer.email` exposto para onboarding atual.

Open gap carried to Epic 13:

- falta uma camada unica no CRM que registre essa reconciliacao fora do N8N.

### Stripe

Current state:

- `PaymentIntent` ja recebe `lead_id` em metadata;
- `finalize` e `webhook` ja disparam CAPI + N8N;
- a metadata atual carrega flags `capi_dispatched` e `n8n_dispatched`.

Official closure for implementation:

- tratar `payment_intent.succeeded` como confirmacao assincrona primaria;
- manter `finalize` como trilha sincrona complementar e imediata;
- reconciliar por `payment_intent_id`, com `checkout_session_id` como apoio quando existir;
- mover a idempotencia para a camada de ledger do CRM no Epic 13, nao permanecer dependente apenas da metadata do provider.

Open gaps carried to Epic 13:

- persistencia unica para `finalize` e `webhook`;
- estrategia final de idempotencia fora do Stripe metadata;
- promocao de `checkout_origin`, `journey_type`, `product_id` e `purchase_kind` para contrato confirmado persistido.

### PayPal

Current state:

- `create-order` ja serializa `origin` e `lead_id` em `custom_id`;
- `capture-order` recolhe evidencia transacional;
- `finalize-email` garante status `COMPLETED`, resolve `lead_id`, cobre email operacional e dispara CAPI + N8N.

Official closure for implementation:

- usar `order_id` como ancora primaria do registro;
- usar capture id como `provider_payment_id` quando disponivel;
- tratar `capture-order` e `finalize-email` como duas etapas sobre a mesma compra logica;
- garantir que `buyer_email` sempre exista na saida operacional final, seja vindo do provider ou da coleta manual.

Open gaps carried to Epic 13:

- persistencia unica entre capture e finalize;
- regra final de idempotencia para capturas repetidas;
- contrato comum de auditoria entre `order_id`, capture id e `lead_id`.

## Minimal operational output for N8N and onboarding

Enquanto o onboarding atual depender do workflow existente, a camada de compra reconciliada deve sempre produzir:

| Field | Why it must exist |
|---|---|
| `buyer_email` | necessario para welcome email e onboarding atual |
| `lead_id` reconciliado quando disponivel | necessario para ligar compra ao lead do CRM |
| `provider` | necessario para auditoria e roteamento |
| `provider_order_id` | necessario para suporte e reconciliacao |
| `purchase_kind` | necessario para distinguir compra principal de upsell |
| `journey_type` | necessario para futura atribuicao front vs recovery vs upsell |

Regra operacional:

- Hotmart continua aceitando `buyer.email` como fonte atual;
- Stripe deve resolver email por `receipt_email`, billing email, customer email ou body email;
- PayPal deve resolver email por `payer.email_address` ou pela coleta manual antes do `finalize-email`;
- `lead_id` reconciliado deve acompanhar a carga sempre que a reconciliacao existir.

## Ownership of downstream reactions

| Concern | Current owner | Future owner |
|---|---|---|
| Confirmar compra no ponto de venda | backend ou webhook do provider | camada unificada de ingestao do CRM |
| Disparo de onboarding principal | N8N + integrações operacionais atuais | Story 13.1 consome compra reconciliada como fonte confiavel |
| Reacoes a `purchase` | operacao atual + CRM channel ops | Epic 13 / Story 13.1 |
| Reacoes a `upsell_purchase` | fluxo especifico do upsell | Epic 13 / Story 13.1 |

Regra oficial:

- `purchase` e `upsell_purchase` passam a ser os gatilhos funcionais confiaveis do pos-compra;
- a producao do evento e responsabilidade da camada de confirmacao reconciliada;
- os fluxos de canal sao consumidores dessa compra reconciliada, nao produtores da confirmacao.

## Bridge to Stories 13.1, 13.2 and 13.3

### Story 13.1

Deve herdar desta baseline:

- compra reconciliada como fonte confiavel do pos-compra;
- dependencia operacional de `buyer_email` ou equivalente para onboarding atual;
- ownership dos fluxos que reagem a `purchase` e `upsell_purchase`;
- contrato minimo normalizado aprovado nesta story.

### Story 13.2

Deve implementar:

- ledger ou tabela normalizada de compra confirmada;
- reconciliacao real entre Hotmart, Stripe e PayPal;
- fechamento de `provider_order_id`, `provider_payment_id`, `provider_checkout_id`;
- persistencia unica para compra principal e upsell.

### Story 13.3

Deve implementar:

- idempotencia cross-provider;
- regra explicita para nao duplicar Stripe entre `finalize` e `webhook`;
- regra explicita para nao duplicar PayPal entre `capture-order` e `finalize-email`;
- estrategia equivalente para Hotmart.

## Open persistence and idempotency gaps

- Hoje Stripe depende parcialmente de flags `capi_dispatched` e `n8n_dispatched` na metadata do provider.
- Hoje PayPal ainda fecha a operacao em dois pontos distintos: `capture-order` e `finalize-email`.
- Hoje Hotmart ainda nao participa da mesma camada unificada de persistencia confirmada.
- O CRM ainda nao possui ledger normalizado e append-only que absorva a compra reconciliada fora dos providers.

Esses gaps ficam deliberadamente para o Epic 13.

## Recommended implementation order

1. Fixar no CRM o contrato minimo desta baseline.
2. Implementar a ponte de identidade Hotmart `lead_id_short/sck -> transaction -> lead_id`.
3. Criar a persistencia unificada de compra confirmada para Stripe e PayPal.
4. Trazer Hotmart para a mesma camada de confirmacao reconciliada.
5. Ligar Story 13.1 aos eventos `purchase` e `upsell_purchase` reconciliados.
6. Fechar idempotencia e auditoria operacional na Story 13.3.

## Definition of ready for implementation

- cada provider tem fonte de verdade explicitada;
- cada provider tem regra de reconciliacao ate `lead_id`;
- `purchase_kind` e `journey_type` possuem criterio objetivo e nao ambiguo;
- `buyer_email` ou equivalente permanece disponivel para onboarding atual;
- as dependencias de persistencia e idempotencia ficam explicitamente delegadas para 13.2 e 13.3.
