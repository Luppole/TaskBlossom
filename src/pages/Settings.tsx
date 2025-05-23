import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabase } from '@/contexts/SupabaseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Bell, Shield, Lock, Info, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { DEFAULT_USER_SETTINGS } from '@/types/settings';

const Settings = () => {
  const { user, getUserProfile, updateUserSettings } = useSupabase();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [userSettings, setUserSettings] = React.useState(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const loadUserSettings = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile(user.id);
        if (profile) {
          // If settings exist in profile, use them, otherwise use defaults
          setUserSettings({
            ...DEFAULT_USER_SETTINGS,
            ...(profile.settings || {})
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserSettings();
  }, [user, navigate, getUserProfile]);

  // Sync theme state with user settings when userSettings loads
  useEffect(() => {
    if (userSettings?.darkMode) {
      setTheme('dark');
    } else if (userSettings?.darkMode === false) {
      setTheme('light');
    }
  }, [userSettings?.darkMode, setTheme]);

  // Sync RTL setting with document
  useEffect(() => {
    if (userSettings?.rtlLayout !== undefined) {
      document.documentElement.dir = userSettings.rtlLayout ? 'rtl' : 'ltr';
    }
  }, [userSettings?.rtlLayout]);

  const handleToggle = async (setting: keyof typeof userSettings, value: boolean) => {
    try {
      // Update local state first for immediate UI feedback
      setUserSettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      // Special handling for dark mode to sync with ThemeContext
      if (setting === 'darkMode') {
        setTheme(value ? 'dark' : 'light');
      }
      
      await updateUserSettings({ [setting]: value });
      
      toast.success(
        `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${value ? 'enabled' : 'disabled'}`, 
        {
          icon: value ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Info className="h-4 w-4" />,
          duration: 2000
        }
      );
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update setting');
      
      // Revert UI state on error
      setUserSettings(prev => ({
        ...prev,
        [setting]: !value
      }));
    }
  };

  const handleSelectChange = async (setting: string, value: string) => {
    try {
      // Update local state first
      setUserSettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      await updateUserSettings({ [setting]: value });
      toast.success(`Default view updated!`);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update setting');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear" 
          }}
        >
          <SettingsIcon className="h-10 w-10 text-primary/60" />
        </motion.div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  const settingVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1 + 0.2,
        duration: 0.3
      }
    })
  };

  const switchVariants = {
    on: {
      backgroundColor: 'hsl(var(--primary))'
    },
    off: {
      backgroundColor: 'hsl(var(--input))'
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto py-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Settings
        </h1>
      </motion.div>

      <AnimatePresence>
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          layoutId="appearance-card"
        >
          <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Moon className="h-5 w-5 text-primary" />
                </motion.div>
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize how TaskBlossom looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <motion.div 
                custom={0}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="dark-mode" className="flex items-center space-x-2 cursor-pointer">
                  <span>Dark Mode</span>
                </Label>
                <Switch
                  id="dark-mode"
                  checked={userSettings?.darkMode || false}
                  onCheckedChange={(checked) => handleToggle('darkMode', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>

              <Separator />

              <motion.div 
                custom={1}
                variants={settingVariants}
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="language-select">Language</Label>
                <LanguageSwitcher />
              </motion.div>

              <Separator />

              <motion.div 
                custom={2}
                variants={settingVariants}
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={userSettings?.defaultView || 'today'}
                  onValueChange={(value) => handleSelectChange('defaultView', value as 'today' | 'calendar' | 'tasks')}
                >
                  <SelectTrigger id="default-view" className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Choose default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          layoutId="notifications-card"
          className="mt-6"
        >
          <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                >
                  <Bell className="h-5 w-5 text-primary" />
                </motion.div>
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <motion.div 
                custom={0}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="push-notifications" className="flex items-center space-x-2 cursor-pointer">
                  <span>Push Notifications</span>
                </Label>
                <Switch
                  id="push-notifications"
                  checked={userSettings?.pushNotifications || false}
                  onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>

              <Separator />

              <motion.div 
                custom={1}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="task-reminders" className="flex items-center space-x-2 cursor-pointer">
                  <span>Task Reminders</span>
                </Label>
                <Switch
                  id="task-reminders"
                  checked={userSettings?.taskReminders || false}
                  onCheckedChange={(checked) => handleToggle('taskReminders', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>

              <Separator />

              <motion.div 
                custom={2}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="overdue-alerts" className="flex items-center space-x-2 cursor-pointer">
                  <span>Overdue Alerts</span>
                </Label>
                <Switch
                  id="overdue-alerts"
                  checked={userSettings?.overdueAlerts || false}
                  onCheckedChange={(checked) => handleToggle('overdueAlerts', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          layoutId="privacy-card"
          className="mt-6"
        >
          <Card className="overflow-hidden border transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Shield className="h-5 w-5 text-primary" />
                </motion.div>
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>
                Control what information you share with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <motion.div 
                custom={0}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="public-profile" className="flex items-center space-x-2 cursor-pointer">
                  <span>Public Profile</span>
                </Label>
                <Switch
                  id="public-profile"
                  checked={userSettings?.publicProfile || false}
                  onCheckedChange={(checked) => handleToggle('publicProfile', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>

              <Separator />

              <motion.div 
                custom={1}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="share-progress" className="flex items-center space-x-2 cursor-pointer">
                  <span>Share Progress</span>
                </Label>
                <Switch
                  id="share-progress"
                  checked={userSettings?.shareProgress || false}
                  onCheckedChange={(checked) => handleToggle('shareProgress', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>

              <Separator />

              <motion.div 
                custom={2}
                variants={settingVariants}
                className="flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <Label htmlFor="share-fitness" className="flex items-center space-x-2 cursor-pointer">
                  <span>Share Fitness Data</span>
                </Label>
                <Switch
                  id="share-fitness"
                  checked={userSettings?.shareFitness || false}
                  onCheckedChange={(checked) => handleToggle('shareFitness', checked)}
                  className="transition-all data-[state=checked]:bg-primary"
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
