import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './BackgroundBorder.module.scss'

export default function BackgroundBorder() {
  const { t } = useTranslation()
  const lowSrc = new URL('../../../img/baixa_vibracao.webp', import.meta.url).href
  const highSrc = new URL('../../../img/alta_vibracao.webp', import.meta.url).href
  const fallbackSrc = new URL('../../../img/resultado.webp', import.meta.url).href
  const [lowOk, setLowOk] = React.useState(true)
  const [highOk, setHighOk] = React.useState(true)
  return (
    <div className={styles.bbCard} aria-label={t('background_border.aria_label')}>
      <div className={styles.bbCol}>
        <div className={styles.bbHeader}>
          <div className={styles.bbPill}><p className={styles.bbNow}>{t('background_border.now')}</p></div>
          <div className={styles.bbIcon} />
        </div>
        <div className={styles.bbPhoto}>
          <img src={lowOk ? lowSrc : fallbackSrc} alt={t('background_border.low_alt')} className={styles.bbPhotoImg} loading="lazy" decoding="async" onError={() => setLowOk(false)} />
        </div>

        <div className={styles.bbSection}>
          <div>
            <p className={styles.bbLabel}>{t('background_border.vibration_label')}</p>
            <div className={styles.bbRow}>
              <span className={styles.bbStatusRed}>{t('background_border.low')}</span>
            </div>
          </div>

          <div>
            <div className={styles.bbRow}>
              <p className={styles.bbLabel}>{t('background_border.dream_life')}</p>
            </div>
            <p className={styles.bbSubText}>{t('background_border.dream_life_far')}</p>
            <div className={styles.bbBars}>
              <div className={styles.bbBarRed} />
              <div className={styles.bbBarGray} />
              <div className={styles.bbBarGray} />
            </div>
          </div>

          <div>
            <div className={styles.bbRow}>
              <p className={styles.bbLabel}>{t('background_border.attraction')}</p>
            </div>
            <p className={styles.bbSubText}>{t('background_border.attraction_blocked')}</p>
            <div className={styles.bbSliderWrap}>
              <div className={styles.bbSliderTrack} />
              <div className={styles.bbSliderValueLeft} />
              <div className={styles.bbSliderKnobLeft} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bbDivider}>
        <div className={styles.bbVerticalDivider} />
      </div>

      <div className={styles.bbCol}>
        <div className={styles.bbHeader}>
          <div className={styles.bbPillGreen}><p className={styles.bbNow}>{t('background_border.goal')}</p></div>
          <div className={styles.bbIcon} />
        </div>
        <div className={styles.bbPhoto}>
          <img src={highOk ? highSrc : fallbackSrc} alt={t('background_border.high_alt')} className={styles.bbPhotoImg} loading="lazy" decoding="async" onError={() => setHighOk(false)} />
        </div>

        <div className={styles.bbSection}>
          <div>
            <p className={styles.bbLabel}>{t('background_border.vibration_label')}</p>
            <div className={styles.bbRow}>
              <span className={styles.bbStatusGreen}>{t('background_border.high')}</span>
            </div>
          </div>

          <div>
            <div className={styles.bbRow}>
              <p className={styles.bbLabel}>{t('background_border.dream_life')}</p>
            </div>
            <p className={styles.bbSubText}>{t('background_border.dream_life_meaning')}</p>
            <div className={styles.bbBars}>
              <div className={styles.bbBarGreen} />
              <div className={styles.bbBarGreen} />
              <div className={styles.bbBarGreen} />
            </div>
          </div>

          <div>
            <div className={styles.bbRow}>
              <p className={styles.bbLabel}>{t('background_border.attraction')}</p>
            </div>
            <p className={styles.bbSubText}>{t('background_border.attraction_flow')}</p>
            <div className={styles.bbSliderWrap}>
              <div className={styles.bbSliderTrack} />
              <div className={styles.bbSliderValueRight} />
              <div className={styles.bbSliderKnobRight} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
