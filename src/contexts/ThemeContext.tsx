
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSupabase } from './SupabaseContext';
import { toast } from 'sonner';

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
  const { user, updateUserProfile, getUserProfile } = useSupabase();
  const [theme, setThemeState] = useState<Theme>('system');
  const [direction, setDirectionState] = useState<'ltr' | 'rtl'>('ltr');
  const [isInitialized, setIsInitialized] = useState(false);
  const updatePending = useRef(false);

  // Helper function to apply theme to document
  const applyTheme = useCallback((selectedTheme: Theme) => {
    const isDark = selectedTheme === 'dark' || 
      (selectedTheme === 'system' && 
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Load theme and direction from user profile or localStorage
  useEffect(() => {
    const initializeTheme = async () => {
      let savedTheme = localStorage.getItem('theme') as Theme;
      let savedDirection = localStorage.getItem('direction') as 'ltr' | 'rtl';

      // If user is logged in, try to get theme from user profile
      if (user && getUserProfile) {
        try {
          const profile = await getUserProfile();
          if (profile) {
            savedTheme = profile.theme || savedTheme || 'system';
            savedDirection = profile.direction || savedDirection || 'ltr';
          }
        } catch (error) {
          console.error('Error loading user theme preferences:', error);
        }
      }

      // Apply theme to document
      if (savedTheme) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      }

      if (savedDirection) {
        setDirectionState(savedDirection);
        document.documentElement.dir = savedDirection;
        document.documentElement.lang = savedDirection === 'rtl' ? 'he' : 'en';
      }
      
      setIsInitialized(true);
    };

    initializeTheme();
  }, [user, getUserProfile, applyTheme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    if (updatePending.current) return;
    updatePending.current = true;
    
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Persist to user profile if logged in
    if (user && updateUserProfile && isInitialized) {
      try {
        await updateUserProfile({ theme: newTheme });
        console.log('Theme preference saved to user profile');
      } catch (error) {
        console.error('Error saving theme to user profile:', error);
      }
    }
    
    updatePending.current = false;
  }, [user, updateUserProfile, isInitialized, applyTheme]);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);
  
  const setDirection = useCallback(async (newDirection: 'ltr' | 'rtl') => {
    if (updatePending.current) return;
    updatePending.current = true;
    
    setDirectionState(newDirection);
    localStorage.setItem('direction', newDirection);
    document.documentElement.dir = newDirection;
    document.documentElement.lang = newDirection === 'rtl' ? 'he' : 'en';
    
    // Persist to user profile if logged in
    if (user && updateUserProfile && isInitialized) {
      try {
        await updateUserProfile({ direction: newDirection });
        console.log('Direction preference saved to user profile');
      } catch (error) {
        console.error('Error saving direction to user profile:', error);
      }
    }
    
    updatePending.current = false;
  }, [user, updateUserProfile, isInitialized]);
  
  const toggleDirection = useCallback(() => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    toast.success(
      direction === 'ltr' 
        ? 'Switched to right-to-left' 
        : 'Switched to left-to-right', 
      { 
        duration: 1500,
        position: 'top-center'
      }
    );
  }, [direction, setDirection]);

  const value = {
    theme,
    direction,
    setTheme,
    toggleTheme,
    toggleDirection,
    setDirection
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
