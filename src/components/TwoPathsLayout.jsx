import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './TwoPathsLayout.module.scss'
import { leadCache } from '@/lib/leadCache'

const SLIDERS = [
    {
        labelKey: 'recupera.finalCta.sliders.vibration.label',
        path1: { value: 20, textKey: 'recupera.finalCta.sliders.vibration.path1' },
        path2: { value: 90, textKey: 'recupera.finalCta.sliders.vibration.path2' },
    },
    {
        labelKey: 'recupera.finalCta.sliders.success.label',
        path1: { value: 15, textKey: 'recupera.finalCta.sliders.success.path1' },
        path2: { value: 85, textKey: 'recupera.finalCta.sliders.success.path2' },
    },
    {
        labelKey: null,
        path1: { value: 10, textKey: 'recupera.finalCta.sliders.attraction.path1' },
        path2: { value: 95, textKey: 'recupera.finalCta.sliders.attraction.path2' },
    },
    {
        labelKey: 'recupera.finalCta.sliders.potential.label',
        path1: { value: 90, textKey: 'recupera.finalCta.sliders.potential.path1' },
        path2: { value: 90, textKey: 'recupera.finalCta.sliders.potential.path2' },
    },
]

/**
 * Two-column comparison layout with visual (non-interactive) sliders.
 * Props: path1Image, path2Image (imported image assets)
 */
export default function TwoPathsLayout({ path1Image, path2Image }) {
    const { t } = useTranslation()
    const desireLabel = React.useMemo(() => {
        const data = leadCache.getAll()
        return data?.selected_option_description || t('recupera.finalCta.desireFallback')
    }, [t])

    return (
        <div className={styles.container}>
            {/* ── Column Headers ── */}
            <div className={styles.grid}>
                <div className={styles.column}>
                    <h3 className={styles.pathLabel}>{t('recupera.finalCta.path1Label')}</h3>
                    <div className={styles.imageWrapper}>
                        <img src={path1Image} alt={t('recupera.finalCta.path1ImageAlt')} className={styles.pathImage} />
                    </div>
                    <div className={styles.sliders}>
                        {SLIDERS.map((slider, i) => {
                            const label = slider.labelKey ? t(slider.labelKey) : desireLabel
                            return (
                                <div key={i} className={styles.sliderGroup}>
                                    <div className={styles.sliderHeader}>
                                        <span className={styles.sliderLabel}>{label}</span>
                                        <span className={styles.sliderText}>{t(slider.path1.textKey)}</span>
                                    </div>
                                    <div className={styles.sliderTrack}>
                                        <div
                                            className={`${styles.sliderFill} ${styles.fillNeg}`}
                                            style={{ width: `${slider.path1.value}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className={styles.column}>
                    <h3 className={`${styles.pathLabel} ${styles.pathLabelPos}`}>{t('recupera.finalCta.path2Label')}</h3>
                    <div className={styles.imageWrapper}>
                        <img src={path2Image} alt={t('recupera.finalCta.path2ImageAlt')} className={styles.pathImage} />
                    </div>
                    <div className={styles.sliders}>
                        {SLIDERS.map((slider, i) => {
                            const label = slider.labelKey ? t(slider.labelKey) : desireLabel
                            return (
                                <div key={i} className={styles.sliderGroup}>
                                    <div className={styles.sliderHeader}>
                                        <span className={styles.sliderLabel}>{label}</span>
                                        <span className={`${styles.sliderText} ${styles.sliderTextPos}`}>{t(slider.path2.textKey)}</span>
                                    </div>
                                    <div className={styles.sliderTrack}>
                                        <div
                                            className={`${styles.sliderFill} ${styles.fillPos}`}
                                            style={{ width: `${slider.path2.value}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
