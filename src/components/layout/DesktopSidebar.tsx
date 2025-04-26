
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { CalendarDays, FolderKanban, CheckCircle, Settings, LayoutDashboard, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/contexts/FirebaseContext';

const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useFirebase();
  
  const menuItems = [
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
      title: 'Categories',
      path: '/categories',
      icon: FolderKanban,
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
  const filteredMenuItems = menuItems.filter(item => !item.requiresAuth || user);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-heading font-semibold text-lg">TaskBlossom</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className={cn(
                "flex items-center gap-3",
                location.pathname === item.path && "bg-accent text-primary font-medium"
              )}>
                <Link to={item.path}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="bg-accent rounded-lg p-3 text-sm">
          <p className="font-medium mb-1">Pro Tip</p>
          <p className="text-muted-foreground">
            Use <span className="font-medium">Tab+N</span> to quickly add a new task.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DesktopSidebar;
