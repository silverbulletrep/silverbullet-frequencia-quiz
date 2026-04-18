import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import RecuperaTimer from './RecuperaTimer'
import styles from './RecuperaStickyHeader.module.scss'

/**
 * Sticky header that appears when the hero timer scrolls out of view.
 * Contains a mirrored timer + CTA that scrolls to the offer section.
 *
 * @param {{ heroTimerRef: React.RefObject, timerDisplay: string }} props
 */
export default function RecuperaStickyHeader({ heroTimerRef, timerDisplay, onVisibilityChange }) {
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)
    const observerRef = useRef(null)

    useEffect(() => {
        const el = heroTimerRef?.current
        if (!el) return

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                // Show only when element is not intersecting AND has been scrolled past (top < 0)
                const isVisible = !entry.isIntersecting && entry.boundingClientRect.top < 0
                setVisible(isVisible)
                onVisibilityChange?.(isVisible)
            },
            { threshold: 0 }
        )

        observerRef.current.observe(el)

        return () => {
            observerRef.current?.disconnect()
        }
    }, [heroTimerRef, onVisibilityChange])

    const scrollToOffer = () => {
        const target = document.getElementById('plan-receipt-anchor')
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <header
            className={`${styles.stickyHeader} ${visible ? styles.visible : ''}`}
            aria-hidden={!visible}
        >
            <div className={styles.inner}>
                <RecuperaTimer display={timerDisplay} className={styles.timer} />
                <button
                    type="button"
                    className={styles.cta}
                    onClick={scrollToOffer}
                    tabIndex={visible ? 0 : -1}
                >{t('recupera.offer.cta')}</button>
            </div>
        </header>
    )
}
