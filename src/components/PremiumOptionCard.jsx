import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PremiumOptionCard = ({ label, emoji, isSelected, onClick, onPointerDown, disabled, className }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      animate={{
        borderColor: isSelected ? 'rgba(242, 201, 76, 0.4)' : 'rgba(255, 255, 255, 0.05)',
        boxShadow: isSelected ? '0 0 30px rgba(242, 201, 76, 0.15)' : 'none',
        backgroundColor: isSelected ? 'rgba(10, 15, 29, 0.9)' : 'rgba(17, 25, 45, 0.4)'
      }}
      className={`relative w-full text-left p-4 rounded-2xl backdrop-blur-xl border transition-all flex items-center gap-4 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className || ''}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      disabled={disabled}
      style={{ minHeight: '86px' }}
    >
       {/* Ícone/Emoji para Processamento Cerebral Rápido */}
       {emoji && (
         <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#f2c94c]/10 rounded-xl border border-[#f2c94c]/20 text-2xl shadow-inner">
           {emoji}
         </div>
       )}

       <span className="flex-grow text-[17px] font-medium tracking-wide text-white/95 leading-snug">
         {label}
       </span>
       
       <AnimatePresence>
         {isSelected && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.5 }}
               className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f2c94c] flex items-center justify-center shadow-[0_0_15px_rgba(242,201,76,0.5)]"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0F1D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </motion.div>
         )}
       </AnimatePresence>
    </motion.button>
  );
};
