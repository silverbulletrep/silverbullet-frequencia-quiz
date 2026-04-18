import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';
import imgArrowNow from '../image/miuvhxr4-r1kkdlk.svg';
import imgSadWoman from '../image/miuvhxrj-ojw2vrw.png';
import imgLowArrow from '../image/miuvhxr4-y44m897.png';
import imgCenterArrow from '../image/miuvhxr4-7qoeki4.svg';
import imgArrowGoal from '../image/miuvhxr4-1giq65y.svg';
import imgHappyWoman from '../image/miuvhxrj-jo59tzd.png';
import imgHighArrow from '../image/miuvhxr4-kmwl838.png';

const Component = () => {
  const { t } = useTranslation();

  React.useEffect(() => {
    console.log('[ComparisonComponent] Component mounted');
    return () => console.log('[ComparisonComponent] Component unmounted');
  }, []);

  return (
    <div className={styles.container23}>
      <div className={styles.container11}>
        <div className={styles.container2}>
          <div className={styles.container}>
            <p className={styles.now}>{t('now')}</p>
          </div>
          <img src={imgArrowNow} className={styles.component1} />
        </div>
        <div className={styles.horizontalBorder}>
          <img src={imgSadWoman} className={styles.sadWoman} />
        </div>
        <div className={styles.container10}>
          <div className={styles.container4}>
            <p className={styles.vibrations}>{t('vibrations')}</p>
            <div className={styles.container3}>
              <div className={styles.autoWrapper}>
                <img
                  src={imgLowArrow}
                  className={styles.component2}
                />
              </div>
              <p className={styles.low}>{t('low')}</p>
            </div>
          </div>
          <div className={styles.horizontalDivider} />
          <div className={styles.container7}>
            <div className={styles.container5}>
              <p className={styles.vibrations}>{t('dream_life')}</p>
              <p className={styles.farFromIt}>{t('far_from_it')}</p>
            </div>
            <div className={styles.container6}>
              <div className={styles.background} />
              <div className={styles.overlay} />
              <div className={styles.overlay} />
            </div>
          </div>
          <div className={styles.horizontalDivider} />
          <div className={styles.container9}>
            <div className={styles.container5}>
              <p className={styles.vibrations}>{t('attraction')}</p>
              <p className={styles.farFromIt}>{t('blocked_fem')}</p>
            </div>
            <div className={styles.container8}>
              <div className={styles.overlay2}>
                <div className={styles.background2} />
              </div>
              <div className={styles.background4}>
                <div className={styles.background3} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Container 12 (Divider) removed as per request for strict 2-column layout with gap */}

      <div className={styles.container22}>
        <div className={styles.container14}>
          <div className={styles.container13}>
            <p className={styles.now}>{t('your_goal')}</p>
          </div>
          <img src={imgArrowGoal} className={styles.component1} />
        </div>
        <div className={styles.horizontalBorder2}>
          <img src={imgHappyWoman} className={styles.happyWoman} />
        </div>
        <div className={styles.container21}>
          <div className={styles.container16}>
            <p className={styles.vibrations}>{t('vibrations')}</p>
            <div className={styles.container15}>
              <div className={styles.autoWrapper2}>
                <img
                  src={imgHighArrow}
                  className={styles.component3}
                />
              </div>
              <p className={styles.high}>{t('high')}</p>
            </div>
          </div>
          <div className={styles.horizontalDivider} />
          <div className={styles.container18}>
            <div className={styles.container5}>
              <p className={styles.vibrations}>{t('dream_life')}</p>
              <p className={styles.farFromIt}>{t('living_with_purpose')}</p>
            </div>
            <div className={styles.container17}>
              <div className={styles.background6} />
              <div className={styles.background6} />
              <div className={styles.background6} />
            </div>
          </div>
          <div className={styles.horizontalDivider} />
          <div className={styles.container20}>
            <div className={styles.container5}>
              <p className={styles.vibrations}>{t('attraction')}</p>
              <p className={styles.farFromIt}>{t('flowing')}</p>
            </div>
            <div className={styles.container19}>
              <div className={styles.overlay3}>
                <div className={styles.background7} />
              </div>
              <div className={styles.background8}>
                <div className={styles.background3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
