import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VibrationalBody from '../components/VibrationalBody';
import { PremiumOptionCard } from '../components/PremiumOptionCard';
import { TransitionFadeWrapper } from '../components/TransitionFadeWrapper';
import styles from '@/styles/VibrationalExam.module.scss';
import { leadCache } from '../lib/leadCache';
import { logQuizProgress } from '../lib/leadTracker';
import { buildRouteStep, createFunnelTracker, QUIZ_FUNNEL_ID, QUIZ_PROGRESS_STEPS, getDefaultBaseUrl, readStoredCountry, shouldSendEvent } from '../lib/funnelTracker';
import { useExitIntent } from '../hooks/useExitIntent';
import { usePrefetch } from '../hooks/usePrefetch';

const DEBUG = import.meta.env.DEV;
const STEP = 1;
const DELAY = 1200;

const FB = {
    sim_drenado: { sev: 'critical', zone: 'Cabeça + Plexo Solar', msg: '✦ Exaustão vibracional detectada no seu campo energético.' },
    cabeca_nunca_desliga: { sev: 'high', zone: 'Cabeça', msg: '✦ Mente inquieta bloqueia o fluxo de manifestação.' },
    ignoro_pausa: { sev: 'medium', zone: 'Plexo Solar', msg: '✦ Sinais de desalinhamento sutil captados.' },
    pouco_forte: { sev: 'low', zone: 'Campo Energético', msg: '✦ Frequência estável. Campo monitorado.' },
};
const SEV_N = { sim_drenado: 3, cabeca_nunca_desliga: 3, ignoro_pausa: 2, pouco_forte: 1 };
const sc = (s) => ({ critical: { opt: styles.optionSelectedCritical, buf: styles.bufferCritical, z: styles.feedbackZoneCritical, d: styles.dotCritical, c: styles.countCritical, p: styles.progressCritical }, high: { opt: styles.optionSelectedHigh, buf: styles.bufferHigh, z: styles.feedbackZoneHigh, d: styles.dotHigh, c: styles.countHigh, p: styles.progressHigh }, medium: { opt: styles.optionSelectedMedium, buf: styles.bufferMedium, z: styles.feedbackZoneMedium, d: styles.dotMedium, c: styles.countMedium, p: styles.progressMedium }, low: { opt: styles.optionSelectedLow, buf: styles.bufferLow, z: styles.feedbackZoneLow, d: styles.dotLow, c: styles.countLow, p: styles.progressLow } }[s] || {});

export default function CompontTest1() {
    const { t } = useTranslation(); const nav = useNavigate(); const [sp] = useSearchParams();
    const prefetchPath = usePrefetch();
    const [sel, setSel] = useState(null);
    const [blk, setBlk] = useState(() => { try { sessionStorage.removeItem('ve_blockages'); return []; } catch { return []; } });
    useExitIntent();
    useEffect(() => { const r = () => Promise.allSettled([import('./CompontTest2')]).catch(() => { }); try { if (typeof window.requestIdleCallback === 'function') { window.requestIdleCallback(r, { timeout: 1200 }); return; } } catch { } const t2 = setTimeout(r, 400); return () => clearTimeout(t2); }, []);
    useEffect(() => { const tr = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }); if (shouldSendEvent('step_view:/compont-test-1')) tr.stepView(buildRouteStep('/compont-test-1', QUIZ_PROGRESS_STEPS.quizStep1)).catch(() => { }); }, []);

    const q = {
        id: 'q1_body_mind_help', title: t('quiz.step1.q1.title'), category: 'CORPO & MENTE',
        options: [
            { key: 'sim_drenado', text: t('quiz.step1.q1.options.sim_drenado'), sev: 'critical' },
            { key: 'cabeca_nunca_desliga', text: t('quiz.step1.q1.options.cabeca_nunca_desliga'), sev: 'high' },
            { key: 'ignoro_pausa', text: t('quiz.step1.q1.options.ignoro_pausa'), sev: 'medium' },
            { key: 'pouco_forte', text: t('quiz.step1.q1.options.pouco_forte'), sev: 'low' },
        ]
    };

    const click = (k) => {
        if (sel) return; setSel(k);
        const ans = { [q.id]: k }; const o = q.options.find(x => x.key === k);
        
        // Offloading de persistência e tracking para não travar a fluidez visual
        const runAnalytics = () => {
            const sv = SEV_N[k] || 1;
            const nb = [{ zone: 'head', severity: Math.min(sv, 3) }, { zone: 'solar', severity: Math.min(sv, 2) }];
            setBlk(nb); try { sessionStorage.setItem('ve_blockages', JSON.stringify(nb)); } catch { }
            
            if (o) { 
                createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG })
                    .desireSelectedWithStep({ id: '/compont-test-1', index: 7, name: 'exame vibracional 1' }, { desire: o.text, question: q.title, response: [o.text] })
                    .catch(() => { }); 
            }
            try { 
                leadCache.setEtapa('CP03 - Quiz'); 
                leadCache.mergeQuizAnswers(ans); 
                leadCache.saveQAsForStep('quiz_step_1', [q], ans); 
                logQuizProgress(); 
            } catch { }
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(runAnalytics, { timeout: 800 });
        } else {
            setTimeout(runAnalytics, 0);
        }

        setTimeout(() => { const a = {}; sp.forEach((v, k2) => { a[k2] = v; }); Object.assign(a, ans); nav(`/compont-test-2?${new URLSearchParams(a).toString()}`); }, DELAY);
    };

    const fb = sel ? FB[sel] : null; 
    const c = fb ? sc(fb.sev) : {};

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
                                sim_drenado: '🥀',
                                cabeca_nunca_desliga: '🧠',
                                ignoro_pausa: '🏃‍♀️',
                                pouco_forte: '🛡️'
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
                                   onPointerDown={() => prefetchPath('/compont-test-2')}
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
