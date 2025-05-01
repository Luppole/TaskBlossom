
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabase } from '@/contexts/SupabaseContext'; 
import { Search, UserPlus, Check, User, Loader2, Users, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types/friend';

interface UserSearchResult {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  isRequestSent: boolean;
  isFriend: boolean;
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
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
            email: userData.email || '',
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
        .map(userData => ({
          id: userData.id,
          username: userData.username || userData.full_name || 'User',
          full_name: userData.full_name || '',
          avatar_url: userData.avatar_url || '',
          email: userData.email || '',
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
      
      // Update the UI to show this request was sent
      setSearchResults(prev => 
        prev.map(result => 
          result.id === userId ? { ...result, isRequestSent: true } : result
        )
      );
      
      // Also update in popular users if present
      setPopularUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isRequestSent: true } : user
        )  
      );
      
      // Update in all users list
      setAllUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isRequestSent: true } : user
        )  
      );
      
      toast.success('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Something went wrong');
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await removeFriend(userId);
      
      // Update the UI to show this friend was removed
      setSearchResults(prev => 
        prev.map(result => 
          result.id === userId ? { ...result, isFriend: false } : result
        )
      );
      
      // Also update in popular users if present
      setPopularUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isFriend: false } : user
        )  
      );
      
      // Update in all users list
      setAllUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, isFriend: false } : user
        )  
      );
      
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Something went wrong');
    }
  };

  const renderUserList = (users: UserSearchResult[], emptyMessage: string, isLoading: boolean = false) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading...</span>
        </div>
      );
    }
    
    if (users.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8 text-muted-foreground"
        >
          <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </motion.div>
      );
    }

    return (
      <motion.div className="space-y-4">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div 
              key={user.id} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 transition-transform hover:scale-110">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(user.username?.[0] || user.full_name?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.full_name || user.username}</p>
                  <p className="text-sm text-muted-foreground">@{user.username || user.email?.split('@')[0]}</p>
                </div>
              </div>
              <div>
                {user.isFriend ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    onClick={() => handleRemoveFriend(user.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                    Unfollow
                  </Button>
                ) : user.isRequestSent ? (
                  <Button disabled variant="outline" size="sm" className="gap-2">
                    <Check className="h-4 w-4" />
                    Request Sent
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 transition-all hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleSendFriendRequest(user.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Follow
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
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
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Input 
            placeholder="Search by name or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="transition-all focus:ring-2 focus:ring-primary/20"
          />
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="gap-2 transition-transform hover:scale-105"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="search" disabled={loading} className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="h-4 w-4 mr-2" /> Results
              </TabsTrigger>
              <TabsTrigger value="discover" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-2" /> Discover
              </TabsTrigger>
              <TabsTrigger value="all" className="transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="h-4 w-4 mr-2" /> All Users
              </TabsTrigger>
            </TabsList>
          </motion.div>
          
          <TabsContent value="search">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              renderUserList(
                searchResults,
                searchQuery ? 
                  `No results found for "${searchQuery}"` : 
                  'Search for users by name or username'
              )
            )}
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
            
            {renderUserList(
              popularUsers,
              'No suggested users available at the moment',
              isLoadingPopular
            )}
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
            
            {renderUserList(
              allUsers,
              'No users found',
              isLoadingAllUsers
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
