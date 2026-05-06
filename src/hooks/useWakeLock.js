// Provides a React hook for requesting and releasing the browser Screen Wake Lock.
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para manter a tela do dispositivo ligada.
 * @param {boolean} active - Se o lock deve estar ativo.
 * @returns {object} - Funções request e release para controle manual se necessário.
 */
export const useWakeLock = (active = true) => {
  const wakeLockRef = useRef(null);
  const isDev = import.meta.env.DEV;

  const requestWakeLock = useCallback(async () => {
    // Só funciona em contextos seguros (HTTPS) ou localhost
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        if (isDev) console.log('[WakeLock] Tela travada acesa ✨');
        
        wakeLockRef.current.addEventListener('release', () => {
          if (isDev) console.log('[WakeLock] Lock liberado');
          wakeLockRef.current = null;
        });
      } catch (err) {
        if (isDev) console.warn(`[WakeLock] Erro ao solicitar: ${err.name}, ${err.message}`);
      }
    }
  }, [isDev]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        if (isDev) console.error('[WakeLock] Erro ao liberar:', err);
      }
    }
  }, [isDev]);

  useEffect(() => {
    if (active) {
      // Pequeno delay para garantir que a página carregou e o browser processe a interação anterior
      const timer = setTimeout(() => {
        requestWakeLock();
      }, 1000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && active) {
          requestWakeLock();
        } else {
          releaseWakeLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseWakeLock();
      };
    }
  }, [active, requestWakeLock, releaseWakeLock]);

  return { requestWakeLock, releaseWakeLock };
};
