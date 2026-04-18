import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TransitionFadeWrapper = ({ children, isDark = true }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, filter: 'blur(10px)', y: 15 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        exit={{ opacity: 0, filter: 'blur(10px)', y: -15 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full min-h-screen ${isDark ? 'bg-[#0B0C10] text-white' : ''}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
