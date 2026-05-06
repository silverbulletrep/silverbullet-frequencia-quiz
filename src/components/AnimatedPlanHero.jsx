import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Zap, Brain } from 'lucide-react';
import { asset } from '@/lib/asset';
import styles from './AnimatedPlanHero.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, y: 0, scale: 1, 
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  }
};

const AnimatedPlanHero = () => {
  const { t } = useTranslation();

  return (
    <motion.div 
      className={styles.heroWrapper}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className={styles.cardsRow}>
        {/* Card: NOW */}
        <motion.div variants={itemVariants} className={styles.glassCard}>
          <div className={styles.glowAccentRed} />
          
          <div className={styles.imageContainer}>
             <img src={asset('/.figma/image/mg8cb0h8-zlckb2j.png')} alt="Now" className={styles.statusImage} />
          </div>

          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('inner_peace_plan.now', 'Agora')}</span>
          </div>
          
          <div className={styles.statsContainer}>
            <div className={styles.statRow}>
              <div className={styles.statLabel}>
                <Brain size={16} />
                <span>{t('inner_peace_plan.tension_level', 'Nível de tensão')}</span>
              </div>
              <div className={`${styles.statValue} ${styles.danger}`}>
                <span>{t('inner_peace_plan.high', 'Alto')}</span>
                <ArrowUp size={16} />
              </div>
            </div>
            
            <div className={styles.progressTrack}>
              <motion.div 
                className={styles.progressFillRed} 
                initial={{ width: 0 }} 
                animate={{ width: '85%' }} 
                transition={{ delay: 0.5, duration: 1 }}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.statRow}>
              <div className={styles.statLabel}>
                <Zap size={16} />
                <span>{t('inner_peace_plan.energy_level', 'Nível de energia')}</span>
              </div>
              <div className={`${styles.statValue} ${styles.danger}`}>
                <span>{t('inner_peace_plan.weak', 'Fraco')}</span>
                <ArrowDown size={16} />
              </div>
            </div>
            
            <div className={styles.progressTrack}>
              <motion.div 
                className={styles.progressFillRed} 
                initial={{ width: 0 }} 
                animate={{ width: '25%' }} 
                transition={{ delay: 0.6, duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card: GOAL */}
        <motion.div variants={itemVariants} className={`${styles.glassCard} ${styles.goalCard}`}>
          <div className={styles.glowAccentGreen} />
          
          <div className={styles.imageContainer}>
             <img src={asset('/.figma/image/mg8cb0h8-yxpyjc0.png')} alt="Goal" className={styles.statusImage} />
          </div>

          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>{t('inner_peace_plan.your_goal', 'Seu objetivo')}</span>
          </div>
          
          <div className={styles.statsContainer}>
            <div className={styles.statRow}>
              <div className={styles.statLabel}>
                <Brain size={16} />
                <span>{t('inner_peace_plan.tension_level', 'Nível de tensão')}</span>
              </div>
              <div className={`${styles.statValue} ${styles.success}`}>
                <span>{t('inner_peace_plan.low', 'Baixo')}</span>
                <ArrowDown size={16} />
              </div>
            </div>
            
            <div className={styles.progressTrack}>
              <motion.div 
                className={styles.progressFillGreen} 
                initial={{ width: 0 }} 
                animate={{ width: '15%' }} 
                transition={{ delay: 0.9, duration: 1 }}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.statRow}>
              <div className={styles.statLabel}>
                <Zap size={16} />
                <span>{t('inner_peace_plan.energy_level', 'Nível de energia')}</span>
              </div>
              <div className={`${styles.statValue} ${styles.success}`}>
                <span>{t('inner_peace_plan.strong', 'Forte')}</span>
                <ArrowUp size={16} />
              </div>
            </div>
            
            <div className={styles.progressTrack}>
              <motion.div 
                className={styles.progressFillGreen} 
                initial={{ width: 0 }} 
                animate={{ width: '90%' }} 
                transition={{ delay: 1.0, duration: 1 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnimatedPlanHero;