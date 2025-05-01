
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'slide' | 'fade' | 'scale' | 'rotate';
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  transitionType = 'slide'
}) => {
  // Get direction from document instead of context to avoid dependency cycles
  const direction = document.documentElement.dir || 'ltr';
  
  // Different transition variants
  const variants = {
    slide: {
      initial: {
        opacity: 0,
        x: direction === 'rtl' ? -20 : 20,
      },
      animate: {
        opacity: 1,
        x: 0,
      },
      exit: {
        opacity: 0,
        x: direction === 'rtl' ? 20 : -20,
      }
    },
    fade: {
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
      }
    },
    scale: {
      initial: {
        opacity: 0,
        scale: 0.95,
      },
      animate: {
        opacity: 1,
        scale: 1,
      },
      exit: {
        opacity: 0,
        scale: 0.95,
      }
    },
    rotate: {
      initial: {
        opacity: 0,
        rotateY: direction === 'rtl' ? 10 : -10,
        scale: 0.95,
      },
      animate: {
        opacity: 1,
        rotateY: 0,
        scale: 1,
      },
      exit: {
        opacity: 0,
        rotateY: direction === 'rtl' ? -10 : 10,
        scale: 0.95,
      }
    }
  };

  const selectedVariant = variants[transitionType];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`page-transition-${transitionType}`}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={selectedVariant}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 1 
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
