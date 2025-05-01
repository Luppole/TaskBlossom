
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button 
      onClick={onClick} 
      className={cn(
        "fixed bottom-28 right-4 md:bottom-10 md:right-8 h-14 w-14 rounded-full",
        "bg-primary text-primary-foreground shadow-lg z-40",
        "flex items-center justify-center overflow-hidden group",
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label="Add Task"
    >
      <AnimatePresence mode="wait">
        {isHovered ? (
          <motion.span 
            key="button-text"
            className="text-sm font-medium flex items-center"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-5 w-5 mr-1" />
            Add
          </motion.span>
        ) : (
          <motion.div
            key="button-icon"
            initial={{ rotate: 0 }}
            animate={{ rotate: 180 }}
            exit={{ rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="absolute inset-0 rounded-full bg-primary"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{ 
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        }}
        style={{ zIndex: -1 }}
      />

      <motion.div
        className="absolute inset-0 bg-white rounded-full opacity-20"
        initial={{ scale: 0 }}
        animate={{ scale: 1.35, opacity: 0 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 2,
          ease: "easeOut"
        }}
        style={{ zIndex: -2 }}
      />
    </motion.button>
  );
};

export default AddTaskButton;
