
import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <motion.button 
      onClick={onClick} 
      className={cn(
        "fixed bottom-28 right-6 md:bottom-10 md:right-10 h-14 w-14 rounded-full",
        "bg-primary text-primary-foreground shadow-lg z-40",
        "flex items-center justify-center",
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add Task</span>
      
      <motion.div 
        className="absolute inset-0 rounded-full bg-primary"
        animate={{ 
          scale: [1, 1.1, 1],
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
    </motion.button>
  );
};

export default AddTaskButton;
