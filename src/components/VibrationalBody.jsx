import React, { useMemo } from 'react';
import styles from './VibrationalBody.module.scss';

/**
 * Zonas do corpo humano para mapeamento de bloqueios vibracionais.
 *
 * Props:
 *  - blockages: Array<{ zone: string, severity: 1|2|3 }>
 *    zone IDs: 'head', 'throat', 'heart', 'solar', 'sacral', 'root', 'limbs'
 *  - scanning: boolean (anima a scan line)
 */

const ZONE_LABELS = {
    head: 'Cabeça',
    throat: 'Garganta',
    heart: 'Coração',
    solar: 'Plexo Solar',
    sacral: 'Sacral',
    root: 'Raiz',
    limbs: 'Membros',
};

const VibrationalBody = ({ blockages = [], scanning = false, compact = false }) => {
    const blockageMap = useMemo(() => {
        const map = {};
        blockages.forEach(b => { map[b.zone] = b.severity; });
        return map;
    }, [blockages]);

    const hasAny = blockages.length > 0;

    const zoneClass = (zone) => {
        const sev = blockageMap[zone];
        if (!sev) return styles.zone;
        return `${styles.zone} ${styles.zoneActive} ${sev === 1 ? styles.severity1 : sev === 2 ? styles.severity2 : styles.severity3
            }`;
    };

    const labelClass = (zone) => {
        return blockageMap[zone]
            ? `${styles.zoneLabel} ${styles.zoneLabelActive}`
            : styles.zoneLabel;
    };

    return (
        <div className={`${styles.bodyWrapper} ${compact ? styles.bodyWrapperCompact : ''}`}>
            <svg
                className={styles.bodySvg}
                viewBox="0 0 200 420"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Mapa vibracional do corpo humano"
            >
                <defs>
                    {/* Glow filters */}
                    <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feFlood floodColor="#e53935" floodOpacity="0.5" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glowDark" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feFlood floodColor="#1a1a1a" floodOpacity="0.6" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feFlood floodColor="#00d4aa" floodOpacity="0.3" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Scan line gradient */}
                    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4aa" stopOpacity="0" />
                        <stop offset="40%" stopColor="#00d4aa" stopOpacity="0.6" />
                        <stop offset="60%" stopColor="#00d4aa" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* ── Grid lines (fundo científico) ── */}
                <g opacity="0.06" stroke="#00d4aa" strokeWidth="0.5">
                    {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(y => (
                        <line key={`h${y}`} x1="10" y1={y} x2="190" y2={y} />
                    ))}
                    {[40, 60, 80, 100, 120, 140, 160].map(x => (
                        <line key={`v${x}`} x1={x} y1="10" x2={x} y2="410" />
                    ))}
                </g>

                {/* ── Corpo humano (silhueta anatômica) ── */}
                <g className={`${styles.bodyOutline} ${hasAny ? styles.bodyOutlineActive : ''}`}>
                    {/* Cabeça */}
                    <ellipse cx="100" cy="42" rx="22" ry="28" />
                    {/* Pescoço */}
                    <rect x="92" y="70" width="16" height="16" rx="4" />
                    {/* Tronco */}
                    <path d="M68 86 Q60 90 55 110 L52 180 Q50 200 58 210 L70 215 Q80 218 100 220 Q120 218 130 215 L142 210 Q150 200 148 180 L145 110 Q140 90 132 86 Z" />
                    {/* Braço esquerdo */}
                    <path d="M55 100 Q40 105 30 135 L22 185 Q18 200 25 210 L30 212 Q35 210 38 195 L48 145 Q52 125 55 115" fill="none" />
                    {/* Mão esquerda */}
                    <ellipse cx="27" cy="215" rx="8" ry="10" />
                    {/* Braço direito */}
                    <path d="M145 100 Q160 105 170 135 L178 185 Q182 200 175 210 L170 212 Q165 210 162 195 L152 145 Q148 125 145 115" fill="none" />
                    {/* Mão direita */}
                    <ellipse cx="173" cy="215" rx="8" ry="10" />
                    {/* Perna esquerda */}
                    <path d="M78 218 Q72 240 68 280 L65 330 Q63 355 60 380 L58 400 Q56 410 65 412 L75 410 Q78 405 76 395 L80 340 Q82 310 85 280 L90 240" fill="none" />
                    {/* Pé esquerdo */}
                    <ellipse cx="67" cy="412" rx="12" ry="5" />
                    {/* Perna direita */}
                    <path d="M122 218 Q128 240 132 280 L135 330 Q137 355 140 380 L142 400 Q144 410 135 412 L125 410 Q122 405 124 395 L120 340 Q118 310 115 280 L110 240" fill="none" />
                    {/* Pé direito */}
                    <ellipse cx="133" cy="412" rx="12" ry="5" />
                </g>

                {/* ── Linha central (coluna) ── */}
                <line x1="100" y1="70" x2="100" y2="220" stroke="#1e2a45" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />

                {/* ── Zonas de bloqueio (overlays) ── */}
                {/* Cabeça */}
                <ellipse cx="100" cy="42" rx="24" ry="30" className={zoneClass('head')} />
                {/* Garganta */}
                <ellipse cx="100" cy="80" rx="14" ry="10" className={zoneClass('throat')} />
                {/* Coração */}
                <ellipse cx="100" cy="120" rx="26" ry="18" className={zoneClass('heart')} />
                {/* Plexo Solar */}
                <ellipse cx="100" cy="155" rx="22" ry="16" className={zoneClass('solar')} />
                {/* Sacral */}
                <ellipse cx="100" cy="190" rx="20" ry="14" className={zoneClass('sacral')} />
                {/* Raiz */}
                <ellipse cx="100" cy="220" rx="18" ry="12" className={zoneClass('root')} />
                {/* Membros (braços + pernas) */}
                <g className={zoneClass('limbs')}>
                    <ellipse cx="35" cy="170" rx="16" ry="40" />
                    <ellipse cx="165" cy="170" rx="16" ry="40" />
                    <ellipse cx="75" cy="340" rx="12" ry="50" />
                    <ellipse cx="125" cy="340" rx="12" ry="50" />
                </g>

                {/* ── Chakra dots (pontos centrais) ── */}
                <g>
                    {[
                        { zone: 'head', cx: 100, cy: 42 },
                        { zone: 'throat', cx: 100, cy: 80 },
                        { zone: 'heart', cx: 100, cy: 120 },
                        { zone: 'solar', cx: 100, cy: 155 },
                        { zone: 'sacral', cx: 100, cy: 190 },
                        { zone: 'root', cx: 100, cy: 220 },
                    ].map(p => (
                        <circle
                            key={p.zone}
                            cx={p.cx}
                            cy={p.cy}
                            r={blockageMap[p.zone] ? 4 : 2.5}
                            fill={blockageMap[p.zone] ? '#e53935' : '#2a4a6a'}
                            opacity={blockageMap[p.zone] ? 1 : 0.5}
                            style={{ transition: 'all 500ms ease' }}
                        />
                    ))}
                </g>

                {/* ── Labels das zonas ── */}
                <text x="155" cy="42" y="45" className={labelClass('head')}>{ZONE_LABELS.head}</text>
                <text x="148" y="83" className={labelClass('throat')}>{ZONE_LABELS.throat}</text>
                <text x="155" y="123" className={labelClass('heart')}>{ZONE_LABELS.heart}</text>
                <text x="155" y="158" className={labelClass('solar')}>{ZONE_LABELS.solar}</text>
                <text x="152" y="193" className={labelClass('sacral')}>{ZONE_LABELS.sacral}</text>
                <text x="148" y="223" className={labelClass('root')}>{ZONE_LABELS.root}</text>

                {/* ── Scan line ── */}
                <rect
                    x="20"
                    y="0"
                    width="160"
                    height="30"
                    fill="url(#scanGrad)"
                    className={`${styles.scanLine} ${scanning ? styles.scanLineActive : ''}`}
                />
            </svg>
        </div>
    );
};

export default VibrationalBody;
