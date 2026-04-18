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
const STEP = 4;
const DELAY = 1200;

const FB = {
    sim_sinto_na_pele: { sev: 'critical', zone: 'Raiz + Membros', msg: '✦ Campo absorvendo energias negativas do ambiente.' },
    frequentemente_sensivel: { sev: 'high', zone: 'Raiz', msg: '✦ Alta sensibilidade energética confirmada.' },
    as_vezes_tenso: { sev: 'medium', zone: 'Membros', msg: '✦ Tensão periférica manifestando-se no corpo.' },
    pouco_incomoda: { sev: 'low', zone: 'Campo Protetor', msg: '✦ Campo protetor ativo. Blindagem funcionando.' },
};

const SEV_N = { sim_sinto_na_pele: 3, frequentemente_sensivel: 3, as_vezes_tenso: 2, pouco_incomoda: 1 };

const sc = (s) => ({ critical: { opt: styles.optionSelectedCritical, buf: styles.bufferCritical, z: styles.feedbackZoneCritical, d: styles.dotCritical, c: styles.countCritical, p: styles.progressCritical }, high: { opt: styles.optionSelectedHigh, buf: styles.bufferHigh, z: styles.feedbackZoneHigh, d: styles.dotHigh, c: styles.countHigh, p: styles.progressHigh }, medium: { opt: styles.optionSelectedMedium, buf: styles.bufferMedium, z: styles.feedbackZoneMedium, d: styles.dotMedium, c: styles.countMedium, p: styles.progressMedium }, low: { opt: styles.optionSelectedLow, buf: styles.bufferLow, z: styles.feedbackZoneLow, d: styles.dotLow, c: styles.countLow, p: styles.progressLow } }[s] || {});

export default function CompontTest4() {
    const { t } = useTranslation(); const nav = useNavigate(); const [sp] = useSearchParams();
    const prefetchPath = usePrefetch();
    const [sel, setSel] = useState(null);
    const [blk, setBlk] = useState(() => { try { const s = sessionStorage.getItem('ve_blockages'); return s ? JSON.parse(s) : []; } catch { return []; } });
    useExitIntent();
    useEffect(() => { const r = () => Promise.allSettled([import('./CompontTest5')]).catch(() => { }); try { if (typeof window.requestIdleCallback === 'function') { window.requestIdleCallback(r, { timeout: 1200 }); return; } } catch { } const t2 = setTimeout(r, 400); return () => clearTimeout(t2); }, []);
    useEffect(() => { const tr = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }); if (shouldSendEvent('step_view:/compont-test-4')) tr.stepView(buildRouteStep('/compont-test-4', QUIZ_PROGRESS_STEPS.quizStep4)).catch(() => { }); }, []);

    const q = {
        id: 'q4_casa_energia_pesada', title: t('quiz.step4.q4_casa_energia_pesada.title'), category: 'ENERGIA & PROTEÇÃO',
        options: [
            { key: 'sim_sinto_na_pele', text: t('quiz.step4.q4_casa_energia_pesada.options.sim_sinto_na_pele'), sev: 'critical' },
            { key: 'frequentemente_sensivel', text: t('quiz.step4.q4_casa_energia_pesada.options.frequentemente_sensivel'), sev: 'high' },
            { key: 'as_vezes_tenso', text: t('quiz.step4.q4_casa_energia_pesada.options.as_vezes_tenso'), sev: 'medium' },
            { key: 'pouco_incomoda', text: t('quiz.step4.q4_casa_energia_pesada.options.pouco_incomoda'), sev: 'low' },
        ]
    };

    const click = (k) => {
        if (sel) return; setSel(k);
        const ans = { [q.id]: k }; const o = q.options.find(x => x.key === k);
        
        const runAnalytics = () => {
            const sv = SEV_N[k] || 1;
            const nb = [...blk, { zone: 'root', severity: Math.min(sv, 3) }, { zone: 'limbs', severity: Math.min(sv, 2) }];
            setBlk(nb); try { sessionStorage.setItem('ve_blockages', JSON.stringify(nb)); } catch { }
            if (o) { createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }).desireSelectedWithStep({ id: '/compont-test-4', index: 10, name: 'exame vibracional 4' }, { desire: o.text, question: q.title, response: [o.text] }).catch(() => { }); }
            try { leadCache.setEtapa('CP03 - Quiz'); leadCache.mergeQuizAnswers(ans); leadCache.saveQAsForStep('quiz_step_4', [q], ans); logQuizProgress(); } catch { }
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(runAnalytics, { timeout: 800 });
        } else {
            setTimeout(runAnalytics, 0);
        }

        setTimeout(() => { const a = {}; sp.forEach((v, k2) => { a[k2] = v; }); Object.assign(a, ans); nav(`/compont-test-5?${new URLSearchParams(a).toString()}`); }, DELAY);
    };

    const fb = sel ? FB[sel] : null; const c = fb ? sc(fb.sev) : {};
    return (
        <TransitionFadeWrapper>
        <div className={styles.examPage}>
            <div className={styles.examSubHeader}>
                <span className={styles.examBadge}><span className={styles.examBadgeDot} />Exame Vibracional</span>
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
                                sim_sinto_na_pele: '🧠',
                                frequentemente_sensivel: '🌩️',
                                as_vezes_tenso: '🧗‍♂️',
                                pouco_incomoda: '🛡️'
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
                                   onPointerDown={() => prefetchPath('/compont-test-5')}
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
                    <span className={styles.bodyScanLabel}>Sincronização em tempo real</span>
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
