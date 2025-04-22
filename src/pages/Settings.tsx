
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';

const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize TaskBlossom to match your workflow
        </p>
      </header>
      
      <div className="space-y-6">
        {/* Appearance */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode">Dark Mode</Label>
              <Switch id="theme-mode" />
            </div>
            
            <div>
              <Label className="block mb-2">Default View</Label>
              <RadioGroup defaultValue="today">
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
          </div>
        </section>
        
        {/* Notifications */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch id="push-notifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder-notifications">Task Reminders</Label>
              <Switch id="reminder-notifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="overdue-notifications">Overdue Alerts</Label>
              <Switch id="overdue-notifications" />
            </div>
          </div>
        </section>
        
        {/* Account */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Account</h2>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You're currently using TaskBlossom as a guest. Sign in to sync your tasks across devices.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="default">Sign In</Button>
              <Button variant="outline">Create Account</Button>
            </div>
          </div>
        </section>
        
        {/* About */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">About TaskBlossom</h2>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">Version 1.0.0</p>
            <p className="text-muted-foreground">
              TaskBlossom is a beautiful and intuitive task management application
              designed to help you stay organized and productive.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
