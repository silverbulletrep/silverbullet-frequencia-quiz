import { useEffect } from 'react';

/**
 * Mapa de rotas do quiz → próxima rota.
 * Ao montar no passo atual, pré-carrega o chunk JS da próxima rota
 * usando requestIdleCallback (ou setTimeout como fallback),
 * garantindo transição instantânea sem loading visível.
 */
const NEXT_ROUTE_MAP = {
  '/quiz': ['/age-selection-women', '/age-selection-men'],
  '/age-selection-women': ['/women-success'],
  '/age-selection-men': ['/men-success'],
  '/women-success': ['/morning-feeling'],
  '/men-success': ['/morning-feeling'],
  '/morning-feeling': ['/quiz-step-1'],
  '/quiz-step-1': ['/quiz-step-2'],
  '/quiz-step-2': ['/quiz-step-3'],
  '/quiz-step-3': ['/quiz-step-4'],
  '/quiz-step-4': ['/quiz-step-5'],
  '/quiz-step-5': ['/quiz-step-6'],
  '/quiz-step-6': ['/processing'],
  '/quiz-step-9': ['/quiz-step-10'],
  '/quiz-step-10': ['/processing'],
  '/processing': ['/resultado'],
  '/resultado': ['/transition'],
  '/transition': ['/vsl'],
};

const IMPORT_MAP = {
  '/age-selection-women': () => import('../pages/AgeSelectionWomen'),
  '/age-selection-men': () => import('../pages/AgeSelectionMen'),
  '/women-success': () => import('../pages/WomenSuccess'),
  '/men-success': () => import('../pages/MenSuccess'),
  '/morning-feeling': () => import('../pages/MorningFeeling'),
  '/quiz-step-1': () => import('../pages/QuizStep1'),
  '/quiz-step-2': () => import('../pages/QuizStep2'),
  '/quiz-step-3': () => import('../pages/QuizStep3'),
  '/quiz-step-4': () => import('../pages/QuizStep4'),
  '/quiz-step-5': () => import('../pages/QuizStep5'),
  '/quiz-step-6': () => import('../pages/QuizStep6'),
  '/quiz-step-9': () => import('../pages/QuizStep9'),
  '/quiz-step-10': () => import('../pages/QuizStep10'),
  '/processing': () => import('../pages/ProcessingPage'),
  '/resultado': () => import('../pages/Resultado'),
  '/transition': () => import('../pages/TransitionPage'),
  '/vsl': () => import('../pages/VSL'),
};

/**
 * Hook que pré-carrega os chunks JS das próximas rotas do quiz
 * assim que o componente atual é montado.
 * 
 * @param currentRoute - A rota atual (ex: '/quiz-step-1')
 */
export function useQuizPrefetch(currentRoute) {
  useEffect(() => {
    const nextRoutes = NEXT_ROUTE_MAP[currentRoute];
    if (!nextRoutes || nextRoutes.length === 0) return;

    const prefetch = () => {
      for (const route of nextRoutes) {
        const importFn = IMPORT_MAP[route];
        if (typeof importFn === 'function') {
          importFn().catch(() => {});
        }
      }
    };

    // Usa requestIdleCallback para não bloquear a renderização
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    } else {
      const t = setTimeout(prefetch, 300);
      return () => clearTimeout(t);
    }
  }, [currentRoute]);
}

export default useQuizPrefetch;
