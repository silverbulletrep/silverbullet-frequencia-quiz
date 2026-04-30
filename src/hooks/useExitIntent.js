import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const CHECKPOINT_KEY = 'ei_checkpoint';

const EXCLUDED_PATHS = new Set([
    '/chat-whatsapp',
    '/pt/chat-whatsapp',
    '/de/chat-whatsapp',
    '/main/chat-whatsapp',
    '/main/pt/chat-whatsapp',
    '/main/de/chat-whatsapp',
    '/alma-gemea'
]);

/**
 * Hook e Componente Global para gerenciar o Back-Redirect e Exit-Intent.
 * Versão Refatorada - Focada em performance e robustez (Mobile + PC).
 */
export function ExitIntentGlobal() {
    const location = useLocation();

    // --- Auxiliares de Navegação e Prefixo ---
    const getTargetUrl = useCallback((fromPath) => {
        const path = window.location.pathname;
        const prefix = path.startsWith('/main') ? '/main' : '';
        const langPrefix = (path.includes('/de/') || path === '/de') ? '/de' : (path.includes('/pt/') || path === '/pt') ? '/pt' : '';
        const checkpoint = fromPath || sessionStorage.getItem(CHECKPOINT_KEY) || '/quiz';

        return `${prefix}${langPrefix}/chat-whatsapp?from=${encodeURIComponent(checkpoint)}`;
    }, []);

    const executeRedirect = useCallback(() => {
        if (window._br_firing) return;

        let customFrom = null;

        // 1. Verificar se há um interceptador (ex: modal de retenção)
        if (typeof window.__br_interceptor === 'function') {
            const interceptorResult = window.__br_interceptor();

            // Se retornar true, bloqueia o redirecionamento (o modal assume o controle)
            if (interceptorResult === true) {
                try {
                    const safeState = window.history.state ? { ...window.history.state, _br_trap: true } : { _br_trap: true };
                    window.history.pushState(safeState, '', window.location.href);
                } catch (e) { }
                return;
            }

            // Se retornar uma string, usa como o parâmetro 'from'
            if (typeof interceptorResult === 'string') {
                customFrom = interceptorResult;
            }
        }

        // 2. Executar o redirecionamento final
        window._br_firing = true;
        const finalUrl = getTargetUrl(customFrom);
        window.location.replace(finalUrl);
    }, [getTargetUrl]);

    // --- 1. Lógica de Back-Trap (Mobile & Navegador) ---
    useEffect(() => {
        const cleanPath = location.pathname.replace(/^\/main/, '').replace(/^\/(pt|de)/, '') || '/';
        if (EXCLUDED_PATHS.has(cleanPath)) return;

        const currentPath = location.pathname;
        const savedCheckpoint = sessionStorage.getItem(CHECKPOINT_KEY);

        // Só atualizamos se:
        // 1. Não houver checkpoint salvo.
        // 2. O checkpoint atual não pertencer à página atual (não começa com o path atual).
        // Isso permite que páginas como /fim ou /audio-upsell definam sub-etapas 
        // (ex: /fim-pos-pitch) sem que o hook as sobrescreva com o path base.
        const isSubStep = savedCheckpoint && savedCheckpoint.startsWith(currentPath) && currentPath !== '/';

        if (!savedCheckpoint || !isSubStep) {
            sessionStorage.setItem(CHECKPOINT_KEY, currentPath);
        }

        // Inserir estado no histórico para capturar o "Voltar"
        const updateHistory = () => {
            try {
                if (!window.history.state || window.history.state._br_trap !== true) {
                    const safeState = window.history.state ? { ...window.history.state, _br_trap: true } : { _br_trap: true };
                    window.history.pushState(safeState, '', window.location.href);
                }
            } catch (e) {
                console.warn('[BackTrap] Falha ao injetar histórico:', e);
            }
        };

        // Pequeno delay para garantir que o navegador aceite a manipulação do histórico
        const timer = setTimeout(updateHistory, 100);
        let lastHref = window.location.href;

        const handlePopState = (e) => {
            const currentPath = window.location.pathname.replace(/^\/main/, '').replace(/^\/(pt|de)/, '') || '/';
            if (EXCLUDED_PATHS.has(currentPath)) return;

            if (window.location.href === lastHref) {
                return; // Prevent false popstate triggers on mobile scroll
            }
            lastHref = window.location.href;

            // Se o estado que estamos saindo não tem a nossa marca, significa que o usuário clicou em "Voltar"
            if (!e.state || e.state._br_trap !== true) {
                executeRedirect();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location.pathname, location.search, executeRedirect]);

    // --- 2. Lógica de Exit-Intent (PC - Mouse) ---
    useEffect(() => {
        const cleanPath = location.pathname.replace(/^\/main/, '').replace(/^\/(pt|de)/, '') || '/';
        if (EXCLUDED_PATHS.has(cleanPath)) return;

        const handleMouseLeave = (e) => {
            // Se o mouse sair pelo topo (clientY <= 0), indica tentativa de fechar ou mudar de aba
            if (e.clientY <= 0) {
                executeRedirect();
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [location.pathname, executeRedirect]);

    // Resetar flag de segurança ao mudar de rota internamente
    useEffect(() => {
        window._br_firing = false;
    }, [location.pathname]);

    return null;
}

/**
 * Hook utilitário caso necessário uso em componentes específicos
 */
export function useExitIntent() {
    // Implementação futura se necessário
}
