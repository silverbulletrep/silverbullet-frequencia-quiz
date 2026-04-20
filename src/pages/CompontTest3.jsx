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
const STEP = 3;
const DELAY = 1200;

const FB = {
    sim_mexe_demais: { sev: 'critical', zone: 'Plexo Solar', msg: '✦ Centro de poder pessoal bloqueado. Prosperidade impedida.' },
    as_vezes_fujo: { sev: 'high', zone: 'Plexo Solar', msg: '✦ Padrão de fuga financeira detectado.' },
    detesto_quando_acontece: { sev: 'medium', zone: 'Plexo Solar', msg: '✦ Tensão financeira criando resistência à abundância.' },
    nao_costumo: { sev: 'low', zone: 'Campo de Prosperidade', msg: '✦ Canal de abundância aberto e fluindo.' },
};

const SEV_N = { sim_mexe_demais: 3, as_vezes_fujo: 3, detesto_quando_acontece: 2, nao_costumo: 1 };

const sc = (s) => ({ critical: { opt: styles.optionSelectedCritical, buf: styles.bufferCritical, z: styles.feedbackZoneCritical, d: styles.dotCritical, c: styles.countCritical, p: styles.progressCritical }, high: { opt: styles.optionSelectedHigh, buf: styles.bufferHigh, z: styles.feedbackZoneHigh, d: styles.dotHigh, c: styles.countHigh, p: styles.progressHigh }, medium: { opt: styles.optionSelectedMedium, buf: styles.bufferMedium, z: styles.feedbackZoneMedium, d: styles.dotMedium, c: styles.countMedium, p: styles.progressMedium }, low: { opt: styles.optionSelectedLow, buf: styles.bufferLow, z: styles.feedbackZoneLow, d: styles.dotLow, c: styles.countLow, p: styles.progressLow } }[s] || {});

export default function CompontTest3() {
    const { t } = useTranslation(); const nav = useNavigate(); const [sp] = useSearchParams();
    const prefetchPath = usePrefetch();
    const [sel, setSel] = useState(null);
    const [blk, setBlk] = useState(() => { try { const s = sessionStorage.getItem('ve_blockages'); return s ? JSON.parse(s) : []; } catch { return []; } });
    useExitIntent();
    useEffect(() => { const r = () => Promise.allSettled([import('./CompontTest4')]).catch(() => { }); try { if (typeof window.requestIdleCallback === 'function') { window.requestIdleCallback(r, { timeout: 1200 }); return; } } catch { } const t2 = setTimeout(r, 400); return () => clearTimeout(t2); }, []);
    useEffect(() => { const tr = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }); if (shouldSendEvent('step_view:/compont-test-3')) tr.stepView(buildRouteStep('/compont-test-3', QUIZ_PROGRESS_STEPS.quizStep3)).catch(() => { }); }, []);

    const q = {
        id: 'q3_evitar_encontros_financas', title: t('quiz.step3.q3_evitar_encontros_financas.title'), category: 'FINANÇAS & ABUNDÂNCIA',
        options: [
            { key: 'sim_mexe_demais', text: t('quiz.step3.q3_evitar_encontros_financas.options.sim_mexe_demais'), sev: 'critical' },
            { key: 'as_vezes_fujo', text: t('quiz.step3.q3_evitar_encontros_financas.options.as_vezes_fujo'), sev: 'high' },
            { key: 'detesto_quando_acontece', text: t('quiz.step3.q3_evitar_encontros_financas.options.detesto_quando_acontece'), sev: 'medium' },
            { key: 'nao_costumo', text: t('quiz.step3.q3_evitar_encontros_financas.options.nao_costumo'), sev: 'low' },
        ]
    };

    const click = (k) => {
        if (sel) return; setSel(k);
        const ans = { [q.id]: k }; const o = q.options.find(x => x.key === k);
        
        const runAnalytics = () => {
            const sv = SEV_N[k] || 1;
            const nb = [...blk, { zone: 'solar', severity: Math.min(sv, 3) }];
            setBlk(nb); try { sessionStorage.setItem('ve_blockages', JSON.stringify(nb)); } catch { }
            if (o) { createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }).desireSelectedWithStep({ id: '/compont-test-3', index: 9, name: 'exame vibracional 3' }, { desire: o.text, question: q.title, response: [o.text] }).catch(() => { }); }
            try { leadCache.setEtapa('CP03 - Quiz'); leadCache.mergeQuizAnswers(ans); leadCache.saveQAsForStep('quiz_step_3', [q], ans); logQuizProgress(); } catch { }
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(runAnalytics, { timeout: 800 });
        } else {
            setTimeout(runAnalytics, 0);
        }

        setTimeout(() => { const a = {}; sp.forEach((v, k2) => { a[k2] = v; }); Object.assign(a, ans); nav(`/compont-test-4?${new URLSearchParams(a).toString()}`); }, DELAY);
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
                                sim_mexe_demais: '😫',
                                as_vezes_fujo: '🏋️‍♂️',
                                detesto_quando_acontece: '📉',
                                nao_costumo: '💎'
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
                                   onPointerDown={() => prefetchPath('/compont-test-4')}
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
