# Story 007: Responsividade da ProcessingPage (Fix Bug 3)

## Status: Ready for Review

## Contexto (User Story)

**Como** um lead acessando o funil pelo celular,  
**Eu quero** ver toda a tela de carregamento dentro do viewport sem precisar rolar,  
**Para que** eu tenha uma experiência fluida e imersiva durante a análise.

## Acceptance Criteria

- [ ] Todo o conteúdo da `ProcessingPage` deve ser visível dentro do viewport em **iPhone SE (375x667)**, **iPhone 14 (390x844)**, e **Galaxy S20 (360x800)**
- [ ] Todo o conteúdo da `ProcessingPage` deve ser visível dentro do viewport em **Desktop 1440x900** e **1920x1080**
- [ ] O `QuantumLoader`, botão "Ver diagnóstico completo", e barras de energia devem ser visíveis **sem scroll** em todos os viewports acima
- [ ] Se o conteúdo exceder o viewport (edge case), deve existir scroll suave e acessível (não cortado por `overflow: hidden`)
- [ ] O `continueSection` (botão final) nunca deve ficar cortado ou escondido abaixo do viewport
- [ ] A "Validação Humana" e o "Rodapé Sutil" podem ficar ocultos em viewports < 667px se necessário (prioridade mais baixa)
- [ ] A experiência visual deve ser idêntica entre iOS Safari e Chrome Android
- [ ] O `padding-top: 84px` do `AuthorityHeader` deve ser considerado no cálculo do espaço disponível

## Tasks / Subtasks

- [x] **SCSS ProcessingPage:** Adicionar `min-height: 0` ao `.mainContent` para corrigir o default `min-height: auto` do flexbox.
- [x] **SCSS ProcessingPage:** Adicionar `-webkit-overflow-scrolling: touch` ao `.mainContent` para scroll suave no iOS, caso haja overflow emergencial.
- [x] **QuantumLoader (Mobile):** Reduzir paddings (`py-10` → `py-4`, `mb-8` → `mb-4`).
- [x] **QuantumLoader (Mobile Limit):** Adicionar media query `@media (max-height: 700px)` para diminuir o tamanho do ring de loader principal (ex: `w-36 h-36` ao invés de `w-48 h-48`).
- [x] **ProcessingPage.jsx:** Reduzir gaps verticais em telas com viewport muito baixo, para acomodar os steps sem clipping.
- [x] Verificar integridade funcional da navegação ao término do processing (continua indo para a /resultado corretamente).

## File List

### Source Files
- `src/pages/ProcessingPage.module.scss`
- `src/pages/ProcessingPage.jsx`
- `src/components/scanning/QuantumLoader.jsx`

## Dev Agent Record

### Debug Log
- Utilizado viewport arbitrary query `[@media(max-height:700px)]` diretamente nas tags JSX com Tailwind para adaptar redimensionamentos dinâmicos ao invés de criar media queries complexas globais que não lidariam bem com minifiers configurados customizadamente.

### Completion Notes
*(Listar aqui decisões de design emergentes ou adaptações feitas)*
- *(vazio)*

## Change Log
*(Resumo técnico para o PR/Commit após implementação)*
- *(vazio)*
