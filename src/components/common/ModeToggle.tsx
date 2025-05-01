
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function ModeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggleTheme = () => {
    toggleTheme();
    
    toast.success(
      theme === 'dark' 
        ? 'Light mode activated!' 
        : 'Dark mode activated!', 
      { duration: 1500 }
    );
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="transition-colors hover:bg-primary/10"
    >
      {theme === 'dark' ? (
        <motion.div
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 30, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sun className="h-5 w-5 text-yellow-400" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ rotate: 30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -30, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Moon className="h-5 w-5 text-primary" />
        </motion.div>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
