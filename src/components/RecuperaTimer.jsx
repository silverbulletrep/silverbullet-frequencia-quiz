import React from 'react'
import styles from './RecuperaTimer.module.scss'

/**
 * Visual timer display for Recupera page.
 * Receives display string from useRecuperaTimer hook.
 *
 * @param {{ display: string, className?: string }} props
 */
export default function RecuperaTimer({ display, className }) {
    const [mm, ss] = display.split(':')
    return (
        <div className={`${styles.timer} ${className || ''}`}>
            <span className={styles.unit}>{mm}</span>
            <span className={styles.sep}>:</span>
            <span className={styles.unit}>{ss}</span>
        </div>
    )
}
