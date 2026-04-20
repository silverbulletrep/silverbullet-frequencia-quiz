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
const STEP = 5;
const DELAY = 1200;

const FB = {
    sim_magoa: { sev: 'critical', zone: 'Garganta + Coração', msg: '✦ Solidão bloqueando comunicação e manifestação.' },
    varias_vezes: { sev: 'high', zone: 'Garganta', msg: '✦ Expressão suprimida criando barreira vibracional.' },
    as_vezes_distancia: { sev: 'medium', zone: 'Coração', msg: '✦ Distanciamento emocional sutil detectado.' },
    pouco_doi: { sev: 'low', zone: 'Conexão Ativa', msg: '✦ Vínculos fortalecidos. Campo receptivo.' },
};

const SEV_N = { sim_magoa: 3, varias_vezes: 3, as_vezes_distancia: 2, pouco_doi: 1 };

const sc = (s) => ({ critical: { opt: styles.optionSelectedCritical, buf: styles.bufferCritical, z: styles.feedbackZoneCritical, d: styles.dotCritical, c: styles.countCritical, p: styles.progressCritical }, high: { opt: styles.optionSelectedHigh, buf: styles.bufferHigh, z: styles.feedbackZoneHigh, d: styles.dotHigh, c: styles.countHigh, p: styles.progressHigh }, medium: { opt: styles.optionSelectedMedium, buf: styles.bufferMedium, z: styles.feedbackZoneMedium, d: styles.dotMedium, c: styles.countMedium, p: styles.progressMedium }, low: { opt: styles.optionSelectedLow, buf: styles.bufferLow, z: styles.feedbackZoneLow, d: styles.dotLow, c: styles.countLow, p: styles.progressLow } }[s] || {});

export default function CompontTest5() {
    const { t } = useTranslation(); const nav = useNavigate(); const [sp] = useSearchParams();
    const prefetchPath = usePrefetch();
    const [sel, setSel] = useState(null);
    const [blk, setBlk] = useState(() => { try { const s = sessionStorage.getItem('ve_blockages'); return s ? JSON.parse(s) : []; } catch { return []; } });
    useExitIntent();
    useEffect(() => { const r = () => Promise.allSettled([import('./CompontTest6')]).catch(() => { }); try { if (typeof window.requestIdleCallback === 'function') { window.requestIdleCallback(r, { timeout: 1200 }); return; } } catch { } const t2 = setTimeout(r, 400); return () => clearTimeout(t2); }, []);
    useEffect(() => { const tr = createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }); if (shouldSendEvent('step_view:/compont-test-5')) tr.stepView(buildRouteStep('/compont-test-5', QUIZ_PROGRESS_STEPS.quizStep5)).catch(() => { }); }, []);

    const q = {
        id: 'q5_sozinho_sem_apoio', title: t('quiz.step5.q5_sozinho_sem_apoio.title'), category: 'CONEXÃO & PROPÓSITO',
        options: [
            { key: 'sim_magoa', text: t('quiz.step5.q5_sozinho_sem_apoio.options.sim_magoa'), sev: 'critical' },
            { key: 'varias_vezes', text: t('quiz.step5.q5_sozinho_sem_apoio.options.varias_vezes'), sev: 'high' },
            { key: 'as_vezes_distancia', text: t('quiz.step5.q5_sozinho_sem_apoio.options.as_vezes_distancia'), sev: 'medium' },
            { key: 'pouco_doi', text: t('quiz.step5.q5_sozinho_sem_apoio.options.pouco_doi'), sev: 'low' },
        ]
    };

    const click = (k) => {
        if (sel) return; setSel(k);
        const ans = { [q.id]: k }; const o = q.options.find(x => x.key === k);
        
        const runAnalytics = () => {
            const sv = SEV_N[k] || 1;
            const nb = [...blk, { zone: 'throat', severity: Math.min(sv, 3) }, { zone: 'heart', severity: Math.min(sv, 2) }];
            setBlk(nb); try { sessionStorage.setItem('ve_blockages', JSON.stringify(nb)); } catch { }
            if (o) { createFunnelTracker({ baseUrl: getDefaultBaseUrl(), funnelId: QUIZ_FUNNEL_ID, getCountry: () => readStoredCountry() || undefined, debug: DEBUG }).desireSelectedWithStep({ id: '/compont-test-5', index: 11, name: 'exame vibracional 5' }, { desire: o.text, question: q.title, response: [o.text] }).catch(() => { }); }
            try { leadCache.setEtapa('CP03 - Quiz'); leadCache.mergeQuizAnswers(ans); leadCache.saveQAsForStep('quiz_step_5', [q], ans); logQuizProgress(); } catch { }
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(runAnalytics, { timeout: 800 });
        } else {
            setTimeout(runAnalytics, 0);
        }

        setTimeout(() => { const a = {}; sp.forEach((v, k2) => { a[k2] = v; }); Object.assign(a, ans); nav(`/compont-test-6?${new URLSearchParams(a).toString()}`); }, DELAY);
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
                                sim_magoa: '🤯',
                                varias_vezes: '🤐',
                                as_vezes_distancia: '↔️',
                                pouco_doi: '🫂'
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
                                   onPointerDown={() => prefetchPath('/compont-test-6')}
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
