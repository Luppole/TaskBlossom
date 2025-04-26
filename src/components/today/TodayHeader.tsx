
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Focus } from 'lucide-react';

interface TodayHeaderProps {
  greeting: string;
  quote: string;
  isFirstVisit: boolean;
  onStartFocusMode: () => void;
}

const TodayHeader: React.FC<TodayHeaderProps> = ({
  greeting,
  quote,
  isFirstVisit,
  onStartFocusMode
}) => {
  return (
    <>
      <motion.header 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-2xl font-bold mb-2">
          {greeting}
        </h1>
        <p className="text-muted-foreground italic">
          "{quote}"
        </p>
        
        {isFirstVisit && (
          <motion.div 
            className="mt-4 p-4 bg-accent rounded-lg border border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 1 }}
          >
            <p className="font-medium">Welcome to TaskBlossom! 🌸</p>
            <p className="text-sm mt-1">Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+N</kbd> anytime to add a new task.</p>
          </motion.div>
        )}
      </motion.header>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={onStartFocusMode}
          className="w-full mb-6 py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
        >
          <Focus className="mr-2 h-5 w-5" /> 
          Start Focus Mode
        </Button>
      </motion.div>
    </>
  );
};

export default TodayHeader;
