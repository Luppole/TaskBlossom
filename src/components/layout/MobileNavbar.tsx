
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, FolderKanban, CheckCircle, Settings, LayoutDashboard, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/contexts/FirebaseContext';

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const { user } = useFirebase();
  
  const navItems = [
    {
      title: 'Today',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: CalendarDays,
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: CheckCircle,
    },
    {
      title: 'Fitness',
      path: '/fitness',
      icon: Dumbbell,
      requiresAuth: true,
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  // Filter out items that require authentication if user is not logged in
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex justify-around items-center h-16">
        {filteredNavItems.map((item) => (
          <Link 
            key={item.title}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full px-1",
              location.pathname === item.path 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              location.pathname === item.path && "animate-pulse-soft"
            )} />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavbar;
