import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const QuantumLoader = ({ progress }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Scanning Ring */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 [@media(max-height:700px)]:w-36 [@media(max-height:700px)]:h-36 flex items-center justify-center mb-4 [@media(max-height:700px)]:mb-2">
        {/* Fundo do Anel com brilho suave */}
        <div className="absolute inset-0 rounded-full border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"></div>
        
        {/* Anel de Progresso Premium */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#F2C94C" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Rastro do progresso */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
          
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="3"
            strokeDasharray="289"
            initial={{ strokeDashoffset: 289 }}
            animate={{ strokeDashoffset: 289 - (progress / 100) * 289 }}
            strokeLinecap="round"
            style={{ filter: 'url(#glow)' }}
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Efeito Radar Orgânico */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="absolute inset-4 rounded-full"
           style={{
             background: 'conic-gradient(from 0deg, transparent 0%, rgba(212, 175, 55, 0.05) 60%, rgba(212, 175, 55, 0.3) 100%)',
             WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)',
             maskImage: 'radial-gradient(transparent 55%, black 56%)'
           }}
        />
        
        {/* Pulsação Central Premium - Corrigido para Centralização Total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Brilho de fundo (Limpado de interferência flex) */}
          <motion.div 
            animate={{ 
              scale: [0.9, 1.2, 0.9],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 bg-[#D4AF37]/20 rounded-full blur-2xl"
          />
          
          {/* Lupa (Posicionada de forma absoluta para garantir centro real) */}
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 flex items-center justify-center"
          >
            <svg 
              width="54" 
              height="54" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16" y2="16" />
              <motion.path
                d="M11 8a3 3 0 0 0-3 3"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Partículas de "Scan" */}
        <motion.div 
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border-2 border-[#D4AF37]/20 rounded-full"
        />
      </div>

      {/* Progresso Numérico Sutil */}
      <div className="mt-2 text-[#D4AF37]/60 text-sm font-mono tracking-[0.3em] font-light">
        {t('processing.loader.analyzing')} {Math.round(progress)}%
      </div>
    </div>
  );
};

export default QuantumLoader;
