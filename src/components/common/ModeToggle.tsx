
import React from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function ModeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggleTheme = () => {
    toggleTheme();
    
    toast.success(
      theme === 'dark' 
        ? 'Light mode activated!' 
        : 'Dark mode activated!', 
      { 
        duration: 1500,
        icon: theme === 'dark' ? '☀️' : '🌙'
      }
    );
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="transition-all hover:bg-primary/10 relative overflow-hidden"
        >
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 15,
                duration: 0.3 
              }}
              className="relative"
            >
              <Sun className="h-5 w-5 text-yellow-400" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Sparkles className="h-3 w-3 text-yellow-300" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 30, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -30, opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 15,
                duration: 0.3 
              }}
            >
              <Moon className="h-5 w-5 text-primary" />
              <motion.div
                className="absolute inset-0 bg-primary/5 rounded-full"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </motion.div>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
