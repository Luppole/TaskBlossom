
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, CheckSquare, Settings, Home, List, Dumbbell, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const MobileNavbar = () => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Today' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/tasks', icon: List, label: 'Tasks' },
    { path: '/categories', icon: CheckSquare, label: 'Categories' },
    { path: '/fitness', icon: Dumbbell, label: 'Fitness' },
    { path: '/social', icon: Users, label: 'Social' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 px-1 py-2 flex justify-around shadow-md"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center p-1 rounded-md transition-colors relative',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-1">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator-mobile"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </motion.nav>
  );
};

export default MobileNavbar;
