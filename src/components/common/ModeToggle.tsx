
import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export function ModeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(
      theme === 'dark' 
        ? 'Light mode activated' 
        : 'Dark mode activated', 
      { duration: 1500 }
    );
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
