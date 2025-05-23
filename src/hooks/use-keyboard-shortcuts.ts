
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook to handle keyboard shortcuts in the application
 */
export function useKeyboardShortcuts(actions: { 
  onNewTask?: () => void;
  [key: string]: (() => void) | undefined;
}) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Alt+N for new task
    if ((event.key === 'n' && event.altKey) || (event.key === 'n' && event.getModifierState('Tab'))) {
      event.preventDefault();
      if (actions.onNewTask) {
        actions.onNewTask();
        toast.success('Keyboard shortcut triggered: ' + (event.altKey ? 'Alt+N' : 'Tab+N'));
      }
    }
  }, [actions]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
