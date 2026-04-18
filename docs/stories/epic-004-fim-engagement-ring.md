# Epic 004: Engajamento Ativo na Página /fim — Ring + Chat Box do Especialista

**Status:** Draft  
**Priority:** High  
**Owner:** PM (Morgan)  
**Criado em:** 2026-02-22  
**Próximo Epic:** 004

---

## 🎯 Epic Goal

Transformar o lead de consumo passivo para consumo ativo da VSL na página `/fim`, através de uma animação de engajamento (ring + caixa de conversa do especialista) que aparece 3 segundos após o modal de intro desaparecer, incentivando o clique e a atenção ativa no vídeo.

---

## 📝 Epic Description

### Existing System Context

- **Situação atual:** O lead entra em `/fim` e vê um modal de intro animado (aura SVG), que desaparece após ~3.5s (1s enter + 1.5s hold + 1s exit). Após isso, o lead é deixado em estado passivo frente à VSL.
- **Stack:** Vite + React + React Router DOM + SCSS Modules + react-i18next
- **Arquitetura atual:** `Fim.jsx` controla o modal via state machine (`introState`: `enter` → `exit` → `hidden`). O vídeo é carregado via `vturb-smartplayer`. Abaixo do fold, `FimBelowFold.jsx` e `CommentsSection.jsx` são lazy-loaded.
- **Imagem do especialista:** Já existe em `img/expert.webp` (usada em `AudioUpsell.jsx`)
- **Traduções:** `src/i18n/locales/de/translation.json` e `pt/translation.json`

### Enhancement Details

**O que muda:**

1. **Auto-Scroll:** Quando o modal de intro desaparecer, ocorre um scroll automático para centralizar o player de vídeo na tela (implementado de forma simples, fácil de remover se necessário).
2. **Ring Effect (destaque):** Um efeito visual de "ring" animado surge ao redor do container da VSL 3 segundos após o modal de intro desaparecer, destacando o vídeo.
3. **Caixa de Conversa:** Junto ao ring, surge uma caixa de conversa (usando o visual do modal de `/resultado` como referência) posicionada **ACIMA do container da VSL**. A VSL continuará sendo completamente visível. A caixa conterá:
   - Imagem do especialista (`expert.webp`) associada a um balão de fala
   - Mini headline de texto (motivacional/CTA) dentro do balão
   - Botão com CTA para fechar (também localizado acima do vídeo)
4. **Interação:** Ao clicar no botão, o ring e a caixa de conversa desaparecem com efeito de fade-out.

**Critérios de sucesso:**
- Scroll automático centraliza o vídeo suavemente
- Ring contorna o player de vídeo (destaque) e aparece 3s pós-intro
- Caixa de conversa usa o padrão visual do modal de `/resultado`
- Clique no CTA faz fade-out do ring + caixa
- Nenhuma regressão no player de vídeo, checkout flow ou tracking
- Funcional em mobile e desktop
- `prefers-reduced-motion` respeitado

---

## 🗺 Affected Files Map

### Files to MODIFY

| File | What Changes | Why |
|------|-------------|-----|
| [Fim.jsx](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Fim.jsx) | Adicionar state para ring/chatBox (`showRing`), timer de 3s após `introState === 'hidden'`, handler para dismiss | Orquestra a lógica de timing e estado |
| [Fim.module.scss](file:///Users/brunogovas/Projects/Silver%20Bullet/Funil-Quiz/src/pages/Fim.module.scss) | Adicionar estilos para ring overlay, chat box, fade-in/fade-out keyframes | Animações visuais do ring e chat |
| `src/i18n/locales/de/translation.json` | Adicionar chaves para mini headline e CTA button text | i18n |
| `src/i18n/locales/pt/translation.json` | Adicionar chaves para mini headline e CTA button text | i18n |

### Files to CREATE

Nenhum arquivo novo será criado. O componente será implementado diretamente no `Fim.jsx` + `Fim.module.scss` para manter simplicidade e evitar overhead desnecessário.

---

## 📚 Stories

### Story 1: Ring Effect + Caixa de Conversa do Especialista

**Objetivo:** Implementar a animação de ring com caixa de conversa que aparece 3s após o modal de intro desaparecer, e desaparece com fade-out ao clicar no CTA.

**Predicted Agents:** @dev  
**Quality Gates:**
- Pre-Commit: Teste visual manual em desktop e mobile, verificação de `prefers-reduced-motion`
- Pre-PR: Gravação de navegação completa do fluxo `/fim`, validação de timing

**Tarefas:**
- [ ] Adicionar estado `showEngagement` (boolean) no `Fim.jsx`
- [ ] Criar `useEffect` que observa `introState === 'hidden'`:
  - Executa scroll automático simples (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) no container do vídeo logo após esconder a intro.
  - Inicia timer de 3s para `setShowEngagement(true)`.
- [ ] Implementar handler `dismissEngagement` para fade-out e desmonte do ring/caixa
- [ ] O render condicional (`showEngagement`) aplicará uma classe extra de "ring" ao redor do container do vídeo (ou um pseudo-elemento absolute/borda animada)
- [ ] Posicionar a caixa de conversa **acima do contêiner do vídeo**, usando o estilo de referência do Modal do `/resultado` (`expertDialog`, `expertAvatar`, `expertBubble`). O botão de CTA também deve ficar neste espaço acima do vídeo.
- [ ] Adicionar animações CSS: keyframes de pulse para o ring do vídeo e fade-in para a caixa de conversa
- [ ] Adicionar chaves de tradução no `i18n` para a mensagem do especialista e CTA do botão
- [ ] Garantir que o layout não quebra o aspecto 9:16 do vídeo e o clique funciona perfeitamente
- [ ] Implementar `prefers-reduced-motion`: transições instantâneas e sem pulse
- [ ] Limpar timers no cleanup do `useEffect`

**Definition of Done:**
- [ ] Vídeo é focado automaticamente
- [ ] Player do vídeo recebe efeito de anel/destaque
- [ ] Chat box padrão `/resultado` aparece perfeitamente
- [ ] CTA dispensa a animação
- [ ] Responsivo (mobile + desktop)
- [ ] `prefers-reduced-motion` respeitado

---

## 🛡 Risk Mitigation

- **Primary Risk:** Quebrar o aspecto visual da VSL ou a interatividade do smartplayer com o efeito de borda
- **Mitigation:** O ring será um pseudo-elemento ou wrapper extra (pointer-events-none para não bloquear toques) contornando o vídeo container, garantindo 0 interferência na execução do script do Vturb.
- **Secondary Risk:** Auto-scroll pode desorientar se disparar tardiamente
- **Mitigation:** Auto-scroll dispara imediatamente após o modal ocultar, associado de forma síncrona visual. E será implementado de forma que basta remover uma linha para desligar.
- **Rollback Plan:** Revert de um único commit.

### Quality Assurance Strategy

- **Pre-Commit:** Teste visual manual, verificação de timing com console.log
- **Pre-PR:** Gravação de tela demonstrando o fluxo completo
- **Automated:** Atualizar `FimDebug.test.jsx` para cobrir o novo estado `showEngagement`

---

## ✅ Definition of Done (Epic)

- [ ] Story 1 completada com critérios de aceite atendidos
- [ ] Ring + Chat Box funcional pós-modal em `/fim`
- [ ] Sem regressão em checkout, VSL, tracking
- [ ] Teste visual em mobile e desktop
- [ ] `prefers-reduced-motion` respeitado

---

## 📋 Story Manager Handoff

> "Please develop detailed user stories for this epic. Key considerations:
> - This is an enhancement to an existing page (`/fim`) running Vite + React + SCSS Modules + react-i18next
> - Integration points: `introState` state machine em `Fim.jsx`, `img/expert.webp`, translation JSON files
> - Existing patterns to follow: intro modal animation pattern (`introEnter`/`introExit`/`hidden`), SCSS module pattern
> - Critical compatibility requirements: No regression in VSL playback (vturb-smartplayer), checkout flow (Stripe/PayPal), UTM tracking
> - The story must include verification that existing functionality remains intact
> 
> The epic should deliver a compelling engagement mechanism without disrupting the existing page functionality."

---

*— Morgan, planejando o futuro 📊*
