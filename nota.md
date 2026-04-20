

🛠️ Especificação Técnica de Ajustes
Ponto 01: /VSL e /Fim (Comportamento de Scroll e Botão)
Reset de Scroll para o Topo:
Causa Provável: O componente ExitIntentGlobal (em useExitIntent.js) manipula o window.history injetando estados de "trap". No mobile, o scroll até o fundo pode acionar gestos do navegador que disparam o evento popstate, ativando o redirecionamento ou reset de scroll.
Alvo: Revisar src/hooks/useExitIntent.js e a implementação do window.__br_interceptor em VSL.jsx e Fim.jsx.
Liberação Precoce do Botão:
Causa Provável: A lógica de contingência (Scanner Visual via setInterval e MutationObserver) em VSL.jsx (linha 415-446) detecta alterações de estilo nos elementos .esconder antes do timer absoluto de 199s (3:19). O Vturb pode estar injetando estilos parciais que "enganam" o scanner.
Ajuste Sugerido: Aumentar o DELAY_SECONDS ou tornar o Scanner Visual mais rigoroso (checar se opacity === "1" e não apenas display !== "none").
Ponto 03: /resultado (UX e Interatividade)
Carregamento no Rodapé:
Causa Provável: Foco automático no input do showContactModal ou a execução de scrollIntoView em componentes filhos (FimBelowFold) que carregam após a montagem do pai.
Alvo: Verificar se o useEffect de Resultado.jsx (linha 102) está sendo sobrescrito por renderizações subsequentes de componentes lazy-loaded.
Termo "Entropia de Abundância":
Localização: Resultado.jsx, objeto copyMatrix (linha 244). Precisa de alteração para um termo mais acessível.
Aparição do Card Final (Next Page):
Causa Técnica: Em Resultado.jsx (linha 376), o setShowFinalCta possui um delay rígido de 1500ms após o quarto card aparecer. Esse tempo é insuficiente para leitura.
Ajuste Sugerido: Aumentar o delay para 3000ms a 4000ms ou basear a aparição em uma interação de scroll do usuário.
Ponto 04: /Fim (Checkout e Validação)
Carregamento no Rodapé: Mesma raiz do Ponto 03 (verificar conflito de scroll no Fim.jsx).
Pre-seleção MBway:
Alvo: O componente PaymentMethodModal (importado em FimBelowFold.jsx) precisa receber uma prop defaultMethod="mbway" ou inicializar seu estado interno com este valor. A pré seleção é basicamente a opção de MBWAY começar com o etado de hover.