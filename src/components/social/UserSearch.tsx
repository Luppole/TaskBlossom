
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Search, UserPlus, Check, User, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tab, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface UserSearchResult {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
  isRequestSent: boolean;
  isFriend: boolean;
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [popularUsers, setPopularUsers] = useState<UserSearchResult[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const { user, sendFriendRequest, getFriends, searchUsers } = useFirebase();
  const { t } = useTranslation();

  // Get popular users on component mount
  useEffect(() => {
    const loadPopularUsers = async () => {
      setIsLoadingPopular(true);
      try {
        // In a real app, you'd have an API for this
        // For now, we'll just use the search function with empty query
        const users = await searchUsers('');
        setPopularUsers(users.slice(0, 5).map(userData => ({
          id: userData.id,
          username: userData.username || userData.displayName || 'User',
          full_name: userData.full_name || '',
          avatar_url: userData.avatar_url || '',
          email: userData.email,
          isRequestSent: false,
          isFriend: false
        })));
      } catch (error) {
        console.error('Error loading popular users:', error);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    loadPopularUsers();
  }, [searchUsers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Get current user's friends
      const friends = await getFriends();
      const friendIds = friends.map(friend => friend.userId);
      
      // Search for users by username, full name, or email
      const results = await searchUsers(searchQuery);
      
      const formattedResults: UserSearchResult[] = results.map(userData => ({
        id: userData.id,
        username: userData.username || userData.displayName || 'User',
        full_name: userData.full_name || '',
        avatar_url: userData.avatar_url || '',
        email: userData.email,
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
      toast.error(t('common.error'));
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
      
      toast.success(t('social.friendRequestSent'));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(t('common.error'));
    }
  };

  const renderUserList = (users: UserSearchResult[], emptyMessage: string) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>
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
                <Button disabled variant="outline" size="sm" className="gap-2">
                  <Check className="h-4 w-4" />
                  {t('social.alreadyFriends')}
                </Button>
              ) : user.isRequestSent ? (
                <Button disabled variant="outline" size="sm" className="gap-2">
                  <Check className="h-4 w-4" />
                  {t('social.requestSent')}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleSendFriendRequest(user.id)}
                >
                  <UserPlus className="h-4 w-4" />
                  {t('social.sendRequest')}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('social.findFriends')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder={t('social.searchByNameOrUsername')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {t('common.search')}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="search" disabled={loading}>
              <Search className="h-4 w-4 mr-2" /> {t('social.searchResults')}
            </TabsTrigger>
            <TabsTrigger value="discover">
              <Users className="h-4 w-4 mr-2" /> {t('social.discover')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              renderUserList(
                searchResults,
                searchQuery ? 
                  t('social.noSearchResults', { query: searchQuery }) : 
                  t('social.searchToFindUsers')
              )
            )}
          </TabsContent>
          
          <TabsContent value="discover">
            <h3 className="text-lg font-medium mb-4">{t('social.suggestedUsers')}</h3>
            
            {isLoadingPopular ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              renderUserList(
                popularUsers,
                t('social.noSuggestedUsers')
              )
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
