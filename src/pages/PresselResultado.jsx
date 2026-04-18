import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../../Pressel - Wl - Vidal/assets/css/style.css'
import tumb from '../../Pressel - Wl - Vidal/img/tumb_pressel.webp'

export default function PresselResultado() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[PRESSEL] Página de resultado carregada')
  }, [])

  const vslUrl = 'https://vitavants.com/vsl-vitagrasa-np/'

  return (
    <div>
      <div className="background-pattern"></div>
      <div className="card-container result-card-conversion">
        <main className="quiz-content result-content-conversion">
          <div className="result-hook">
            <div className="checkmark-wrapper">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
            </div>
            <h1>{t('pressel.title')}</h1>
            <p className="lead-headline">{t('pressel.lead_part1')} <span className="lead-highlight">{t('pressel.lead_highlight1')}</span> {t('pressel.lead_part2')} <span className="lead-highlight">{t('pressel.lead_highlight2')}</span>.</p>
          </div>

          <div className="vsl-section">
            <p className="vsl-intro-text lead-subheadline">{t('pressel.vsl_intro_part1')} <span className="lead-highlight">{t('pressel.vsl_intro_highlight1')}</span> {t('pressel.vsl_intro_part2')} <span className="lead-highlight">{t('pressel.vsl_intro_highlight2')}</span> {t('pressel.vsl_intro_part3')} <span className="lead-highlight">{t('pressel.vsl_intro_highlight3')}</span>.</p>
            <a href={vslUrl} className="vsl-link" target="_blank" rel="noreferrer">
              <div className="vsl-thumbnail">
                <img src={tumb} alt={t('pressel.vsl_alt')} />
                <div className="play-button"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></div>
              </div>
            </a>
          </div>

          <div className="cta-section">
            <div className="cta-wrapper">
              <a href={vslUrl} className="cta-button final-cta" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
                <span>{t('pressel.cta_button')}</span>
              </a>
            </div>
            <p className="cta-subtext">{t('pressel.cta_subtext')}</p>
          </div>

          <div className="bullet-points-wrapper">
            <h3 className="bullet-title">{t('pressel.bullet_title')}</h3>
            <div className="bullet-item"><span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p><strong>{t('pressel.bullet_1_part1')}</strong> {t('pressel.bullet_1_part2')} <span style={{ textTransform: 'uppercase' }}>{t('pressel.bullet_1_highlight')}</span> {t('pressel.bullet_1_part3')} <strong>{t('pressel.bullet_1_bold')}</strong> {t('pressel.bullet_1_part4')}</p></div>
            <div className="bullet-item"><span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p>{t('pressel.bullet_2_part1')} <span style={{ textTransform: 'uppercase' }}>{t('pressel.bullet_2_highlight')}</span> {t('pressel.bullet_2_part2')} <strong>{t('pressel.bullet_2_bold')}</strong> {t('pressel.bullet_2_part3')}</p></div>
            <div className="bullet-item"><span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p>{t('pressel.bullet_3_part1')} <strong>{t('pressel.bullet_3_bold')}</strong> {t('pressel.bullet_3_part2')}</p></div>
            <div className="bullet-item"><span className="bullet-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span><p><span style={{ textTransform: 'uppercase' }}>{t('pressel.bullet_4_highlight')}</span> {t('pressel.bullet_4_part1')} <strong>{t('pressel.bullet_4_bold')}</strong> {t('pressel.bullet_4_part2')}</p></div>
          </div>

          <div className="trust-urgency-wrapper">
            <div className="live-viewers"><span className="live-dot"></span><strong>{t('pressel.urgency_join')}</strong></div>
            <p className="urgency-text">{t('pressel.urgency_warning')}</p>
          </div>
        </main>
      </div>
    </div>
  )
}

