
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { Moon, Bell, Shield, Bell as BellIcon } from 'lucide-react';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import { toast } from 'sonner';
import { getFirebaseNotificationPermission } from '@/lib/notification-service';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const { userSettings, updateSettings } = useFirebase();
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
    if (Notification.permission) {
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

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.appearance')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.appearance')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center space-x-2">
              <span>{t('settings.darkMode')}</span>
            </Label>
            <Switch
              id="dark-mode"
              checked={userSettings?.darkMode || false}
              onCheckedChange={(checked) => handleToggle('darkMode', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="language-select">{t('settings.language')}</Label>
            <LanguageSwitcher />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="default-view">{t('settings.defaultView')}</Label>
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

      <Card>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 bg-yellow-100 dark:bg-yellow-800/30 border-yellow-300 dark:border-yellow-700"
                    onClick={requestNotificationPermission}
                  >
                    {t('settings.enableNotifications')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex items-center space-x-2">
              <span>{t('settings.pushNotifications')}</span>
            </Label>
            <Switch
              id="push-notifications"
              disabled={notificationPermission !== 'granted'}
              checked={userSettings?.pushNotifications || false}
              onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="task-reminders" className="flex items-center space-x-2">
              <span>{t('settings.taskReminders')}</span>
            </Label>
            <Switch
              id="task-reminders"
              disabled={notificationPermission !== 'granted'}
              checked={userSettings?.taskReminders || false}
              onCheckedChange={(checked) => handleToggle('taskReminders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="overdue-alerts" className="flex items-center space-x-2">
              <span>{t('settings.overdueAlerts')}</span>
            </Label>
            <Switch
              id="overdue-alerts"
              disabled={notificationPermission !== 'granted'}
              checked={userSettings?.overdueAlerts || false}
              onCheckedChange={(checked) => handleToggle('overdueAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('settings.privacySettings')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.privacySettings')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile" className="flex items-center space-x-2">
              <span>{t('settings.publicProfile')}</span>
            </Label>
            <Switch
              id="public-profile"
              checked={userSettings?.publicProfile || false}
              onCheckedChange={(checked) => handleToggle('publicProfile', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="share-progress" className="flex items-center space-x-2">
              <span>{t('settings.shareProgress')}</span>
            </Label>
            <Switch
              id="share-progress"
              checked={userSettings?.shareProgress || false}
              onCheckedChange={(checked) => handleToggle('shareProgress', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="share-fitness" className="flex items-center space-x-2">
              <span>{t('settings.shareFitness')}</span>
            </Label>
            <Switch
              id="share-fitness"
              checked={userSettings?.shareFitness || false}
              onCheckedChange={(checked) => handleToggle('shareFitness', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Settings;
