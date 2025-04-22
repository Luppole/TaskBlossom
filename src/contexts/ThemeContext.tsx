
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from './FirebaseContext';

type Theme = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  theme: Theme;
  direction: Direction;
  toggleTheme: () => void;
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [direction, setDirection] = useState<Direction>('ltr');
  const { userSettings, updateSettings } = useFirebase();
  
  // Initialize theme from user settings
  useEffect(() => {
    if (userSettings) {
      setTheme(userSettings.darkMode ? 'dark' : 'light');
      setDirection(userSettings.rtlLayout ? 'rtl' : 'ltr');
    }
  }, [userSettings]);
  
  // Apply theme to the document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set RTL direction
    document.dir = direction;
    
  }, [theme, direction]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Update user settings in Firebase if the user is logged in
    if (userSettings) {
      updateSettings({ darkMode: newTheme === 'dark' });
    }
  };
  
  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    // Update user settings in Firebase if the user is logged in
    if (userSettings) {
      updateSettings({ rtlLayout: newDirection === 'rtl' });
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, direction, toggleTheme, toggleDirection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
