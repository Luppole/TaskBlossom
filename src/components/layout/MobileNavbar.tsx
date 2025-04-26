
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Settings, Users, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileNavbar = () => {
  const { t } = useTranslation();
  const direction = document.documentElement.dir;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/" 
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
          end
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.home')}</span>
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.calendar')}</span>
        </NavLink>
        
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <CheckSquare className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.tasks')}</span>
        </NavLink>
        
        <NavLink 
          to="/social" 
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.social')}</span>
        </NavLink>
        
        <NavLink 
          to="/fitness" 
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <Dumbbell className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.fitness')}</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">{t('navigation.settings')}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNavbar;
