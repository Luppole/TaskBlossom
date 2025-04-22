
import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { requestNotificationPermission } from '@/lib/firebase';
import AuthModal from '@/components/auth/AuthModal';
import { Moon, Sun, Bell, BellOff, User, LogOut } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, userSettings, updateSettings, logOut } = useFirebase();
  const { theme, direction, toggleTheme, toggleDirection } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
  
  // Check notification permission
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Handle push notification toggle
  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const result = await requestNotificationPermission();
      if (result) {
        setNotificationPermission('granted');
        updateSettings({ pushNotifications: true });
        toast.success('Push notifications enabled');
      } else {
        toast.error('Could not enable notifications. Please check your browser settings.');
      }
    } else {
      updateSettings({ pushNotifications: false });
    }
  };
  
  // Handle task reminders toggle
  const handleTaskRemindersToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const result = await requestNotificationPermission();
      if (!result) {
        toast.error('Please allow notifications to enable task reminders');
        return;
      }
    }
    
    updateSettings({ taskReminders: enabled });
    toast.success(`Task reminders ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  // Handle overdue alerts toggle
  const handleOverdueAlertsToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const result = await requestNotificationPermission();
      if (!result) {
        toast.error('Please allow notifications to enable overdue alerts');
        return;
      }
    }
    
    updateSettings({ overdueAlerts: enabled });
    toast.success(`Overdue alerts ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  // Handle default view change
  const handleDefaultViewChange = (view: 'today' | 'calendar' | 'tasks') => {
    updateSettings({ defaultView: view });
    toast.success(`Default view set to ${view}`);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };
  
  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize TaskBlossom to match your workflow
        </p>
      </header>
      
      <div className="space-y-6">
        {/* Appearance */}
        <motion.section 
          className="bg-card rounded-lg border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-heading font-semibold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <Label htmlFor="theme-mode">Dark Mode</Label>
              </div>
              <Switch 
                id="theme-mode" 
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <div>
              <Label className="block mb-2">Default View</Label>
              <RadioGroup 
                defaultValue={userSettings?.defaultView || 'today'}
                onValueChange={(value) => handleDefaultViewChange(value as 'today' | 'calendar' | 'tasks')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today">Today</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calendar" id="calendar" />
                  <Label htmlFor="calendar">Calendar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tasks" id="tasks" />
                  <Label htmlFor="tasks">All Tasks</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="rtl-mode">RTL Layout</Label>
                {direction === 'rtl' && <Badge variant="outline">RTL</Badge>}
              </div>
              <Switch 
                id="rtl-mode" 
                checked={direction === 'rtl'}
                onCheckedChange={toggleDirection}
              />
            </div>
          </div>
        </motion.section>
        
        {/* Notifications */}
        <motion.section 
          className="bg-card rounded-lg border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-heading font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {userSettings?.pushNotifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <Label htmlFor="push-notifications">Push Notifications</Label>
              </div>
              <Switch 
                id="push-notifications" 
                checked={userSettings?.pushNotifications || false}
                onCheckedChange={handlePushNotificationToggle}
                disabled={!user}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-notifications">Task Reminders</Label>
              <Switch 
                id="reminder-notifications" 
                checked={userSettings?.taskReminders || false}
                onCheckedChange={handleTaskRemindersToggle}
                disabled={!user}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="overdue-notifications">Overdue Alerts</Label>
              <Switch 
                id="overdue-notifications" 
                checked={userSettings?.overdueAlerts || false}
                onCheckedChange={handleOverdueAlertsToggle}
                disabled={!user}
              />
            </div>
            
            {!user && (
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to enable notifications
              </p>
            )}
          </div>
        </motion.section>
        
        {/* Account */}
        <motion.section 
          className="bg-card rounded-lg border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-xl font-heading font-semibold mb-4">Account</h2>
          
          <div className="space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{user.displayName || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground">
                  You're currently using TaskBlossom as a guest. Sign in to sync your tasks across devices.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="default"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.section>
        
        {/* About */}
        <motion.section 
          className="bg-card rounded-lg border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h2 className="text-xl font-heading font-semibold mb-4">About TaskBlossom</h2>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">Version 1.0.0</p>
            <p className="text-muted-foreground">
              TaskBlossom is a beautiful and intuitive task management application
              designed to help you stay organized and productive.
            </p>
          </div>
        </motion.section>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </motion.div>
  );
};

export default Settings;
