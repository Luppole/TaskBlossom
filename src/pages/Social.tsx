
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { UserSearch as UserSearchIcon, Users, Activity, UserCircle, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/contexts/FirebaseContext';
import FriendRequests from '@/components/social/FriendRequests';
import FriendsList from '@/components/social/FriendsList';
import ActivityFeed from '@/components/social/ActivityFeed';
import UserSearchComponent from '@/components/social/UserSearch';

const Social = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const { user } = useFirebase();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) {
      // We'll show a login prompt instead of redirecting
    }
  }, [user]);
  
  // If not logged in, show a message to login
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t('social.requiresLogin')}
          </h1>
          
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            {t('social.loginDescription')}
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/')}
            >
              <UserCircle className="h-4 w-4" />
              {t('common.returnToDashboard')}
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2" 
              onClick={() => navigate('/settings')}
            >
              <LogIn className="h-4 w-4" />
              {t('auth.signIn')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('social.title')}</h1>
        </div>
        
        <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('social.friends')}</span>
            </TabsTrigger>
            
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">{t('social.activity')}</span>
            </TabsTrigger>
            
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <UserSearchIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('social.discover')}</span>
            </TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="friends" className="mt-0">
              <Card className="p-4">
                <FriendRequests />
                <div className="my-6 border-t border-border"></div>
                <FriendsList />
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-0">
              <ActivityFeed />
            </TabsContent>
            
            <TabsContent value="discover" className="mt-0">
              <UserSearchComponent />
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Social;
