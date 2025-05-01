
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { UserSearch, Users, Activity, UserCircle, Lock, LogIn } from 'lucide-react';
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
  
  // Handle URL params for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['friends', 'activity', 'discover'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  
  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url);
  }, [activeTab]);
  
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
          <motion.div 
            className="bg-primary/10 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            <Lock className="h-10 w-10 text-primary" />
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Login Required
          </h1>
          
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Please sign in to access the social features and connect with other users
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/')}
            >
              <UserCircle className="h-4 w-4" />
              Return to Dashboard
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2" 
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  const tabContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Social Hub
          </h1>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <motion.div
            variants={tabContainerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="friends" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <motion.div whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Users className="h-4 w-4" />
                </motion.div>
                <span className="hidden sm:inline">Friends</span>
              </TabsTrigger>
              
              <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <motion.div whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Activity className="h-4 w-4" />
                </motion.div>
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              
              <TabsTrigger value="discover" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <motion.div whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 400 }}>
                  <UserSearch className="h-4 w-4" />
                </motion.div>
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
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
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Social;
