import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './FigmaGuaranteeContainer.module.scss'
import { asset } from '@/lib/asset'

export default function FigmaGuaranteeContainer() {
  const { t } = useTranslation()
  return (
    <section className={styles.containerSection} aria-label={t('guarantee.section_label')}>
      <div className={styles.container5}>
        <div className={styles.background}>
          <img
            src={asset('/.figma/image/miuyt844-4lc83fx.png')}
            className={styles.shieldIcon}
            alt=""
            aria-hidden="true"
          />
          <p className={styles.a30DayMoneyBackGuara}>{t('guarantee.money_back_title')}</p>
          <p className={styles.weBelieveThatOurPlan}>
            {t('guarantee.money_back_text')}
          </p>
          <p className={styles.findMoreAboutApplica3}>
            <span>{t('guarantee.policy_prefix')}&nbsp;</span>
            <a
              className={styles.findMoreAboutApplica2}
              href={asset('/money-back-policy')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('guarantee.policy_link')}
            </a>
          </p>
        </div>

        <div className={styles.background2}>
          <div className={styles.container2}>
            <div className={styles.container}>
              <img
                src={asset('/.figma/image/miuyt840-w332kmo.svg')}
                className={styles.component1}
                alt=""
                aria-hidden="true"
              />
              <p className={styles.yourInformationIsSaf}>{t('guarantee.info_safe_title')}</p>
            </div>
            <p className={styles.weWonTSellOrRentYour}>{t('guarantee.info_safe_text')}</p>
          </div>

          <div className={styles.container4}>
            <div className={styles.container3}>
              <img
                src={asset('/.figma/image/miuyt840-505aobw.svg')}
                className={styles.component12}
                alt=""
                aria-hidden="true"
              />
              <p className={styles.yourInformationIsSaf}>{t('guarantee.checkout_safe_title')}</p>
            </div>
            <p className={styles.weWonTSellOrRentYour}>
              {t('guarantee.checkout_safe_text')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
