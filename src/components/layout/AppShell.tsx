
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from '@/components/common/ModeToggle';
import { Link, NavLink } from 'react-router-dom';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, User, Dumbbell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <aside className="min-w-[60px] md:min-w-[220px] ml-6 md:ml-12">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="p-0 mt-4 md:hidden">
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
        <div className="hidden md:block mt-4">
          <Sidebar />
        </div>
      </aside>
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
};

const Sidebar = () => {
  const { user, logOut } = useFirebase();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-[90vh] pt-6 pr-4 pl-3 bg-background rounded-xl shadow-lg min-w-[192px]">
      <div className="mb-9 flex items-center justify-start px-3">
        <Link
          to="/"
          className="font-bold text-2xl tracking-tight text-primary flex items-center gap-1"
        >
          TaskBlossom <span role="img" aria-label="flower">🌸</span>
        </Link>
      </div>

      {/* User Profile Section - Moved to top */}
      <div className="px-3 mb-6">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-2 px-3 hover:bg-accent/50 transition-colors"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {user?.displayName || 'Profile'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{user.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={logOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Sign in to access your profile and settings.</p>
                <Link to="/settings">
                  <Button variant="default" size="sm" className="w-full">
                    Sign In / Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent/50 ${
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              }`
            }
          >
            <span className="text-lg">📅</span>
            <span className="text-sm">Today</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent/50 ${
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              }`
            }
          >
            <span className="text-lg">🗓️</span>
            <span className="text-sm">Calendar</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent/50 ${
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              }`
            }
          >
            <span className="text-lg">✅</span>
            <span className="text-sm">Tasks</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent/50 ${
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              }`
            }
          >
            <span className="text-lg">🏷️</span>
            <span className="text-sm">Categories</span>
          </NavLink>
          
          <NavLink
            to="/fitness"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent/50 ${
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
              }`
            }
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-sm">Fitness</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto p-3 border-t">
        <ModeToggle />
      </div>
    </div>
  );
};

export default AppShell;
