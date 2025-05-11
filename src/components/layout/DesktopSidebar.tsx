
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import {
  Calendar,
  Home,
  List,
  Settings,
  User,
  Activity,
  StickyNote,
  Award
} from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const DesktopSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSupabase();
  
  const sidebarItems = [
    {
      label: t('common.home'),
      icon: Home,
      href: '/',
    },
    {
      label: t('common.today'),
      icon: Calendar,
      href: '/today',
    },
    {
      label: t('common.tasks'),
      icon: List,
      href: '/tasks',
    },
    {
      label: t('common.activity'),
      icon: Activity,
      href: '/activity',
    },
    {
      label: t('common.stickyNotes'),
      icon: StickyNote,
      href: '/sticky-notes',
    },
    {
      label: t('common.achievements'),
      icon: Award,
      href: '/achievements',
    },
    {
      label: t('common.profile'),
      icon: User,
      href: `/profile/${user?.id}`,
    },
    {
      label: t('common.settings'),
      icon: Settings,
      href: '/settings',
    },
  ];
  
  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-secondary h-full">
      <div className="px-4 py-6">
        <h2 className="font-bold text-2xl">{t('common.appName')}</h2>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.label} className="mb-1">
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${isActive
                    ? 'bg-muted text-foreground'
                    : 'hover:bg-muted hover:text-foreground'}`
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-none px-4 py-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('common.darkMode')}
          </Label>
          <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
