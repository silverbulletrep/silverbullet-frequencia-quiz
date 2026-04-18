# Regras do endpoint /eventos

## Rate limit
- Por IP: 120 eventos por 60s
- Por session_id: 60 eventos por 60s
- Por lead_id (por funil): 60 eventos por 60s

## Validação de esquema
- Evento válido conforme tipos aceitos
- Campos obrigatórios e esperados
- Tipos corretos
- Tamanhos limitados por campo
- Payload inválido é descartado

## Ordem lógica
- Step não pode pular etapas (ex.: step 5 sem step 4)
- purchase sem checkout_start é inválido

## Tempo humano
- Mais de 15 page_view em 3s por session_id é inválido
- purchase em menos de 50ms após checkout_start é inválido

## Aceitar e validar depois
- Não bloqueia agressivamente
- Eventos inválidos são marcados como não confiáveis e não processados

## Configuração via ambiente
Se quiser ajustar os limites, você pode definir estas variáveis no ambiente:

- RATE_LIMIT_WINDOW_SECONDS (default: 60)
- RATE_LIMIT_IP_MAX (default: 120)
- RATE_LIMIT_SESSION_MAX (default: 60)
- RATE_LIMIT_LEAD_MAX (default: 60)
- PAGE_VIEW_BURST_WINDOW_SECONDS (default: 3)
- PAGE_VIEW_BURST_MAX (default: 15)
- PURCHASE_MIN_AFTER_CHECKOUT_MS (default: 50)
