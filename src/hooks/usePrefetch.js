import { useCallback } from 'react';

const prefetchMap = {
    '/': () => import('../pages/Home'),
    '/quiz': () => Promise.resolve(),
    '/age-selection-women': () => import('../pages/AgeSelectionWomen'),
    '/age-selection-men': () => import('../pages/AgeSelectionMen'),
    '/women-success': () => import('../pages/WomenSuccess'),
    '/men-success': () => import('../pages/MenSuccess'),
    '/morning-feeling': () => import('../pages/MorningFeeling'),
    '/transition': () => import('../pages/TransitionPage'),
    '/vsl': () => import('../pages/VSL'),
    '/vsl2': () => import('../pages/VSL2'),
    '/audio-upsell': () => import('../pages/AudioUpsell'),

    // Quiz Steps (Test Series e steps originais)
    '/quiz-step-1': () => import('../pages/QuizStep1'),
    '/quiz-step-2': () => import('../pages/QuizStep2'),
    '/quiz-step-3': () => import('../pages/QuizStep3'),
    '/quiz-step-4': () => import('../pages/QuizStep4'),
    '/quiz-step-5': () => import('../pages/QuizStep5'),
    '/quiz-step-6': () => import('../pages/QuizStep6'),
    '/compont-test-1': () => import('../pages/CompontTest1'),
    '/compont-test-2': () => import('../pages/CompontTest2'),
    '/compont-test-3': () => import('../pages/CompontTest3'),
    '/compont-test-4': () => import('../pages/CompontTest4'),
    '/compont-test-5': () => import('../pages/CompontTest5'),
    '/compont-test-6': () => import('../pages/CompontTest6'),

    '/quiz-step-9': () => import('../pages/QuizStep9'),
    '/quiz-step-10': () => import('../pages/QuizStep10'),
    '/processing': () => import('../pages/ProcessingPage'),
    '/processing2': () => import('../pages/ProcessingPage2'),
    '/resultado': () => import('../pages/Resultado'),
    '/resultado2': () => import('../pages/ResultadoPage2'),
    '/resultado-pressel': () => import('../pages/PresselResultado'),

    '/start': () => import('../pages/Start'),
    '/fim': () => import('../pages/Fim'),
    '/fim-funil': () => import('../pages/FimFunil'),
    '/recupera': () => import('../pages/Recupera'),
};

/**
 * Hook to prefetch the JS chunk of a given route path before navigation.
 * Should be attached to onMouseDown/onPointerDown on desktop/mobile.
 */
export function usePrefetch() {
    const prefetchPath = useCallback((pathInput) => {
        try {
            if (!pathInput) return;

            // Normalização inteligente: Remove o domínio se existir e extrai o pathname
            const url = new URL(pathInput, 'http://localhost');
            let pathname = url.pathname;

            // Suporte a prefixos de idioma (ex: /pt/vsl -> /vsl)
            const languagePrefixes = ['/pt', '/de', '/en'];
            for (const prefix of languagePrefixes) {
                if (pathname.startsWith(prefix)) {
                    // Garante que não quebre rotas que apenas começam com as letras (ex: /pt_test)
                    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
                        pathname = pathname.slice(prefix.length);
                        if (!pathname.startsWith('/')) pathname = `/${pathname}`;
                        break;
                    }
                }
            }

            // Remove barra final para match no mapa (exceto na root)
            if (pathname !== '/' && pathname.endsWith('/')) {
                pathname = pathname.slice(0, -1);
            }

            const prefetchFn = prefetchMap[pathname];
            if (typeof prefetchFn === 'function') {
                prefetchFn().catch((err) => {
                    if (import.meta.env.DEV) {
                        console.warn(`[Prefetch] Failed to preload chunk for ${pathname}`, err);
                    }
                });
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn(`[Prefetch] Invalid path: ${pathInput}`, error);
            }
        }
    }, []);

    return prefetchPath;
}

export default usePrefetch;
