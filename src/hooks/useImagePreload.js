import { useEffect } from 'react';
import { asset } from '@/lib/asset';

export function useImagePreload(imagePaths) {
    useEffect(() => {
        if (!imagePaths || imagePaths.length === 0) return;

        const preload = () => {
            imagePaths.forEach(path => {
                const img = new Image();
                // Assume that the path might already have the base URL or we use asset()
                // If it starts with http, we don't need asset()
                img.src = path.startsWith('http') ? path : asset(path);
            });
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const id = window.requestIdleCallback(preload, { timeout: 2000 });
            return () => {
                if (typeof window.cancelIdleCallback === 'function') {
                    window.cancelIdleCallback(id);
                }
            };
        }

        const timeoutId = window.setTimeout(preload, 500);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [imagePaths]);
}

export default useImagePreload;
