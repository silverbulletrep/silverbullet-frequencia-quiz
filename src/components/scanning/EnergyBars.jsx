import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnergyBars = ({ bars, progress }) => {
  return (
    <div className="w-full max-w-sm flex flex-col gap-5 mt-6 px-4">
      {Object.entries(bars).map(([key, config]) => {
        // Cada barra tem seu próprio target definido no config
        const targetValue = config.target || 80;
        const currentBarProgress = Math.min((progress / 100) * targetValue, targetValue);
        
        // Lógica de Alerta (96% do seu próprio target)
        const isNearTarget = currentBarProgress >= (targetValue * 0.96);
        const showAlert = config.isBlockage && isNearTarget;
        
        // Cor dinâmica: Verde para sucesso ao atingir o topo, ou a cor original
        const barColor = (config.isSuccess && isNearTarget) ? '#2ECC71' : config.color;

        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium">
                  {config.label}
                </span>
                <AnimatePresence>
                  {showAlert && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-red-500 text-xs"
                    >
                      ⚠️
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className={`text-xs font-mono transition-colors duration-500 ${isNearTarget && config.isSuccess ? 'text-[#2ECC71]' : 'text-[#D4AF37]/80'}`}>
                {Math.round(currentBarProgress)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentBarProgress}%` }}
                transition={{ duration: 0.2, ease: "linear" }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: barColor,
                  boxShadow: `0 0 15px ${barColor}66`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnergyBars;
