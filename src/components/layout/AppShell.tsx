
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFirebase } from '@/contexts/FirebaseContext';
import MobileNavbar from './MobileNavbar';
import DesktopSidebar from './DesktopSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const { user } = useFirebase();

  // Navigate to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DesktopSidebar />
      
      <main className="flex-1">
        {/* Sticky header for mobile */}
        {isMobile && (
          <motion.header 
            className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex justify-between items-center px-4 py-3 shadow-sm"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="font-bold text-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                TaskBlossom
              </motion.div>
            </div>
            <motion.div
              className="flex items-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {user && (
                <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis max-w-[120px]">
                  {user.displayName}
                </span>
              )}
            </motion.div>
          </motion.header>
        )}
        
        <div className="pb-20 sm:pb-0 sm:pl-64">
          {children}
        </div>
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default AppShell;
