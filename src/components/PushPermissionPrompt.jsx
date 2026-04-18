import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PushPermissionPrompt.module.scss';
import { Bell, ArrowUp } from 'lucide-react';

const PushPermissionPrompt = ({ isVisible, onAccept, onDecline }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Seta animada apontando para o topo */}
                    <motion.div
                        className={styles.arrowContainer}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{
                            y: [20, 0, 20],
                            opacity: 1
                        }}
                        transition={{
                            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 0.5 }
                        }}
                    >
                        <ArrowUp size={48} className={styles.arrowIcon} />
                        <span className={styles.allowText}>Clique em "Permitir" acima</span>
                    </motion.div>

                    <motion.div
                        className={styles.glassCard}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className={styles.iconWrapper}>
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                                <Bell size={32} className={styles.bellIcon} />
                            </motion.div>
                        </div>

                        <h2 className={styles.title}>Seu exame já começou...</h2>
                        <p className={styles.description}>
                            Podemos avisar quando o seu resultado personalizado estiver pronto?
                        </p>

                        <div className={styles.buttonGroup}>
                            <button className={styles.primaryButton} onClick={onAccept}>
                                Sim, me avise
                            </button>
                            <button className={styles.secondaryButton} onClick={onDecline}>
                                Agora não
                            </button>
                        </div>

                        <p className={styles.footer}>Você pode desativar isso a qualquer momento.</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PushPermissionPrompt;
