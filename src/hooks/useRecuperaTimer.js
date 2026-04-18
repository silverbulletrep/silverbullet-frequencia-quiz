import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for the Recupera 15-minute countdown timer with localStorage persistence.
 *
 * @param {Object} options
 * @param {number} [options.initialMinutes=15] - Starting minutes for the timer
 * @param {string} [options.storageKey='recupera_timer_end'] - localStorage key for persisted end time
 * @param {() => void} [options.onExpired] - Callback invoked when timer reaches 00:00
 * @returns {{ minutes: number, seconds: number, display: string, isExpired: boolean }}
 */
export function useRecuperaTimer({
    initialMinutes = 15,
    storageKey = 'recupera_timer_end',
    onExpired,
} = {}) {
    const onExpiredRef = useRef(onExpired)
    onExpiredRef.current = onExpired
    const expiredFiredRef = useRef(false)

    const getRemaining = useCallback(() => {
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const endTime = Number(stored)
                if (!Number.isFinite(endTime)) return 0
                return Math.max(0, endTime - Date.now())
            }
            // First visit: set endTime
            const endTime = Date.now() + initialMinutes * 60_000
            localStorage.setItem(storageKey, String(endTime))
            return initialMinutes * 60_000
        } catch {
            return initialMinutes * 60_000
        }
    }, [initialMinutes, storageKey])

    const [remainingMs, setRemainingMs] = useState(getRemaining)

    useEffect(() => {
        if (remainingMs <= 0) {
            if (!expiredFiredRef.current) {
                expiredFiredRef.current = true
                onExpiredRef.current?.()
            }
            return
        }

        const interval = setInterval(() => {
            const next = getRemaining()
            setRemainingMs(next)
            if (next <= 0) {
                clearInterval(interval)
                if (!expiredFiredRef.current) {
                    expiredFiredRef.current = true
                    onExpiredRef.current?.()
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [getRemaining, remainingMs])

    const totalSeconds = Math.ceil(remainingMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    return {
        minutes,
        seconds,
        display,
        isExpired: remainingMs <= 0,
    }
}
