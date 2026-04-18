import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InsightFeed = ({ insights, currentProgress }) => {
  // Mostra um insight específico baseado no quadrante do progresso
  // 0-25%, 25-50%, 50-75%, 75-100%
  const index = Math.min(Math.floor(currentProgress / 25), insights.length - 1);
  const currentInsight = insights[index];

  return (
    <div className="w-full max-w-sm mt-4 relative" style={{ minHeight: '60px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center text-center px-4"
        >
          <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl w-full">
            <span className="text-white/80 text-sm md:text-base font-light leading-snug">
              {currentInsight}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InsightFeed;
