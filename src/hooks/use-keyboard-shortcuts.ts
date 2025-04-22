
import { useEffect } from 'react';

/**
 * Hook to handle keyboard shortcuts in the application
 */
export function useKeyboardShortcuts(actions: { 
  onNewTask?: () => void;
  [key: string]: (() => void) | undefined;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab+N for new task
      if (event.key === 'n' && event.altKey) {
        event.preventDefault();
        actions.onNewTask?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);
}
