import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PremiumOptionCard } from '../components/PremiumOptionCard';
import { TransitionFadeWrapper } from '../components/TransitionFadeWrapper';
import VibrationalBody from '../components/VibrationalBody';
import styles from '@/styles/VibrationalExam.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { buildRouteStep, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, getDefaultBaseUrl, readStoredCountry, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';
import { usePrefetch } from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV;
const STEP = 6;
const DELAY = 1200;

const FB = {
    sim_perdi_ritmo: { sev: 'critical', zone: 'Sacral + Membros', msg: '✦ Vitalidade gravemente bloqueada. Análise final...' },
    muitas_vezes_limitado: { sev: 'high', zone: 'Sacral', msg: '✦ Disposição limitada. Centro vital comprometido.' },
    as_vezes_desanimo: { sev: 'medium', zone: 'Membros', msg: '✦ Desânimo energético captado nos membros.' },
    raramente_afeta_muito: { sev: 'low', zone: 'Vitalidade Ativa', msg: '✦ Disposição preservada. Finalizando análise.' },
};

const SEV_N = { sim_perdi_ritmo: 3, muitas_vezes_limitado: 3, as_vezes_desanimo: 2, raramente_afeta_muito: 1 };

const sc = (s) => ({ critical: { opt: styles.optionSelectedCritical, buf: styles.bufferCritical, z: styles.feedbackZoneCritical, d: styles.dotCritical, c: styles.countCritical, p: styles.progressCritical }, high: { opt: styles.optionSelectedHigh, buf: styles.bufferHigh, z: styles.feedbackZoneHigh, d: styles.dotHigh, c: styles.countHigh, p: styles.progressHigh }, medium: { opt: styles.optionSelectedMedium, buf: styles.bufferMedium, z: styles.feedbackZoneMedium, d: styles.dotMedium, c: styles.countMedium, p: styles.progressMedium }, low: { opt: styles.optionSelectedLow, buf: styles.bufferLow, z: styles.feedbackZoneLow, d: styles.dotLow, c: styles.countLow, p: styles.progressLow } }[s] || {});

export default function CompontTest6() {
    const { t } = useTranslation(); const nav = useNavigate(); const [sp] = useSearchParams();
    const prefetchPath = usePrefetch();
    const [sel, setSel] = useState(null);
    const [blk, setBlk] = useState(() => { try { const s = sessionStorage.getItem('ve_blockages'); return s ? JSON.parse(s) : []; } catch { return []; } });
    useExitIntent();
    useEffect(() => { const r = () => Promise.allSettled([import('./ProcessingPage2')]).catch(() => { }); try { if (typeof window.requestIdleCallback === 'function') { window.requestIdleCallback(r, { timeout: 1200 }); return; } } catch { } const t2 = setTimeout(r, 400); return () => clearTimeout(t2); }, []);
    useEffect(() => { const tr = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }); if (shouldSendEvent('step_view:/compont-test-6')) tr.stepView(buildRouteStep('/compont-test-6', QUIZ_PROGRESS_STEPS.quizStep6)).catch(() => { }); }, []);

    const q = {
        id: 'q6_corpo_humor_impede', title: t('quiz.step6.q6_corpo_humor_impede.title'), category: 'VITALIDADE & MANIFESTAÇÃO',
        options: [
            { key: 'sim_perdi_ritmo', text: t('quiz.step6.q6_corpo_humor_impede.options.sim_perdi_ritmo'), sev: 'critical' },
            { key: 'muitas_vezes_limitado', text: t('quiz.step6.q6_corpo_humor_impede.options.muitas_vezes_limitado'), sev: 'high' },
            { key: 'as_vezes_desanimo', text: t('quiz.step6.q6_corpo_humor_impede.options.as_vezes_desanimo'), sev: 'medium' },
            { key: 'raramente_afeta_muito', text: t('quiz.step6.q6_corpo_humor_impede.options.raramente_afeta_muito'), sev: 'low' },
        ]
    };

    const click = (k) => {
        if (sel) return; setSel(k);
        const ans = { [q.id]: k }; const o = q.options.find(x => x.key === k);
        
        const runAnalytics = () => {
             const sv = SEV_N[k] || 1;
             const nb = [...blk, { zone: 'sacral', severity: Math.min(sv, 3) }, { zone: 'limbs', severity: Math.min(sv, 2) }];
             setBlk(nb); try { sessionStorage.setItem('ve_blockages', JSON.stringify(nb)); } catch { }
             if (o) { createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }).desireSelectedWithStep({ id: '/compont-test-6', index: 12, name: 'exame vibracional 6' }, { desire: o.text, question: q.title, response: [o.text] }).catch(() => { }); }
             try { leadCache.setEtapa('CP03 - Quiz'); leadCache.mergeQuizAnswers(ans); leadCache.saveQAsForStep('quiz_step_6', [q], ans); logQuizProgress(); } catch { }
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(runAnalytics, { timeout: 800 });
        } else {
            setTimeout(runAnalytics, 0);
        }

        setTimeout(() => { const a = {}; sp.forEach((v, k2) => { a[k2] = v; }); Object.assign(a, ans); nav(`/processing?${new URLSearchParams(a).toString()}`); }, DELAY);
    };

    const fb = sel ? FB[sel] : null; const c = fb ? sc(fb.sev) : {};
    return (
        <TransitionFadeWrapper>
        <div className={styles.examPage}>
            <div className={styles.examSubHeader}>
                <span className={styles.examBadge}><span className={styles.examBadgeDot} />{t('compontTest.feature1')}</span>
                <span className={styles.examStep}>{STEP}/6</span>
            </div>
            
            <div className={styles.examContent}>
                <div className={styles.questionPanel}>
                    <h2 className={styles.questionTitle}>{q.title}</h2>
                    <div className={`${styles.optionsGrid} ${styles.optionsGridCascata}`}>
                        {q.options.map(o => {
                            const isSel = sel === o.key;
                            const dis = sel && !isSel;
                            const emojisMap = {
                                sim_perdi_ritmo: '🌀',
                                muitas_vezes_limitado: '😓',
                                as_vezes_desanimo: '🪫',
                                raramente_afeta_muito: '⚡'
                            };
                            return (
                                <PremiumOptionCard 
                                   key={o.key} 
                                   className={styles.premiumCardFix}
                                   emoji={emojisMap[o.key]}
                                   label={o.text} 
                                   isSelected={isSel} 
                                   disabled={dis} 
                                   onClick={() => click(o.key)} 
                                   onPointerDown={() => prefetchPath('/processing')}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className={styles.bodyContainerDesktop}>
                    <div style={{ position: 'relative', width: '300px', height: '500px' }}>
                        <VibrationalBody blockages={blk} scanning={false} />
                        {/* {sel && <div className={styles.laserLine} />} */}
                    </div>
                    <span className={styles.bodyScanLabel}>{t('compontTest.feature2')}</span>
                </div>
            </div>

            {/* {fb && (
                <div className={styles.feedbackBuffer}>
                    <div className={`${styles.feedbackBufferInner} ${c.buf}`}>
                        <div className={styles.feedbackBodyMini}>
                            <VibrationalBody blockages={blk} scanning compact />
                        </div>
                        <div className={styles.feedbackTexts}>
                            <span className={`${styles.feedbackZone} ${c.z}`}>
                                <span className={`${styles.feedbackZoneDot} ${c.d}`} />
                                {fb.zone}
                            </span>
                            <p className={styles.feedbackMessage}>{fb.msg}</p>
                        </div>
                        <span className={`${styles.feedbackCount} ${c.c}`}>{blk.length}</span>
                    </div>
                </div>
            )} */}
        </div>
        </TransitionFadeWrapper>);
}
