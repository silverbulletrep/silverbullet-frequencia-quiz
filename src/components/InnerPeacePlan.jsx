import React from 'react';
import { useTranslation } from 'react-i18next';
import { asset } from '@/lib/asset'

// Reutiliza diretamente o módulo de estilos extraído do Figma
import styles from '../../.figma/16_1527/index.module.scss';

const InnerPeacePlan = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.httpsSignupSpiriohub}>
      <div className={styles.container37}>
        <div className={styles.container36}>
          <div className={styles.container}>
            <p className={styles.aSpecialDiscount503}>
              <span className={styles.aSpecialDiscount50}>{t('inner_peace_plan.discount_prefix')}&nbsp;</span>
              <span className={styles.aSpecialDiscount502}>-50%</span>
            </p>
            <p className={styles.heading2YourPersonal3}>
              <span className={styles.heading2YourPersonal}>{t('inner_peace_plan.title_part1')}&nbsp;</span>
              <span className={styles.heading2YourPersonal2}>{t('inner_peace_plan.title_part2')}</span>
            </p>
            <p className={styles.calmYourMindRediscov}>{t('inner_peace_plan.subtitle')}</p>
          </div>

          {/* Cartões comparativos */}
          <div className={styles.container24}>
            {/* Cartão da esquerda - Now */}
            <div className={styles.container12}>
              <div className={styles.container3}>
                <div className={styles.container2}>
                  <p className={styles.now}>{t('inner_peace_plan.now')}</p>
                </div>
                <img src={asset('/.figma/image/mg8cb0gc-p4pnxom.svg')} className={styles.component1} alt="" />
              </div>
              <div className={styles.horizontalBorder}>
                <img src={asset('/.figma/image/mg8cb0h8-zlckb2j.png')} className={styles.sadWoman} alt={t('inner_peace_plan.now')} />
              </div>
              <div className={styles.container11}>
                <div className={styles.container5}>
                  <p className={styles.tensionLevel}>{t('inner_peace_plan.tension_level')}</p>
                  <div className={styles.container4}>
                    <p className={styles.high}>{t('inner_peace_plan.high')}</p>
                    <img src={asset('/.figma/image/mg8cb0gd-swrf3bd.png')} className={styles.component2} alt={t('inner_peace_plan.alt_arrow_down')} />
                  </div>
                </div>
                <div className={styles.horizontalDivider} />
                <div className={styles.container8}>
                  <div className={styles.container6}>
                    <p className={styles.tensionLevel}>{t('inner_peace_plan.overthinking')}</p>
                    <p className={styles.high2}>{t('inner_peace_plan.high')}</p>
                  </div>
                  <div className={styles.container7}>
                    <div className={styles.background} />
                    <div className={styles.background} />
                    <div className={styles.background} />
                  </div>
                </div>
                <div className={styles.horizontalDivider} />
                <div className={styles.container10}>
                  <div className={styles.container6}>
                    <p className={styles.tensionLevel}>{t('inner_peace_plan.energy_level')}</p>
                    <p className={styles.high2}>{t('inner_peace_plan.weak')}</p>
                  </div>
                  <div className={styles.container9}>
                    <div className={styles.background3}>
                      <div className={styles.background2} />
                    </div>
                    <div className={styles.background5}>
                      <div className={styles.background4} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divisor central */}
            <div className={styles.container13}>
              <div className={styles.verticalDivider} />
              <div className={styles.background6}>
                <img src={asset('/.figma/image/mg8cb0gd-rx08yny.svg')} className={styles.component12} alt={t('inner_peace_plan.alt_arrow')} />
              </div>
            </div>

            {/* Cartão da direita - Your goal */}
            <div className={styles.container23}>
              <div className={styles.container15}>
                <div className={styles.container14}>
                  <p className={styles.now}>{t('inner_peace_plan.your_goal')}</p>
                </div>
                <img src={asset('/.figma/image/mg8cb0gd-kefkdd2.svg')} className={styles.component1} alt="" />
              </div>
              <div className={styles.horizontalBorder}>
                <img src={asset('/.figma/image/mg8cb0h8-yxpyjc0.png')} className={styles.sadWoman} alt={t('inner_peace_plan.your_goal')} />
              </div>
              <div className={styles.container22}>
                <div className={styles.container17}>
                  <p className={styles.tensionLevel}>{t('inner_peace_plan.tension_level')}</p>
                  <div className={styles.container16}>
                    <p className={styles.low}>{t('inner_peace_plan.low')}</p>
                    <img src={asset('/.figma/image/mg8cb0gd-ec8cmat.png')} className={styles.component3} alt={t('inner_peace_plan.alt_arrow_up')} />
                  </div>
                </div>
                <div className={styles.horizontalDivider} />
                <div className={styles.container19}>
                  <div className={styles.container6}>
                    <p className={styles.tensionLevel}>Overthinking</p>
                    <p className={styles.high2}>Low</p>
                  </div>
                  <div className={styles.container18}>
                    <div className={styles.background7} />
                    <div className={styles.background8} />
                    <div className={styles.background8} />
                  </div>
                </div>
                <div className={styles.horizontalDivider} />
                <div className={styles.container21}>
                  <div className={styles.container6}>
                    <p className={styles.tensionLevel}>Energy level</p>
                    <p className={styles.high2}>Strong</p>
                  </div>
                  <div className={styles.container20}>
                    <div className={styles.background10}>
                      <div className={styles.background9} />
                    </div>
                    <div className={styles.background11}>
                      <div className={styles.background4} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de benefícios */}
          <div className={styles.container35}>
            <p className={styles.heading2WhatYouGet}>{t('inner_peace_plan.what_you_get')}</p>
            <div className={styles.container34}>
              <div className={styles.container25}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-dugt1me.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_1')}</p>
              </div>
              <div className={styles.container26}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-7izurdr.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_2')}</p>
              </div>
              <div className={styles.container27}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-ouzwxu6.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_3')}</p>
              </div>
              <div className={styles.container28}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-r0s75e1.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_4')}</p>
              </div>
              <div className={styles.container29}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-uxw74mu.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_5')}</p>
              </div>
              <div className={styles.container30}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-zbrl34z.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_6')}</p>
              </div>
              <div className={styles.container31}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-nmhg6dp.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_7')}</p>
              </div>
              <div className={styles.container32}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-1aadgjb.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_8')}</p>
              </div>
              <div className={styles.container33}>
                <div className={styles.background12}>
                  <img src={asset('/.figma/image/mg8cb0gd-vt2ank8.svg')} className={styles.component13} alt="icon" />
                </div>
                <p className={styles.yourMindFeelsCalmGro}>{t('inner_peace_plan.benefit_9')}</p>
              </div>
            </div>
          </div>

          <p className={styles.heading2WhatYouGet}>{t('inner_peace_plan.people_love_spirio')}</p>
          <div className={styles.backgroundHorizontal}>
            <p className={styles.a0957}>09:57</p>
            <div className={styles.component4}>
              <p className={styles.text}>{t('inner_peace_plan.get_my_plan')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InnerPeacePlan;
