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
const STEP = 2;
const DELAY = 1200;

const FB = {
    sim_acontece_muito: { sev: 'critical', zone: 'Coração', msg: '✦ Bloqueio emocional profundo nas suas relações.' },
    algumas_vezes_afastar: { sev: 'high', zone: 'Coração', msg: '✦ Padrão de proteção emocional ativado.' },
    as_vezes_sem_energia: { sev: 'medium', zone: 'Coração', msg: '✦ Desgaste vibracional sutil nos relacionamentos.' },
    pouco_evitei_conflitos: { sev: 'low', zone: 'Campo Relacional', msg: '✦ Canal relacional aberto e receptivo.' },
};

const SEV_N = { sim_acontece_muito: 3, algumas_vezes_afastar: 3, as_vezes_sem_energia: 2, pouco_evitei_conflitos: 1 };

const sc = (s) => ({ critical: { opt: styles.optionSelectedCritical, buf: styles.bufferCritical, z: styles.feedbackZoneCritical, d: styles.dotCritical, c: styles.countCritical, p: styles.progressCritical }, high: { opt: styles.optionSelectedHigh, buf: styles.bufferHigh, z: styles.feedbackZoneHigh, d: styles.dotHigh, c: styles.countHigh, p: styles.progressHigh }, medium: { opt: styles.optionSelectedMedium, buf: styles.bufferMedium, z: styles.feedbackZoneMedium, d: styles.dotMedium, c: styles.countMedium, p: styles.progressMedium }, low: { opt: styles.optionSelectedLow, buf: styles.bufferLow, z: styles.feedbackZoneLow, d: styles.dotLow, c: styles.countLow, p: styles.progressLow } }[s] || {});

export default function CompontTest2() {
    const { t } = useTranslation(); const nav = useNavigate(); const [sp] = useSearchParams();
    const prefetchPath = usePrefetch();
    const [sel, setSel] = useState(null);
    const [blk, setBlk] = useState(() => { try { const s = sessionStorage.getItem('ve_blockages'); return s ? JSON.parse(s) : []; } catch { return []; } });
    useExitIntent();
    useEffect(() => { const r = () => Promise.allSettled([import('./CompontTest3')]).catch(() => { }); try { if (typeof window.requestIdleCallback === 'function') { window.requestIdleCallback(r, { timeout: 1200 }); return; } } catch { } const t2 = setTimeout(r, 400); return () => clearTimeout(t2); }, []);
    useEffect(() => { const tr = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }); if (shouldSendEvent('step_view:/compont-test-2')) tr.stepView(buildRouteStep('/compont-test-2', QUIZ_PROGRESS_STEPS.quizStep2)).catch(() => { }); }, []);

    const q = {
        id: 'q2_evitar_conversar', title: t('quiz.step2.q2_evitar_conversar.title'), category: 'RELACIONAMENTOS',
        options: [
            { key: 'sim_acontece_muito', text: t('quiz.step2.q2_evitar_conversar.options.sim_acontece_muito'), sev: 'critical' },
            { key: 'algumas_vezes_afastar', text: t('quiz.step2.q2_evitar_conversar.options.algumas_vezes_afastar'), sev: 'high' },
            { key: 'as_vezes_sem_energia', text: t('quiz.step2.q2_evitar_conversar.options.as_vezes_sem_energia'), sev: 'medium' },
            { key: 'pouco_evitei_conflitos', text: t('quiz.step2.q2_evitar_conversar.options.pouco_evitei_conflitos'), sev: 'low' },
        ]
    };

    const click = (k) => {
        if (sel) return; setSel(k);
        const ans = { [q.id]: k }; const o = q.options.find(x => x.key === k);

        const runAnalytics = () => {
            const sv = SEV_N[k] || 1;
            const nb = [...blk, { zone: 'heart', severity: Math.min(sv, 3) }];
            setBlk(nb); try { sessionStorage.setItem('ve_blockages', JSON.stringify(nb)); } catch { }
            if (o) { createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }).desireSelectedWithStep({ id: '/compont-test-2', index: 8, name: 'exame vibracional 2' }, { desire: o.text, question: q.title, response: [o.text] }).catch(() => { }); }
            try { leadCache.setEtapa('CP03 - Quiz'); leadCache.mergeQuizAnswers(ans); leadCache.saveQAsForStep('quiz_step_2', [q], ans); logQuizProgress(); } catch { }
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(runAnalytics, { timeout: 800 });
        } else {
            setTimeout(runAnalytics, 0);
        }

        setTimeout(() => { const a = {}; sp.forEach((v, k2) => { a[k2] = v; }); Object.assign(a, ans); nav(`/compont-test-3?${new URLSearchParams(a).toString()}`); }, DELAY);
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
                                    sim_acontece_muito: '💔',
                                    algumas_vezes_afastar: '🚶‍♂️',
                                    as_vezes_sem_energia: '🔋',
                                    pouco_evitei_conflitos: '🫂'
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
                                        onPointerDown={() => prefetchPath('/compont-test-3')}
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
