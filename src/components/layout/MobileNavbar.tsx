
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  HomeIcon, CalendarDaysIcon, ListTodo, Settings, 
  User, LogIn, UserPlus, Dumbbell, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirebase } from "@/contexts/FirebaseContext";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useToast } from "@/hooks/use-toast"; 

const MobileNavbar = () => {
  const location = useLocation();
  const { user, logOut } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await logOut();
      toast({
        title: "Signed out successfully",
        description: "See you soon!",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      path: "/calendar",
      label: "Calendar",
      icon: <CalendarDaysIcon className="w-5 h-5" />,
    },
    {
      path: "/tasks",
      label: "Tasks",
      icon: <ListTodo className="w-5 h-5" />,
    },
    {
      path: "/fitness",
      label: "Fitness",
      icon: <Dumbbell className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center py-2 px-3 relative",
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {location.pathname === item.path && (
              <motion.div
                layoutId="mobileNavIndicator"
                className="absolute bottom-0 w-12 h-1 bg-primary rounded-t-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center py-2 px-3",
                location.pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {location.pathname === "/settings" && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute bottom-0 w-12 h-1 bg-primary rounded-t-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </DialogTrigger>
          <DialogContent className="w-72 rounded-lg p-0 overflow-hidden">
            <div className="p-4">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.displayName || "User"}</h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link to="/settings">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => setOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Guest</h3>
                      <p className="text-xs text-muted-foreground">
                        Sign in to save your tasks
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link to="/settings">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => setOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Link to="/settings">
                      <Button 
                        className="w-full justify-start bg-primary hover:bg-primary/90" 
                        onClick={() => setOpen(false)}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In / Register
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MobileNavbar;
