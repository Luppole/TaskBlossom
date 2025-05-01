
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase } from '@/contexts/FirebaseContext';
import { motion } from 'framer-motion';
import { Moon, Bell, Shield } from 'lucide-react';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { userSettings, updateSettings, user } = useFirebase();
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
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  const handleSelectChange = async (setting: string, value: string) => {
    if (userSettings) {
      try {
        await updateSettings({ [setting]: value });
      } catch (error) {
        console.error('Error updating settings:', error);
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
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize how TaskBlossom looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center space-x-2">
              <span>Dark Mode</span>
            </Label>
            <Switch
              id="dark-mode"
              checked={userSettings?.darkMode || false}
              onCheckedChange={(checked) => handleToggle('darkMode', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="language-select">Language</Label>
            <LanguageSwitcher />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="default-view">Default View</Label>
            <Select
              value={userSettings?.defaultView || 'today'}
              onValueChange={(value) => handleSelectChange('defaultView', value as 'today' | 'calendar' | 'tasks')}
            >
              <SelectTrigger id="default-view">
                <SelectValue placeholder="Choose default view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex items-center space-x-2">
              <span>Push Notifications</span>
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
              <span>Task Reminders</span>
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
              <span>Overdue Alerts</span>
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
            <CardTitle>Privacy Settings</CardTitle>
          </div>
          <CardDescription>
            Control what information you share with others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile" className="flex items-center space-x-2">
              <span>Public Profile</span>
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
              <span>Share Progress</span>
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
              <span>Share Fitness Data</span>
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
