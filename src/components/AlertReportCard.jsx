import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './AlertReportCard.module.scss'
import { leadCache } from '@/lib/leadCache'

/**
 * Red Alert Report Card — dynamic data from leadCache
 * Scroll-reveal animation using IntersectionObserver
 */
export default function AlertReportCard({ signs }) {
    const { t } = useTranslation()
    const containerRef = React.useRef(null)
    const [visibleItems, setVisibleItems] = React.useState(new Set())

    // Get dynamic pain label from leadCache
    const leadData = React.useMemo(() => leadCache.getAll(), [])
    const painLabel = React.useMemo(() => {
        const key = Array.isArray(leadData?.problema_principal)
            ? leadData?.problema_principal[0]
            : leadData?.problema_principal
        const normalized = (key || '').toLowerCase().trim()
        const map = {
            financeiro: 'recupera.alert.painLabels.financeiro',
            amor: 'recupera.alert.painLabels.amor',
            relacionamento: 'recupera.alert.painLabels.relacionamento',
            saude: 'recupera.alert.painLabels.saude',
            espiritualidade: 'recupera.alert.painLabels.espiritualidade',
        }
        return t(map[normalized] || 'recupera.alert.painLabels.default')
    }, [leadData, t])

    // IntersectionObserver for scroll-reveal
    React.useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const items = container.querySelectorAll('[data-reveal]')
        if (!items.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = entry.target.getAttribute('data-reveal')
                        setVisibleItems((prev) => new Set([...prev, idx]))
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.3, rootMargin: '0px 0px -40px 0px' }
        )

        items.forEach((item) => observer.observe(item))
        return () => observer.disconnect()
    }, [])

    return (
        <div className={styles.card} ref={containerRef}>
            <div
                className={`${styles.cardItem} ${visibleItems.has('0') ? styles.visible : ''}`}
                data-reveal="0"
            >
                <span className={styles.frequencyLabel}>{t('recupera.alert.cardFrequencyLabel')}</span>
                <span className={styles.frequencyValue}>{t('recupera.alert.cardFrequencyValue')}</span>
            </div>

            <div
                className={`${styles.cardItem} ${visibleItems.has('1') ? styles.visible : ''}`}
                data-reveal="1"
            >
                <span className={styles.consequenceLabel}>{t('recupera.alert.cardConsequenceLabel')}</span>
                <span className={styles.consequenceValue}>{painLabel}</span>
            </div>

            <div
                className={`${styles.cardItem} ${visibleItems.has('2') ? styles.visible : ''}`}
                data-reveal="2"
            >
                <p className={styles.signsTitle}>{t('recupera.alert.cardSignsTitle')}</p>
                <ul className={styles.signsList}>
                    {signs.map((sign, i) => (
                        <li key={i} className={styles.signItem}>
                            <span className={styles.signIcon}>⚠️</span>
                            <span>{sign}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div
                className={`${styles.cardItem} ${visibleItems.has('3') ? styles.visible : ''}`}
                data-reveal="3"
            >
                <p className={styles.conclusion}>
                    <strong>{t('recupera.alert.cardConclusionStrong')}</strong> {t('recupera.alert.cardConclusionText')}
                </p>
            </div>
        </div>
    )
}
