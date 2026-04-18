import React from 'react'
import styles from './DiscountBottomSheet.module.scss'
export default function StandardDiscountContent({ onContinue, spotsLeft = 27 }) {
  const isPtRoute = (() => {
    try {
      const pathname = String(window.location.pathname || '')
      return pathname.includes('/pt/') || pathname === '/pt' || pathname.endsWith('/pt')
    } catch {
      return false
    }
  })()

  const handleContinue = () => {
    onContinue?.()
  }

  return (
    <>
      <div className={styles.reservationHero}>
        <div className={styles.reservationBar}>{isPtRoute ? `Reservámos 1 de ${spotsLeft} vagas para si` : `Wir haben 1 von ${spotsLeft} Plätzen für dich reserviert`}</div>
        <div className={styles.heroBody}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>🌟</div>
            <div className={styles.heroText}>
              <div className={styles.heroTitle}>
                {isPtRoute ? 'O seu plano pessoal de crescimento de alta frequência' : 'Dein persönlicher Hochfrequenz‑Wachstumsplan'}
              </div>
            </div>
          </div>
          <div className={styles.verticalDivider} aria-hidden="true" />
          <span className={styles.heroBadge}>{isPtRoute ? 'Acesso Total' : 'Vollständiger Zugriff'}</span>
        </div>
      </div>

      <p className={styles.headline}>{isPtRoute ? 'Comece com Confiança' : 'Starte mit Zuversicht'}</p>

      <div className={styles.dividerLine} />

      <div className={styles.trustList}>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✔️</span>
          <span className={styles.trustText}>{isPtRoute ? 'Garantia de 30 dias: teste sem risco' : '30‑Tage‑Garantie: risikofrei testen'}</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✔️</span>
          <span className={styles.trustText}>{isPtRoute ? 'Acompanhamento total na app: plano claro passo a passo' : 'Volle Begleitung in der App: klarer Schritt‑für‑Schritt‑Plan'}</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✔️</span>
          <span className={styles.trustText}>{isPtRoute ? 'Uso simples: mais fácil que enviar uma mensagem' : 'Einfache Nutzung: leichter als eine Nachricht zu senden'}</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon}>✔️</span>
          <span className={styles.trustText}>{isPtRoute ? 'Plano pessoal para vibrar alto e alcançar objetivos' : 'Persönlicher Plan, um hoch zu schwingen und Ziele zu erreichen'}</span>
        </div>
      </div>

      <div
        className={styles.ctaRow}
        role="button"
        tabIndex={0}
        aria-label="Weiter"
        onClick={handleContinue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleContinue()
          }
        }}
      >{isPtRoute ? 'CONTINUAR' : 'WEITER'}</div>
    </>
  )
}
