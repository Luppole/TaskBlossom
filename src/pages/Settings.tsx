
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Bell, 
  Shield, 
  Bell as BellIcon, 
  Globe, 
  Palette,
  Eye,
  BarChart,
  Dumbbell,
  UserCog
} from 'lucide-react';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import { toast } from 'sonner';
import { getFirebaseNotificationPermission } from '@/lib/notification-service';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

const MotionSwitch = motion(Switch);

const Settings = () => {
  const { user, userSettings, updateSettings, signIn } = useFirebase();
  const { t } = useTranslation();
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);

  // Apply RTL setting on component mount if user has it enabled
  useEffect(() => {
    if (userSettings?.rtlLayout) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [userSettings?.rtlLayout]);

  // Check notification permission on load
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleToggle = async (setting: string, value: boolean) => {
    if (userSettings) {
      // Special handling for notification settings
      if ((setting === 'pushNotifications' || setting === 'taskReminders' || setting === 'overdueAlerts') && value) {
        // Request permission first if needed
        const permission = await getFirebaseNotificationPermission();
        setNotificationPermission(permission);
        
        if (permission !== 'granted') {
          toast.error(t('settings.notificationsBlocked'), {
            description: t('settings.enableNotificationsInBrowser')
          });
          return;
        }
      }

      try {
        await updateSettings({ [setting]: value });
        toast.success(t('common.save'));
      } catch (error) {
        console.error('Error updating settings:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const handleSelectChange = async (setting: string, value: string) => {
    if (userSettings) {
      try {
        await updateSettings({ [setting]: value });
        toast.success(t('common.save'));
      } catch (error) {
        console.error('Error updating settings:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const requestNotificationPermission = async () => {
    const permission = await getFirebaseNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      toast.success(t('settings.notificationsEnabled'));
    } else {
      toast.error(t('settings.notificationsBlocked'), {
        description: t('settings.enableNotificationsInBrowser')
      });
    }
  };

  // If no user is signed in, show sign-in prompt
  if (!user) {
    return (
      <motion.div
        className="max-w-md mx-auto py-20 space-y-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <UserCog className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('settings.signInNeeded')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('settings.signInDescription')}
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" onClick={() => signIn()} className="px-8">
              Sign In
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto py-8 space-y-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
      </div>

      <Card as={motion.div} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.appearance')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.appearanceDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center space-x-2">
              <Moon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.darkMode')}</span>
            </Label>
            <MotionSwitch
              id="dark-mode"
              checked={userSettings?.darkMode || false}
              onCheckedChange={(checked) => handleToggle('darkMode', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="language-select" className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              {t('settings.language')}
            </Label>
            <LanguageSwitcher />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="default-view" className="flex items-center">
              <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
              {t('settings.defaultView')}
            </Label>
            <Select
              value={userSettings?.defaultView || 'today'}
              onValueChange={(value) => handleSelectChange('defaultView', value as 'today' | 'calendar' | 'tasks')}
            >
              <SelectTrigger id="default-view">
                <SelectValue placeholder={t('settings.defaultView')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('navigation.today')}</SelectItem>
                <SelectItem value="calendar">{t('navigation.calendar')}</SelectItem>
                <SelectItem value="tasks">{t('navigation.tasks')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card as={motion.div} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.notifications')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.notificationsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationPermission !== 'granted' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md mb-4">
              <div className="flex gap-3">
                <BellIcon className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    {t('settings.notificationsPermission')}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    {t('settings.notificationsPermissionDescription')}
                  </p>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-yellow-100 dark:bg-yellow-800/30 border-yellow-300 dark:border-yellow-700"
                      onClick={requestNotificationPermission}
                    >
                      {t('settings.enableNotifications')}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.pushNotifications')}</span>
            </Label>
            <MotionSwitch
              id="push-notifications"
              disabled={notificationPermission !== 'granted'}
              checked={userSettings?.pushNotifications || false}
              onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="task-reminders" className="flex items-center space-x-2">
              <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.taskReminders')}</span>
            </Label>
            <MotionSwitch
              id="task-reminders"
              disabled={notificationPermission !== 'granted'}
              checked={userSettings?.taskReminders || false}
              onCheckedChange={(checked) => handleToggle('taskReminders', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="overdue-alerts" className="flex items-center space-x-2">
              <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.overdueAlerts')}</span>
            </Label>
            <MotionSwitch
              id="overdue-alerts"
              disabled={notificationPermission !== 'granted'}
              checked={userSettings?.overdueAlerts || false}
              onCheckedChange={(checked) => handleToggle('overdueAlerts', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>
        </CardContent>
      </Card>

      <Card as={motion.div} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.privacySettings')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.privacySettingsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile" className="flex items-center space-x-2">
              <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.publicProfile')}</span>
            </Label>
            <MotionSwitch
              id="public-profile"
              checked={userSettings?.publicProfile || false}
              onCheckedChange={(checked) => handleToggle('publicProfile', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="share-progress" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.shareProgress')}</span>
            </Label>
            <MotionSwitch
              id="share-progress"
              checked={userSettings?.shareProgress || false}
              onCheckedChange={(checked) => handleToggle('shareProgress', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="share-fitness" className="flex items-center space-x-2">
              <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{t('settings.shareFitness')}</span>
            </Label>
            <MotionSwitch
              id="share-fitness"
              checked={userSettings?.shareFitness || false}
              onCheckedChange={(checked) => handleToggle('shareFitness', checked)}
              whileTap={{ scale: 0.9 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Settings;
