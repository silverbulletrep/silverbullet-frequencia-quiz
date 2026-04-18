import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { asset } from '@/lib/asset'

// Usa diretamente o módulo de estilos extraído do Figma
import styles from '../../.figma/16_3264/index.module.scss';

const PlanExtended = ({ selectedPlan, onSelect = () => {}, onCheckout = () => {} }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.httpsSignupSpiriohub}>
      <div className={styles.container60}>
        <div className={styles.container59}>
          <p className={styles.heading2WhatYouGet}>{t('plan_extended.what_you_get')}</p>
          <div className={styles.container25}>
            <p className={styles.yourPersonalizedPlan}>{t('plan_extended.plan_ready')}</p>
            <div className={styles.container4}>
              <div className={styles.container2}>
                <div className={styles.overlay}>
                  <img src={asset('/.figma/image/mg8dgte6-otmdu3k.svg')} className={styles.component1} alt={t('plan_extended.alt_icon')} />
                </div>
                <div className={styles.container}>
                  <p className={styles.type}>{t('plan_extended.type')}</p>
                  <p className={styles.generalized}>{t('plan_extended.generalized')}</p>
                </div>
              </div>
              <div className={styles.verticalDivider} />
              <div className={styles.container3}>
                <div className={styles.overlay2}>
                  <img src={asset('/.figma/image/mg8dgte6-xoq5xez.svg')} className={styles.component12} alt={t('plan_extended.alt_icon')} />
                </div>
                <div className={styles.container}>
                  <p className={styles.type}>{t('plan_extended.goal')}</p>
                  <p className={styles.generalized}>{t('plan_extended.increase_energy')}</p>
                </div>
              </div>
            </div>
            <div className={styles.container24}>
              <div
                className={`${styles.backgroundBorder} ${selectedPlan === '3-month' ? styles.selectedCard : ''} ${styles.clickableCard}`}
                onClick={() => onSelect('3-month')}
                role="button"
                tabIndex={0}
                aria-pressed={selectedPlan === '3-month'}
              >
                <div className={styles.container6}>
                  <div className={styles.border} />
                  <div className={styles.container5}>
                    <p className={styles.a3Monthplan}>{t('plan_extended.plan_3_month')}</p>
                    <p className={styles.a111}>$1.11</p>
                  </div>
                </div>
                <div className={styles.container9}>
                  <img src={asset('/.figma/image/mg8dgte6-4mjwe1m.svg')} className={styles.component13} alt={t('plan_extended.alt_price_icon')} />
                  <div className={styles.background}>
                    <p className={styles.a}>$</p>
                    <div className={styles.container8}>
                      <p className={styles.a0}>0</p>
                      <div className={styles.container7}>
                        <p className={styles.a55}>55</p>
                        <p className={styles.perDay}>{t('plan_extended.per_day')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.container10}>
                  <p className={styles.a50}>-50%</p>
                </div>
              </div>
              <div className={styles.container16}>
                <div className={styles.background2}>
                  <p className={styles.mOstpopular}>{t('plan_extended.most_popular')}</p>
                  <div className={styles.container11}>
                    <p className={styles.a50}>-50%</p>
                  </div>
                </div>
                <div
                  className={`${styles.backgroundBorder2} ${selectedPlan === '1-month' ? styles.selectedCard : ''} ${styles.clickableCard}`}
                  onClick={() => onSelect('1-month')}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedPlan === '1-month'}
                >
                  <div className={styles.container12}>
                    <div className={styles.border2}>
                      <div className={styles.background3} />
                    </div>
                    <div className={styles.container5}>
                      <p className={styles.a3Monthplan}>{t('plan_extended.plan_1_month')}</p>
                      <p className={styles.a111}>$1.99</p>
                    </div>
                  </div>
                  <div className={styles.container15}>
                    <img src={asset('/.figma/image/mg8dgte6-4mjwe1m.svg')} className={styles.component13} alt={t('plan_extended.alt_price_icon')} />
                    <div className={styles.background4}>
                      <p className={styles.a2}>$</p>
                      <div className={styles.container14}>
                        <p className={styles.a02}>0</p>
                        <div className={styles.container13}>
                          <p className={styles.a99}>99</p>
                          <p className={styles.perDay2}>{t('plan_extended.per_day')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`${styles.backgroundBorder3} ${selectedPlan === '6-month' ? styles.selectedCard : ''} ${styles.clickableCard}`}
                onClick={() => onSelect('6-month')}
                role="button"
                tabIndex={0}
                aria-pressed={selectedPlan === '6-month'}
              >
                <div className={styles.container6}>
                  <div className={styles.border} />
                  <div className={styles.container5}>
                    <p className={styles.a3Monthplan}>6-MONTH PLAN</p>
                    <p className={styles.a111}>$0.88</p>
                  </div>
                </div>
                <div className={styles.container9}>
                  <img src={asset('/.figma/image/mg8dgte6-4mjwe1m.svg')} className={styles.component13} alt="price icon" />
                  <div className={styles.background}>
                    <p className={styles.a}>$</p>
                    <div className={styles.container8}>
                      <p className={styles.a0}>0</p>
                      <div className={styles.container7}>
                        <p className={styles.a55}>44</p>
                        <p className={styles.perDay}>per day</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.container10}>
                  <p className={styles.a50}>-50%</p>
                </div>
              </div>
              <div className={styles.container23}>
                <div className={styles.background5}>
                  <div className={styles.container17}>
                    <img src={asset('/.figma/image/mg8dgte6-fsrejlp.svg')} className={styles.component14} alt="chart" />
                  </div>
                  <div className={styles.container19}>
                    <div className={styles.container18}>
                      <p className={styles.peopleUsingThePlanFo3}>
                        <span className={styles.peopleUsingThePlanFo}>People using the plan for&nbsp;</span>
                        <span className={styles.peopleUsingThePlanFo2}>3 months</span>
                        <span className={styles.peopleUsingThePlanFo}>&nbsp;achieve twice as much as those using it<br />for 1 month.</span>
                      </p>
                    </div>
                    <p className={styles.aAccordingToTheResea}>*According to the research by Spirio Team</p>
                  </div>
                </div>
                <div className={styles.buttonMargin}>
                  <div
                    className={`${styles.component4} ${!selectedPlan ? styles.disabledButton : ''}`}
                    onClick={selectedPlan ? onCheckout : undefined}
                    role="button"
                    tabIndex={0}
                    aria-disabled={!selectedPlan}
                  >
                    <p className={styles.text}>GET MY PLAN</p>
                  </div>
                </div>
                <div className={styles.container21}>
                  <div className={styles.background6}>
                    <img src={asset('/.figma/image/mg8dgte6-rw0q4b9.svg')} className={styles.component15} alt="secure" />
                    <p className={styles.paySafeSecure}>Pay safe & secure</p>
                  </div>
                  <div className={styles.container20}>
                    <img src={asset('/.figma/image/mg8dgte6-yusa1mj.svg')} className={styles.component16} alt="visa" />
                    <img src={asset('/.figma/image/mg8dgte6-enaqb03.svg')} className={styles.component16} alt="mastercard" />
                    <img src={asset('/.figma/image/mg8dgte6-ghuhidw.svg')} className={styles.component16} alt="amex" />
                    <img src={asset('/.figma/image/mg8dgte6-0q4iy9i.svg')} className={styles.component16} alt="paypal" />
                    <img src={asset('/.figma/image/mg8dgte6-a2prpat.svg')} className={styles.component16} alt="discover" />
                    <img src={asset('/.figma/image/mg8dgte6-gxh46cq.svg')} className={styles.component16} alt="stripe" />
                    <img src={asset('/.figma/image/mg8dgte6-vb4hmjx.svg')} className={styles.component17} alt="lock" />
                  </div>
                </div>
                <div className={styles.container22}>
                  <p className={styles.byClickingGetmyplani4}>
                    <span className={styles.byClickingGetmyplani}>By clicking GET MY PLAN, I agree to pay&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>$29.99</span>
                    <span className={styles.byClickingGetmyplani}>&nbsp;for my plan and that if I do not cancel<br />before the end of the 1 month introductory plan, it will convert to a&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>1 month</span>
                    <span className={styles.byClickingGetmyplani}>&nbsp;subscription<br />and Spirio will automatically charge my payment method the regular price&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>$59.99<br /></span>
                    <span className={styles.byClickingGetmyplani}>every&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>1 month</span>
                    <span className={styles.byClickingGetmyplani}>&nbsp;thereafter until I cancel. I can cancel online by contacting customer<br />support team via email at&nbsp;</span>
                    <span className={styles.byClickingGetmyplani3}>support@spiriohub.com</span>
                    <span className={styles.byClickingGetmyplani}>.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Seções adicionais */}
          <div className={styles.container32}>
            <div className={styles.heading2}>
              <p className={styles.peopleJustLikeYouAch3}>
                <span className={styles.peopleJustLikeYouAch}>{t('plan_extended.people_like_you_part1')}&nbsp;</span>
                <span className={styles.peopleJustLikeYouAch2}>{t('plan_extended.people_like_you_part2')}</span>
              </p>
            </div>
            <div className={styles.backgroundBorder4}>
              <div className={styles.container26}>
                <img src={asset('/.figma/image/mg8dgtfb-3sh375t.png')} className={styles.meditationWoman} alt="meditation" />
              </div>
              <div className={styles.container31}>
                <div className={styles.container27}>
                  <div className={styles.paragraph}>
                    <p className={styles.a82}>82</p>
                    <p className={styles.a3}>%</p>
                  </div>
                  <p className={styles.ofUsersFeltCalmFreeF3}>
                    <span className={styles.ofUsersFeltCalmFreeF}>{t('plan_extended.stat_calm_part1')}&nbsp;</span>
                    <span className={styles.ofUsersFeltCalmFreeF2}>{t('plan_extended.stat_calm_part2')}</span>
                    <span className={styles.ofUsersFeltCalmFreeF}>&nbsp;{t('plan_extended.stat_calm_part3')}</span>
                  </p>
                </div>
                <div className={styles.horizontalDivider} />
                <div className={styles.container28}>
                  <div className={styles.paragraph2}>
                    <p className={styles.a78}>78</p>
                    <p className={styles.a4}>%</p>
                  </div>
                  <p className={styles.ofUsersFeltCalmFreeF3}>
                    <span className={styles.ofUsersFeltCalmFreeF}>{t('plan_extended.stat_energy_part1')}&nbsp;</span>
                    <span className={styles.ofUsersFeltCalmFreeF2}>{t('plan_extended.stat_energy_part2')}</span>
                  </p>
                </div>
                <div className={styles.horizontalDivider} />
                <div className={styles.container30}>
                  <div className={styles.paragraph3}>
                    <p className={styles.a45}>45</p>
                    <p className={styles.a5}>%</p>
                  </div>
                  <div className={styles.container29}>
                    <p className={styles.ofUsersStartedWithSi}>
                      <span className={styles.ofUsersFeltCalmFreeF}>{t('plan_extended.stat_similar_part1')}&nbsp;</span>
                      <span className={styles.ofUsersFeltCalmFreeF2}>{t('plan_extended.stat_similar_part2')}<br /></span>
                      <span className={styles.ofUsersFeltCalmFreeF}>{t('plan_extended.stat_similar_part3')}</span>
                    </p>
                  </div>
                </div>
              </div>
              <img src={asset('/.figma/image/mg8dgtfb-aecgjig.png')} className={styles.sakuraBackground} alt="sakura" />
            </div>
          </div>
          <div className={styles.container34}>
            <div className={styles.container33}>
              <p className={styles.aBetterVersionOfYouE}>{t('plan_extended.better_version')}</p>
              <p className={styles.yourTailoredInnerPea}>{t('plan_extended.tailored_blueprint')}</p>
            </div>
            <img src={asset('/.figma/image/mg8dgtfb-dgjt98a.png')} className={styles.spirioCalendar} alt="calendar" />
          </div>
          <div className={styles.container49}>
            <p className={styles.heading2PeopleLoveSp}>{t('plan_extended.people_love_spirio')}</p>
            <div className={styles.container48}>
              <div className={styles.backgroundBorderShad}>
                <div className={styles.container39}>
                  <img src={asset('/.figma/image/mg8dgtfb-5vmr7c6.png')} className={styles.feedbackPerson3827B8} alt="avatar" />
                  <div className={styles.container38}>
                    <p className={styles.nataliS}>{t('plan_extended.testimonial_1_name')}</p>
                    <div className={styles.container37}>
                      <div className={styles.container36}>
                        <div className={styles.container35}>
                          <img src={asset('/.figma/image/mg8dgte6-4v3h0ht.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-sr370c5.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-tq4yj7h.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-6zz33ba.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-il64ai1.svg')} className={styles.component1} alt="star" />
                        </div>
                        <p className={styles.a502}>5.0</p>
                      </div>
                      <p className={styles.a1DayAgo}>{t('plan_extended.testimonial_1_time')}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.container40}>
                  <p className={styles.iUseTheseDailyAndLov}>{t('plan_extended.testimonial_1_text')}</p>
                </div>
              </div>
              <div className={styles.backgroundBorderShad2}>
                <div className={styles.container43}>
                  <div className={styles.background7}>
                    <p className={styles.mH}>MH</p>
                  </div>
                  <div className={styles.container42}>
                    <p className={styles.mikeH}>{t('plan_extended.testimonial_2_name')}</p>
                    <div className={styles.container41}>
                      <div className={styles.container36}>
                        <div className={styles.container35}>
                          <img src={asset('/.figma/image/mg8dgte6-g47d488.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-xpfx7kt.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-9csn8ea.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-y153tex.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte6-734jiz1.svg')} className={styles.component1} alt="star" />
                        </div>
                        <p className={styles.a502}>4.8</p>
                      </div>
                      <p className={styles.a1DayAgo}>{t('plan_extended.testimonial_2_time')}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.container44}>
                  <p className={styles.a3YearsAgoMyGirlfrie}>{t('plan_extended.testimonial_2_text')}</p>
                </div>
              </div>
              <div className={styles.backgroundBorderShad3}>
                <div className={styles.container46}>
                  <img src={asset('/.figma/image/mg8dgtfb-5g9gjin.png')} className={styles.feedbackPerson3827B8} alt="avatar" />
                  <div className={styles.container45}>
                    <p className={styles.taylorD}>{t('plan_extended.testimonial_3_name')}</p>
                    <div className={styles.container41}>
                      <div className={styles.container36}>
                        <div className={styles.container35}>
                          <img src={asset('/.figma/image/mg8dgte6-8bt6j5a.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte7-dgdz6v3.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte7-c7aay0x.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte7-3p7rh2h.svg')} className={styles.component1} alt="star" />
                          <img src={asset('/.figma/image/mg8dgte7-pn1nn4j.svg')} className={styles.component1} alt="star" />
                        </div>
                        <p className={styles.a502}>5.0</p>
                      </div>
                      <p className={styles.a1DayAgo}>{t('plan_extended.testimonial_3_time')}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.container47}>
                  <p className={styles.wowThisIsSoWhatIVeBe}>{t('plan_extended.testimonial_3_text')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.container53}>
            <p className={styles.yourPersonalizedPlan}>{t('plan_extended.faq.title')}</p>
            <div className={styles.container52}>
              <div className={styles.button}>
                <div className={styles.container50}>
                  <img src={asset('/.figma/image/mg8dgte7-51iw6ob.svg')} className={styles.component18} alt="q" />
                  <p className={styles.whatIfIVeUsedOtherTh}>{t('plan_extended.faq.q1')}</p>
                </div>
                <div className={styles.container51}>
                  <div className={styles.autoWrapper}>
                    <img src={asset('/.figma/image/mg8dgte7-bq3ajnr.png')} className={styles.component5} alt="arrow" />
                  </div>
                </div>
              </div>
              <div className={styles.button}>
                <div className={styles.container50}>
                  <img src={asset('/.figma/image/mg8dgte7-6js5lf6.svg')} className={styles.component18} alt="q" />
                  <p className={styles.whatIfIVeUsedOtherTh}>{t('plan_extended.faq.q2')}</p>
                </div>
                <div className={styles.container51}>
                  <div className={styles.autoWrapper}>
                    <img src={asset('/.figma/image/mg8dgte7-bq3ajnr.png')} className={styles.component5} alt="arrow" />
                  </div>
                </div>
              </div>
              <div className={styles.button}>
                <div className={styles.container50}>
                  <img src={asset('/.figma/image/mg8dgte7-7wd6pk2.svg')} className={styles.component18} alt="q" />
                  <p className={styles.whatIfIVeUsedOtherTh}>{t('plan_extended.faq.q3')}</p>
                </div>
                <div className={styles.container51}>
                  <div className={styles.autoWrapper}>
                    <img src={asset('/.figma/image/mg8dgte7-bq3ajnr.png')} className={styles.component5} alt="arrow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.container25}>
            <p className={styles.yourPersonalizedPlan}>Your personalized plan is ready!</p>
            <div className={styles.container4}>
              <div className={styles.container2}>
                <div className={styles.overlay}>
                  <img src={asset('/.figma/image/mg8dgte7-dinf5x7.svg')} className={styles.component1} alt="icon" />
                </div>
                <div className={styles.container}>
                  <p className={styles.type}>Type</p>
                  <p className={styles.generalized}>Generalized</p>
                </div>
              </div>
              <div className={styles.verticalDivider} />
              <div className={styles.container3}>
                <div className={styles.overlay2}>
                  <img src={asset('/.figma/image/mg8dgte7-qoazk9c.svg')} className={styles.component12} alt="icon" />
                </div>
                <div className={styles.container}>
                  <p className={styles.type}>Goal</p>
                  <p className={styles.generalized}>Increase energy</p>
                </div>
              </div>
            </div>
            <div className={styles.container24}>
              <div
                className={`${styles.backgroundBorder} ${selectedPlan === '3-month' ? styles.selectedCard : ''} ${styles.clickableCard}`}
                onClick={() => onSelect('3-month')}
                role="button"
                tabIndex={0}
                aria-pressed={selectedPlan === '3-month'}
              >
                <div className={styles.container6}>
                  <div className={styles.border} />
                  <div className={styles.container5}>
                    <p className={styles.a3Monthplan}>3-MONTH PLAN</p>
                    <p className={styles.a111}>$1.11</p>
                  </div>
                </div>
                <div className={styles.container9}>
                  <img src={asset('/.figma/image/mg8dgte7-cnbdwr0.svg')} className={styles.component13} alt="price" />
                  <div className={styles.background}>
                    <p className={styles.a}>$</p>
                    <div className={styles.container8}>
                      <p className={styles.a0}>0</p>
                      <div className={styles.container7}>
                        <p className={styles.a55}>55</p>
                        <p className={styles.perDay}>per day</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.container10}>
                  <p className={styles.a50}>-50%</p>
                </div>
              </div>
              <div className={styles.container16}>
                <div className={styles.background2}>
                  <p className={styles.mOstpopular}>MOST POPULAR</p>
                  <div className={styles.container11}>
                    <p className={styles.a50}>-50%</p>
                  </div>
                </div>
                <div
                  className={`${styles.backgroundBorder2} ${selectedPlan === '1-month' ? styles.selectedCard : ''} ${styles.clickableCard}`}
                  onClick={() => onSelect('1-month')}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedPlan === '1-month'}
                >
                  <div className={styles.container12}>
                    <div className={styles.border2}>
                      <div className={styles.background3} />
                    </div>
                    <div className={styles.container5}>
                      <p className={styles.a3Monthplan}>1-MONTH PLAN</p>
                      <p className={styles.a111}>$1.99</p>
                    </div>
                  </div>
                  <div className={styles.container15}>
                    <img src={asset('/.figma/image/mg8dgte7-cnbdwr0.svg')} className={styles.component13} alt="price" />
                    <div className={styles.background4}>
                      <p className={styles.a2}>$</p>
                      <div className={styles.container14}>
                        <p className={styles.a02}>0</p>
                        <div className={styles.container13}>
                          <p className={styles.a99}>99</p>
                          <p className={styles.perDay2}>per day</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`${styles.backgroundBorder3} ${selectedPlan === '6-month' ? styles.selectedCard : ''} ${styles.clickableCard}`}
                onClick={() => onSelect('6-month')}
                role="button"
                tabIndex={0}
                aria-pressed={selectedPlan === '6-month'}
              >
                <div className={styles.container6}>
                  <div className={styles.border} />
                  <div className={styles.container5}>
                    <p className={styles.a3Monthplan}>6-MONTH PLAN</p>
                    <p className={styles.a111}>$0.88</p>
                  </div>
                </div>
                <div className={styles.container9}>
                  <img src={asset('/.figma/image/mg8dgte7-cnbdwr0.svg')} className={styles.component13} alt="price" />
                  <div className={styles.background}>
                    <p className={styles.a}>$</p>
                    <div className={styles.container8}>
                      <p className={styles.a0}>0</p>
                      <div className={styles.container7}>
                        <p className={styles.a55}>44</p>
                        <p className={styles.perDay}>per day</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.container10}>
                  <p className={styles.a50}>-50%</p>
                </div>
              </div>
              <div className={styles.container23}>
                <div className={styles.background5}>
                  <div className={styles.container17}>
                    <img src={asset('/.figma/image/mg8dgte7-9l85kb7.svg')} className={styles.component14} alt="chart" />
                  </div>
                  <div className={styles.container19}>
                    <div className={styles.container18}>
                      <p className={styles.peopleUsingThePlanFo3}>
                        <span className={styles.peopleUsingThePlanFo}>People using the plan for&nbsp;</span>
                        <span className={styles.peopleUsingThePlanFo2}>3 months</span>
                        <span className={styles.peopleUsingThePlanFo}>&nbsp;achieve twice as much as those using it<br />for 1 month.</span>
                      </p>
                    </div>
                    <p className={styles.aAccordingToTheResea}>*According to the research by Spirio Team</p>
                  </div>
                </div>
                <div className={styles.buttonMargin}>
                  <div
                    className={`${styles.component4} ${!selectedPlan ? styles.disabledButton : ''}`}
                    onClick={selectedPlan ? onCheckout : undefined}
                    role="button"
                    tabIndex={0}
                    aria-disabled={!selectedPlan}
                  >
                    <p className={styles.text}>GET MY PLAN</p>
                  </div>
                </div>
                <div className={styles.container21}>
                  <div className={styles.background6}>
                    <img src={asset('/.figma/image/mg8dgte7-2uc60zo.svg')} className={styles.component15} alt="secure" />
                    <p className={styles.paySafeSecure}>Pay safe & secure</p>
                  </div>
                  <div className={styles.container20}>
                    <img src={asset('/.figma/image/mg8dgte7-b1775ta.svg')} className={styles.component16} alt="card" />
                    <img src={asset('/.figma/image/mg8dgte7-4khpb0l.svg')} className={styles.component16} alt="card" />
                    <img src={asset('/.figma/image/mg8dgte7-fntexme.svg')} className={styles.component16} alt="card" />
                    <img src={asset('/.figma/image/mg8dgte7-hjbn75f.svg')} className={styles.component16} alt="card" />
                    <img src={asset('/.figma/image/mg8dgte7-g0xs3lt.svg')} className={styles.component16} alt="card" />
                    <img src={asset('/.figma/image/mg8dgte7-z7nthye.svg')} className={styles.component16} alt="card" />
                    <img src={asset('/.figma/image/mg8dgte7-bxljmkl.svg')} className={styles.component17} alt="lock" />
                  </div>
                </div>
                <div className={styles.container22}>
                  <p className={styles.byClickingGetmyplani4}>
                    <span className={styles.byClickingGetmyplani}>By clicking GET MY PLAN, I agree to pay&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>$29.99</span>
                    <span className={styles.byClickingGetmyplani}>&nbsp;for my plan and that if I do not cancel<br />before the end of the 1 month introductory plan, it will convert to a&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>1 month</span>
                    <span className={styles.byClickingGetmyplani}>&nbsp;subscription<br />and Spirio will automatically charge my payment method the regular price&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>$59.99<br /></span>
                    <span className={styles.byClickingGetmyplani}>every&nbsp;</span>
                    <span className={styles.byClickingGetmyplani2}>1 month</span>
                    <span className={styles.byClickingGetmyplani}>&nbsp;thereafter until I cancel. I can cancel online by contacting customer<br />support team via email at&nbsp;</span>
                    <span className={styles.byClickingGetmyplani3}>support@spiriohub.com</span>
                    <span className={styles.byClickingGetmyplani}>.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.container58}>
            <div className={styles.background8}>
              <img src={asset('/.figma/image/mg8dgtfd-zcuemk8.png')} className={styles.shieldIcon} alt="shield" />
              <p className={styles.yourPersonalizedPlan}>30-day money-back guarantee</p>
              <p className={styles.weBelieveThatOurPlan}>We believe that our plan will work for you and you will get noticeable<br />results in just 4 weeks! We are even ready to return your money back if<br />this plan is not for you!</p>
              <p className={styles.findMoreAboutApplica2}>
                <span className={styles.ofUsersFeltCalmFreeF}>Find more about applicable limitations in our&nbsp;</span>
                <span className={styles.findMoreAboutApplica}>money-back policy.</span>
              </p>
            </div>
            <div className={styles.background9}>
              <div className={styles.container55}>
                <div className={styles.container54}>
                  <img src={asset('/.figma/image/mg8dgte7-bxz7efi.svg')} className={styles.component1} alt="safe" />
                  <p className={styles.yourInformationIsSaf}>Your information is safe</p>
                </div>
                <p className={styles.weWonTSellOrRentYour}>We won't sell or rent your personal contact information for any marketing<br />purposes whatsoever.</p>
              </div>
              <div className={styles.container57}>
                <div className={styles.container56}>
                  <img src={asset('/.figma/image/mg8dgte7-rrll1zx.svg')} className={styles.component15} alt="checkout" />
                  <p className={styles.yourInformationIsSaf}>Secure checkout</p>
                </div>
                <p className={styles.weWonTSellOrRentYour}>All information is encrypted and transmitted without risk using a Secure Socket<br />Layer protocol.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanExtended;
