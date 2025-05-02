
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSearch, Users, Activity, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

const FriendsSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const { user } = useSupabase();

  if (!user) {
    return <div>Please log in to see your friends</div>;
  }

  return (
    <Card className="border shadow hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Friends Hub
          </CardTitle>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger 
                value="friends" 
                className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                  <Users className="h-4 w-4 mr-2" /> My Friends
                </motion.div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="requests"
                className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                  <UserPlus className="h-4 w-4 mr-2" /> Friend Requests
                </motion.div>
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <TabsContent value="friends" className="mt-0">
            <FriendsList />
          </TabsContent>
          
          <TabsContent value="requests" className="mt-0">
            <FriendRequests />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FriendsSection;
