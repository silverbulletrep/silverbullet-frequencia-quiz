import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VibrationalBody from '../components/VibrationalBody';
import styles from './ResultadoPage2.module.scss';
import { leadCache } from '../lib/leadCache';
import { useExitIntent } from '../hooks/useExitIntent';

const ZONE_NAMES = {
    head: 'Cabeça', solar: 'Plexo Solar', heart: 'Coração',
    throat: 'Garganta', root: 'Raiz', sacral: 'Sacral',
    limbs: 'Membros',
};

export default function ResultadoPage2() {
    const nav = useNavigate();
    const [blockages, setBlockages] = useState([]);
    useExitIntent();

    useEffect(() => {
        try { leadCache.setEtapa('CP05 - Resultado'); } catch { }
        try {
            const s = sessionStorage.getItem('ve_blockages');
            if (s) setBlockages(JSON.parse(s));
        } catch { }
    }, []);

    // Calcular insights
    const criticalCount = blockages.filter(b => b.severity >= 3).length;
    const totalCount = blockages.length;

    // Zona mais afetada
    const zoneMap = {};
    blockages.forEach(b => {
        zoneMap[b.zone] = (zoneMap[b.zone] || 0) + b.severity;
    });
    const topZone = Object.entries(zoneMap).sort((a, b) => b[1] - a[1])[0];
    const topZoneName = topZone ? (ZONE_NAMES[topZone[0]] || topZone[0]) : 'Não identificada';

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.badge}>
                        <span className={styles.badgeDot} />
                        Diagnóstico Personalizado
                    </span>
                    <h1 className={styles.title}>Seu Diagnóstico Vibracional</h1>
                    <p className={styles.subtitle}>
                        Baseado nas suas 6 respostas, identificamos os bloqueios que impedem sua manifestação.
                    </p>
                </div>

                {/* Corpo vibracional completo */}
                <div className={styles.bodySection}>
                    <div className={styles.bodyWrapper}>
                        <VibrationalBody blockages={blockages} />
                    </div>
                </div>

                {/* 3 Insight cards */}
                <div className={styles.insights}>
                    <div className={`${styles.insightCard} ${styles.insightDanger}`}>
                        <span className={styles.insightIcon}>🔴</span>
                        <div className={styles.insightTexts}>
                            <span className={styles.insightLabel}>Bloqueios Graves</span>
                            <span className={styles.insightValue}>
                                {criticalCount > 0
                                    ? `${criticalCount} bloqueio${criticalCount > 1 ? 's' : ''} grave${criticalCount > 1 ? 's' : ''} detectado${criticalCount > 1 ? 's' : ''}`
                                    : 'Nenhum bloqueio grave detectado'}
                            </span>
                        </div>
                    </div>

                    <div className={`${styles.insightCard} ${styles.insightWarning}`}>
                        <span className={styles.insightIcon}>⚡</span>
                        <div className={styles.insightTexts}>
                            <span className={styles.insightLabel}>Zona Mais Afetada</span>
                            <span className={styles.insightValue}>{topZoneName}</span>
                        </div>
                    </div>

                    <div className={`${styles.insightCard} ${styles.insightMystic}`}>
                        <span className={styles.insightIcon}>✦</span>
                        <div className={styles.insightTexts}>
                            <span className={styles.insightLabel}>Nível Vibracional</span>
                            <span className={styles.insightValue}>
                                {totalCount >= 8 ? 'Frequência vibracional comprometida' :
                                    totalCount >= 5 ? 'Desequilíbrio vibracional moderado' :
                                        'Campo vibracional com sinais de alerta'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                {/* CTA */}
                <div className={styles.ctaSection}>
                    <button
                        type="button"
                        className={styles.ctaButton}
                        onClick={() => nav('/vsl')}
                    >
                        Descubra Como Limpar Seus Bloqueios
                    </button>
                    <p className={styles.ctaSub}>
                        ✦ Método exclusivo do Dr. Johann Müller
                    </p>
                </div>
            </div>
        </div>
    );
}
