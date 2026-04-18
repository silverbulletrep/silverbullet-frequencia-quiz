import React from 'react'
import styles from './DidYouKnow.module.scss'

export default function DidYouKnow({ onContinue }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Você sabia?</h3>

      <div className={styles.graphContainer}>
        {/* HTML Badges for Labels - positioned absolutely */}
        <div className={`${styles.label} ${styles.labelSpirio}`}>Usuários Plano</div>
        <div className={`${styles.label} ${styles.labelNoPlan}`}>
          Sem plano
        </div>

        <svg className={styles.graphSvg} viewBox="0 0 329 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid Lines */}
          <path fill="#34293E" d="M.5 32.4h325v2H.5zM.5 65.8h325v2H.5zM.5 99.2h325v2H.5zM.5 132.6h325v2H.5zM.5 166h325v2H.5z" />
          
          {/* Vertical Dashed Line */}
          <rect x="226" y="18" width="3" height="8" fill="#655868" />
          <rect x="226" y="34" width="3" height="8" fill="#655868" />
          <rect x="226" y="50" width="3" height="8" fill="#655868" />
          <rect x="226" y="66" width="3" height="8" fill="#655868" />
          <rect x="226" y="82" width="3" height="8" fill="#655868" />
          <rect x="226" y="98" width="3" height="8" fill="#655868" />
          <rect x="226" y="114" width="3" height="8" fill="#655868" />
          <rect x="226" y="130" width="3" height="8" fill="#655868" />
          <rect x="226" y="146" width="3" height="8" fill="#655868" />
          <rect x="226" y="162" width="3" height="4" fill="#655868" />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradSpirio" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient id="gradNoPlan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4F4F" />
              <stop offset="100%" stopColor="#FF4F4F" />
            </linearGradient>
          </defs>

          {/* Lines - Updated from Docs.md */}
          
          {/* Line 2: No Plan (Red) */}
          <path 
            stroke="url(#gradNoPlan)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            d="M9 157.383c36.333-18 157.4-26.1 317-24.5"
            className={styles.animDraw}
            style={{ strokeDasharray: 350, strokeDashoffset: 330, animationDelay: '0.2s' }}
          />

          {/* Line 3: Spirio Users (Green) */}
          <path 
            stroke="url(#gradSpirio)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            d="M9 155.883c6.692.973-8.557 9.055 2.5-.5 36.255-31.332 70.5-12.5 115.5-49.5C177.5 56.5 238.5 51.5 324.5 43.5"
            className={styles.animDraw}
            style={{ strokeDasharray: 350, strokeDashoffset: 330, animationDelay: '0.4s' }}
          />

          {/* Dots */}
          {/* Start Dot */}
          <path fill="#261F2E" d="M10.392 156.359c-7.951 7.174 2.426 1.851 0 0Z" />

          {/* Spirio Dots */}
          <circle cx="180" cy="70" r="6" fill="#227E64" stroke="#fff" strokeWidth="3" className={styles.animAppear} style={{ animationDelay: '1.2s' }} />
          <circle cx="202" cy="62.5" r="7.5" fill="#227E64" stroke="#fff" strokeWidth="4" className={styles.animAppear} style={{ animationDelay: '1.4s' }} />
          <circle cx="227" cy="56.5" r="7.5" fill="#227E64" stroke="#fff" strokeWidth="4" className={styles.animAppear} style={{ animationDelay: '1.6s' }} />

          {/* No Plan Dot */}
          <circle cx="227" cy="133.5" r="7.5" fill="#FF4F4F" stroke="#fff" strokeWidth="4" className={styles.animAppear} style={{ animationDelay: '1.8s' }} />

        </svg>

        <div className={styles.xAxis}>
          <span className={styles.xAxisLabel}>HOJE</span>
          <span className={styles.xAxisLabel}>1º MÊS</span>
        </div>
      </div>

      <p className={styles.disclaimer}>*Para fins ilustrativos apenas. Resultados individuais podem variar.</p>

      <div className={styles.offerBox}>
        <p className={styles.offerText}>
          Queremos que você tenha sucesso, por isso estamos oferecendo um <strong>Desconto Adicional</strong> no seu <span className={styles.highlight}>Plano Personalizado de Frequências</span>.
        </p>
      </div>

      <button 
        className={styles.ctaButton}
        onClick={onContinue}
      >CONTINUAR</button>
    </div>
  )
}
