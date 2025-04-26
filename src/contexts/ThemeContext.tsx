
import { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from './SupabaseContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  direction: 'ltr' | 'rtl';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleDirection: () => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabase();
  const [theme, setTheme] = useState<Theme>('system');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedDirection = localStorage.getItem('direction') as 'ltr' | 'rtl';
    if (savedDirection) {
      setDirection(savedDirection);
      document.documentElement.dir = savedDirection;
    }
  }, []);

  const value = {
    theme,
    direction,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    },
    toggleTheme: () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    },
    toggleDirection: () => {
      const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
      setDirection(newDirection);
      localStorage.setItem('direction', newDirection);
      document.documentElement.dir = newDirection;
      document.documentElement.lang = newDirection === 'rtl' ? 'he' : 'en';
    },
    setDirection: (newDirection: 'ltr' | 'rtl') => {
      setDirection(newDirection);
      localStorage.setItem('direction', newDirection);
      document.documentElement.dir = newDirection;
      document.documentElement.lang = newDirection === 'rtl' ? 'he' : 'en';
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
