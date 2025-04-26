import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { Moon, Bell, Shield } from 'lucide-react';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { userSettings, updateSettings, user } = useFirebase();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (userSettings?.rtlLayout) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [userSettings?.rtlLayout]);

  const handleToggle = async (setting: string, value: boolean) => {
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

  if (!user || !userSettings) {
    return null;
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
            {t('settings.notifications')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex items-center space-x-2">
              <span>{t('settings.pushNotifications')}</span>
            </Label>
            <Switch
              id="push-notifications"
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
