import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Search, User, Users, Loader2 } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext'; 
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserList from './user-search/UserList';

interface UserSearchResult {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  isRequestSent: boolean;
  isFriend: boolean;
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'name'>('name');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [popularUsers, setPopularUsers] = useState<UserSearchResult[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const { 
    user, 
    sendFriendRequest, 
    getFriends, 
    searchUsersByName, 
    removeFriend 
  } = useSupabase();

  // Get all users on component mount
  useEffect(() => {
    const loadAllUsers = async () => {
      if (!user || isLoadingAllUsers) return;
      
      setIsLoadingAllUsers(true);
      setIsLoadingPopular(true);
      
      try {
        // Get current user's friends
        const friends = await getFriends();
        const friendIds = friends.map(friend => friend.userId);
        
        // Fetch all users
        const users = await searchUsersByName('');
        
        const formattedUsers = users
          .filter(userData => userData.id !== user?.id) // Filter out the current user
          .map(userData => ({
            id: userData.id,
            username: userData.username || userData.full_name || 'User',
            full_name: userData.full_name || '',
            avatar_url: userData.avatar_url || '',
            isRequestSent: false, // We'll update this later as needed
            isFriend: friendIds.includes(userData.id)
          }));
        
        setAllUsers(formattedUsers);
        
        // Also populate popular users (for now just use the first 5)
        setPopularUsers(formattedUsers.slice(0, 5));
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Error loading users');
      } finally {
        setIsLoadingAllUsers(false);
        setIsLoadingPopular(false);
      }
    };

    if (user) {
      loadAllUsers();
    }
  }, [user, getFriends, searchUsersByName]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Get current user's friends
      const friends = await getFriends();
      const friendIds = friends.map(friend => friend.userId);
      
      // Search for users by username or full name
      const results = await searchUsersByName(searchQuery);
      
      const formattedResults: UserSearchResult[] = results
        .filter(userData => userData.id !== user?.id) // Filter out the current user
        .filter(userData => {
          // Only filter by name since we don't have email in the profiles table
          return (userData.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  userData.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
        })
        .map(userData => ({
          id: userData.id,
          username: userData.username || userData.full_name || 'User',
          full_name: userData.full_name || '',
          avatar_url: userData.avatar_url || '',
          isRequestSent: false,
          isFriend: friendIds.includes(userData.id)
        }));
      
      setSearchResults(formattedResults);
      // If we get results, switch to search tab
      if (formattedResults.length > 0) {
        setActiveTab('search');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      
      // Update UI in all relevant lists
      const updateUserList = (list: UserSearchResult[]) => {
        return list.map(user => 
          user.id === userId ? { ...user, isRequestSent: true } : user
        );
      };
      
      setSearchResults(updateUserList(searchResults));
      setPopularUsers(updateUserList(popularUsers));
      setAllUsers(updateUserList(allUsers));
      
      toast.success('Friend request sent!', {
        duration: 3000,
        action: {
          label: "View Friends",
          onClick: () => {
            // Navigate to friends tab
            const socialPage = document.querySelector('a[href="/social"]');
            if (socialPage) {
              (socialPage as HTMLElement).click();
            }
          }
        }
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Something went wrong');
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await removeFriend(userId);
      
      // Update UI in all relevant lists
      const updateUserList = (list: UserSearchResult[]) => {
        return list.map(user => 
          user.id === userId ? { ...user, isFriend: false } : user
        );
      };
      
      setSearchResults(updateUserList(searchResults));
      setPopularUsers(updateUserList(popularUsers));
      setAllUsers(updateUserList(allUsers));
      
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Something went wrong');
    }
  };

  const handleShowAllUsers = () => {
    setActiveTab('all');
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border shadow hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Find Friends
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="flex flex-col gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input 
                placeholder="Search for users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-2">
              <select
                className="bg-muted text-foreground px-3 py-2 rounded-md text-sm border border-muted transition-all w-24"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'name')}
              >
                <option value="name">Name</option>
              </select>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="gap-2 transition-transform hover:scale-105"
                  variant="default"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowAllUsers}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1"
            >
              <Users className="h-3.5 w-3.5" />
              Show all users
            </Button>
          </motion.div>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger 
                value="search" 
                disabled={loading} 
                className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                  <Search className="h-4 w-4 mr-2" /> Results
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                  <Users className="h-4 w-4 mr-2" /> Discover
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                  <User className="h-4 w-4 mr-2" /> All Users
                </motion.div>
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="search">
              <UserList 
                users={searchResults}
                emptyMessage={searchQuery ? 
                  `No results found for "${searchQuery}"` : 
                  'Search for users by name or username'}
                isLoading={loading}
                onSendFriendRequest={handleSendFriendRequest}
                onRemoveFriend={handleRemoveFriend}
              />
            </TabsContent>
            
            <TabsContent value="discover">
              <motion.h3 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-medium mb-4"
              >
                Suggested Users
              </motion.h3>
              
              <UserList 
                users={popularUsers}
                emptyMessage="No suggested users available at the moment"
                isLoading={isLoadingPopular}
                onSendFriendRequest={handleSendFriendRequest}
                onRemoveFriend={handleRemoveFriend}
              />
            </TabsContent>
            
            <TabsContent value="all">
              <motion.h3 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-medium mb-4"
              >
                All Users
              </motion.h3>
              
              <UserList 
                users={allUsers}
                emptyMessage="No users found"
                isLoading={isLoadingAllUsers}
                onSendFriendRequest={handleSendFriendRequest}
                onRemoveFriend={handleRemoveFriend}
              />
            </TabsContent>
          </motion.div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
