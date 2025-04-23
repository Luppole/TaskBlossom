
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from '@/components/common/ModeToggle';
import { Link, NavLink } from 'react-router-dom';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/contexts/ThemeContext';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <aside className="min-w-[56px] md:min-w-[220px] ml-3 md:ml-8"> {/* Increased margin to the left */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md:hidden"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="hidden md:block">
          <Sidebar />
        </div>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

const Sidebar = () => {
  const { user, logOut } = useFirebase();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-screen py-8 pr-4 pl-2 bg-background rounded-lg shadow-md min-w-[190px]"> {/* thicc menu, left margin, nice look */}
      <Link to="/" className="font-bold text-2xl mb-8 pl-2 text-primary">
        TaskBlossom <span role="img" aria-label="flower">🌸</span>
      </Link>
      {/* Menu items */}
      <nav className="flex flex-col gap-1 mb-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 rounded-lg transition-colors hover:bg-secondary font-medium ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <span className="text-lg">📅</span>
          Today
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 rounded-lg transition-colors hover:bg-secondary font-medium ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <span className="text-lg">🗓️</span>
          Calendar
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 rounded-lg transition-colors hover:bg-secondary font-medium ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <span className="text-lg">✅</span>
          Tasks
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 rounded-lg transition-colors hover:bg-secondary font-medium ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
            }`
          }
        >
          <span className="text-lg">🏷️</span>
          Categories
        </NavLink>
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <ModeToggle />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-6 py-3 rounded-lg hover:bg-secondary text-muted-foreground font-medium flex items-center gap-3">
              <User className="h-5 w-5 mr-2 opacity-80" />
              <span>{user ? user.displayName : 'Profile'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            {user ? (
              <div className="flex flex-col space-y-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">{user.displayName}</h4>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-center" onClick={logOut}>
                  Log out
                </Button>
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <p className="text-sm">Sign in to access your profile and settings.</p>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In / Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AppShell;
