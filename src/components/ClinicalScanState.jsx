import React from 'react';
import { motion } from 'framer-motion';

export const ClinicalScanState = ({ activeMessage, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Scanning Ring */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        {/* Fundo do Anel */}
        <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
        
        {/* Anel de Progresso */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(212, 175, 55, 0.3)"
            strokeWidth="4"
            strokeDasharray="301.59"
            strokeDashoffset={301.59 - (progress / 100) * 301.59}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Efeito Radar */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 rounded-full"
           style={{
             background: 'conic-gradient(from 0deg, transparent 0%, rgba(212, 175, 55, 0.15) 80%, rgba(212, 175, 55, 0.8) 100%)',
             WebkitMaskImage: 'radial-gradient(transparent 50%, black 51%)',
             maskImage: 'radial-gradient(transparent 50%, black 51%)'
           }}
        />
        
        {/* Pulso Central */}
        <motion.div 
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-12 bg-[#D4AF37]/20 rounded-full blur-md absolute"
        />
        <div className="text-2xl opacity-80">✨</div>
      </div>

      {/* Status de Escaneamento Animado */}
      <div className="text-center w-full max-w-xs h-16 relative flex items-center justify-center">
         <motion.p
           key={activeMessage}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.5 }}
           className="text-white/80 font-light tracking-wide text-lg text-center absolute w-full"
         >
           {activeMessage}
         </motion.p>
      </div>
      
      {/* Progresso Numérico Sutil */}
      <div className="mt-4 text-[#D4AF37]/60 text-sm font-mono tracking-widest">
        [ {Math.round(progress)}% ]
      </div>
    </div>
  );
};
