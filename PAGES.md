# Páginas e Rotas do Projeto

## Rotas Ativas (src/App.tsx)

- `/` → `Home` (`src/pages/Home.tsx`)
- `/quiz` → `InitialQuestions` (`src/pages/InitialQuestions.jsx`)
- `/age-selection-women` → `AgeSelectionWomen` (`src/pages/AgeSelectionWomen.jsx`)
- `/age-selection-men` → `AgeSelectionMen` (`src/pages/AgeSelectionMen.jsx`)
- `/women-success` → `WomenSuccess` (`src/pages/WomenSuccess.jsx`)
- `/men-success` → `MenSuccess` (`src/pages/MenSuccess.jsx`)
- `/morning-feeling` → `MorningFeeling` (`src/pages/MorningFeeling.jsx`)
- `/transition` → `TransitionPage` (`src/pages/TransitionPage.jsx`)
- `/vsl` → `VSL` (`src/pages/VSL.jsx`)
- `/vsl2` → `VSL2` (`src/pages/VSL2.jsx`)
- `/quiz-step-1` → `QuizStep1` (`src/pages/QuizStep1.jsx`)
- `/quiz-step-2` → `QuizStep2` (`src/pages/QuizStep2.jsx`)
- `/quiz-step-3` → `QuizStep3` (`src/pages/QuizStep3.jsx`)
- `/quiz-step-4` → `QuizStep4` (`src/pages/QuizStep4.jsx`)
- `/quiz-step-5` → `QuizStep5` (`src/pages/QuizStep5.jsx`)
- `/quiz-step-6` → `QuizStep6` (`src/pages/QuizStep6.jsx`)
- `/quiz-step-9` → `QuizStep9` (`src/pages/QuizStep9.jsx`)
- `/quiz-step-10` → `QuizStep10` (`src/pages/QuizStep10.jsx`)
- `/processing` → `ProcessingPage` (`src/pages/ProcessingPage.jsx`)
- `/resultado` → `Resultado` (`src/pages/Resultado.jsx`)
- `/resultado-pressel` → `PresselResultado` (`src/pages/PresselResultado.jsx`)
- `/checkout` → `Checkout` (`src/pages/Checkout.jsx`)
- `/checkout-success` → `CheckoutSuccess` (`src/pages/CheckoutSuccess.jsx`)
- `/checkout-cancel` → `CheckoutCancel` (`src/pages/CheckoutCancel.jsx`)
- `/other` → elemento inline (não há página dedicada)

## Arquivos em `src/pages` sem rota mapeada em App.tsx

- `PreTeste.jsx`
- `Quiz.jsx`
- `Transition.jsx`

## Observações

- Todos os estilos específicos de página estão em arquivos `*.module.scss` correspondentes em `src/pages`.
- A configuração de rotas está centralizada em `src/App.tsx` e pode ser usada como referência única para navegação.
