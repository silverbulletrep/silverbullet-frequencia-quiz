import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const QuantumParticles = () => {
  // Geramos as posições apenas uma vez para evitar re-renders custosos
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 20 + 20, // 20s a 40s (muito lento)
      delay: Math.random() * -20, // Início aleatório
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            top: particle.top,
            left: particle.left,
            backgroundColor: particle.id % 2 === 0 ? '#4DE0C8' : '#D4AF37', // Ciano ou Dourado
            borderRadius: '50%',
            opacity: particle.opacity,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(QuantumParticles);
