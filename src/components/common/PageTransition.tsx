
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { direction } = useTheme();
  
  const variants = {
    initial: {
      opacity: 0,
      x: direction === 'rtl' ? -10 : 10,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      x: direction === 'rtl' ? 10 : -10,
      scale: 0.98
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 1 
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
