import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProcessingSteps = ({ steps, currentStep }) => {
  return (
    <div className="w-full flex flex-col items-center gap-4 min-h-[40px]">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-white/90 text-lg md:text-xl font-light tracking-wide text-center"
        >
          {steps[currentStep]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default ProcessingSteps;
