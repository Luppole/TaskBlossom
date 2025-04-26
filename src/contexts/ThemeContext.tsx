
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from './FirebaseContext';

interface ThemeContextType {
  theme: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  toggleTheme: () => void;
  toggleDirection: () => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default values first
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });
  
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(() => {
    // Check local storage first
    const savedDirection = localStorage.getItem('direction');
    return savedDirection === 'rtl' ? 'rtl' : 'ltr';
  });
  
  // Apply initial theme and direction from local storage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (direction === 'rtl') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'he';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, []);
  
  // Get user settings after initial render
  const { userSettings } = useFirebase();
  
  // Update theme and direction when user settings change
  useEffect(() => {
    if (userSettings) {
      if (userSettings.darkMode) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
      
      if (userSettings.rtlLayout) {
        setDirection('rtl');
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'he';
      } else {
        setDirection('ltr');
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
    }
  }, [userSettings]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirectionWithSideEffects(newDirection);
  };
  
  const setDirectionWithSideEffects = (newDirection: 'ltr' | 'rtl') => {
    setDirection(newDirection);
    localStorage.setItem('direction', newDirection);
    
    if (newDirection === 'rtl') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'he';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        direction, 
        toggleTheme, 
        toggleDirection,
        setDirection: setDirectionWithSideEffects 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
