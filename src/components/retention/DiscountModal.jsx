import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { createFunnelTracker, QUIZ_FUNNEL_ID, getDefaultBaseUrl, readStoredCountry, buildRouteStep, QUIZ_PROGRESS_STEPS, shouldSendEvent } from '../../lib/funnelTracker';
import styles from './DiscountModal.module.scss';

const DiscountModal = ({ 
  open, 
  onClose, 
  onActivate 
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!open) return;

    try {
      if (shouldSendEvent('discount_opened_event')) {
        const tracker = createFunnelTracker({
          baseUrl: getDefaultBaseUrl(),
          funnelId: QUIZ_FUNNEL_ID,
          getCountry: () => readStoredCountry() || undefined
        });
        const step = buildRouteStep('/fim/discount_modal', QUIZ_PROGRESS_STEPS.fim.index, "Modal Desconto");
        tracker.stepView(step, { modal_opened: 'discount' });
      }
    } catch(e) { console.error(e) }

    const savedEnd = sessionStorage.getItem('discount_timer_end');
    const now = Date.now();
    
    let targetTime;
    if (savedEnd && parseInt(savedEnd, 10) > now) {
      targetTime = parseInt(savedEnd, 10);
    } else {
      targetTime = now + (300 * 1000);
      sessionStorage.setItem('discount_timer_end', targetTime.toString());
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Initial sync
    setTimeLeft(Math.max(0, Math.floor((targetTime - Date.now()) / 1000)));

    return () => clearInterval(interval);
  }, [open]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modalBox}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.content}>
          <div className={styles.discountBadge}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="30" fill="#EF4444" fillOpacity="0.1"/>
              <path d="M30 45C38.2843 45 45 38.2843 45 30C45 21.7157 38.2843 15 30 15C21.7157 15 15 21.7157 15 30C15 38.2843 21.7157 45 30 45Z" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 24L36 36" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M36 24L24 36" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.badgeText}>10% OFF</span>
          </div>

          <h2 className={styles.headline}>{t('discount_modal.headline')}</h2>
          <p className={styles.subhead}>{t('discount_modal.subhead')}</p>
          
          <div className={styles.timerRow}>
            <span className={styles.timerLabel}>{t('discount_modal.timer_label')}</span>
            <div className={`${styles.timerBadge} ${timeLeft === 0 ? styles.expired : ''}`}>
              {timeLeft > 0 ? (
                <>
                  <span className={styles.clockIcon}>🕒</span>
                  <span className={styles.timeValue}>{formatTime(timeLeft)}</span>
                  <span className={styles.timeUnit}>{t('discount_modal.minutes')}</span>
                </>
              ) : (
                <span className={styles.timeValue}>{t('discount_modal.timer_expired')}</span>
              )}
            </div>
          </div>

          <button 
            className={styles.ctaButton}
            onClick={() => {
              onActivate();
              onClose();
            }}
          >
            {t('discount_modal.cta')}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default DiscountModal;
