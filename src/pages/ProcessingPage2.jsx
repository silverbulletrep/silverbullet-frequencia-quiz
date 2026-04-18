import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VibrationalBody from '../components/VibrationalBody';
import styles from './ProcessingPage2.module.scss';
import { leadCache } from '../lib/leadCache';
import { useExitIntent } from '../hooks/useExitIntent';

const PHASES = [
    { icon: '🔍', label: 'FASE 1 DE 3', title: 'Analisando suas respostas...', sub: 'Processando os dados do exame vibracional.', color: '#00d4aa' },
    { icon: null, label: 'FASE 2 DE 3', title: 'Mapeando bloqueios vibracionais...', sub: 'Identificando as zonas afetadas no seu corpo.', color: '#e53935' },
    { icon: '✨', label: 'FASE 3 DE 3', title: 'Preparando seu diagnóstico...', sub: 'Gerando resultado personalizado para você.', color: '#f0c040' },
];
const PHASE_DURATION = 3300;
const R = 72;
const C = 2 * Math.PI * R;

export default function ProcessingPage2() {
    const nav = useNavigate();
    const [phase, setPhase] = useState(0);
    const [progress, setProgress] = useState(0);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const [blockages, setBlockages] = useState([]);
    useExitIntent();

    useEffect(() => { try { leadCache.setEtapa('CP04 - PréOffer'); } catch { } }, []);

    useEffect(() => {
        try { const s = sessionStorage.getItem('ve_blockages'); if (s) setBlockages(JSON.parse(s)); } catch { }
        Promise.allSettled([import('./ResultadoPage2')]).catch(() => { });
    }, []);

    useEffect(() => {
        if (phase >= PHASES.length) { nav('/resultado2'); return; }
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const p = Math.min(Math.round((elapsed / PHASE_DURATION) * 100), 100);
            setProgress(p);
            if (p < 100) { rafRef.current = requestAnimationFrame(animate); }
            else { setTimeout(() => { setPhase(prev => prev + 1); setProgress(0); }, 600); }
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [phase, nav]);

    const ph = PHASES[phase] || PHASES[PHASES.length - 1];
    const dashOffset = C - (progress / 100) * C;

    return (
        <div className={styles.page}>
            <div className={styles.ringWrap}>
                <svg className={styles.ringSvg} viewBox="0 0 160 160">
                    <circle className={styles.ringBg} cx="80" cy="80" r={R} />
                    <circle className={styles.ringFill} cx="80" cy="80" r={R}
                        stroke={ph.color}
                        strokeDasharray={C}
                        strokeDashoffset={dashOffset} />
                </svg>
                {ph.icon ? (
                    <span className={styles.ringIcon}>{ph.icon}</span>
                ) : (
                    <div className={styles.bodyInRing}>
                        <VibrationalBody blockages={blockages} scanning compact />
                    </div>
                )}
            </div>
            <span className={styles.phaseLabel}>{ph.label}</span>
            <h1 className={styles.phaseTitle}>{ph.title}</h1>
            <p className={styles.phaseSubtext}>{ph.sub}</p>
        </div>
    );
}
