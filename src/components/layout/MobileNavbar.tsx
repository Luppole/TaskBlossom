
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, CheckSquare, Settings, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MobileNavbar = () => {
  const { t } = useTranslation();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full transition-all",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
            "hover:scale-110 active:scale-95"
          )}
          end
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.home')}</span>
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full transition-all",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
            "hover:scale-110 active:scale-95"
          )}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.calendar')}</span>
        </NavLink>
        
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full transition-all",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
            "hover:scale-110 active:scale-95"
          )}
        >
          <CheckSquare className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.tasks')}</span>
        </NavLink>
        
        <NavLink 
          to="/social" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full transition-all",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
            "hover:scale-110 active:scale-95"
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.social')}</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full h-full transition-all",
            isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
            "hover:scale-110 active:scale-95"
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.settings')}</span>
        </NavLink>
      </div>
    </motion.nav>
  );
};

export default MobileNavbar;
