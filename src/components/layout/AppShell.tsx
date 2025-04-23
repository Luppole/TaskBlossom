
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ModeToggle } from '@/components/common/ModeToggle';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Link, NavLink } from 'react-router-dom';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <aside className="min-w-[56px] md:min-w-[220px] ml-2 md:ml-6">
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
  const { theme, toggleTheme, direction, setDirection } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-screen p-4">
      <Link to="/" className="font-bold text-xl mb-4">
        TaskBlossom 🌸
      </Link>

      <NavigationMenu>
        <NavigationMenuList className="flex flex-col space-y-1">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md hover:bg-secondary ${isActive ? 'bg-secondary text-secondary-foreground' : ''}`
                }
              >
                Today
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md hover:bg-secondary ${isActive ? 'bg-secondary text-secondary-foreground' : ''}`
                }
              >
                Calendar
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md hover:bg-secondary ${isActive ? 'bg-secondary text-secondary-foreground' : ''}`
                }
              >
                Tasks
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md hover:bg-secondary ${isActive ? 'bg-secondary text-secondary-foreground' : ''}`
                }
              >
                Categories
              </NavLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-2">
          <ModeToggle />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full justify-start pl-4">
              <Avatar className="mr-2 h-6 w-6">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
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
