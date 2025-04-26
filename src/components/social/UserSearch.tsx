
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Search, UserPlus, Check, User } from 'lucide-react';
import { toast } from 'sonner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserSearchResult {
  id: string;
  displayName: string;
  email: string;
  isRequestSent: boolean;
  isFriend: boolean;
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, sendFriendRequest, getFriends } = useFirebase();
  const { t } = useTranslation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Get current user's friends
      const friends = await getFriends();
      const friendIds = friends.map(friend => friend.userId);
      
      // Search for users by email or display name
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', searchQuery));
      const querySnapshot = await getDocs(q);
      
      const results: UserSearchResult[] = [];
      
      querySnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Don't include current user in results
        if (doc.id === user?.uid) return;
        
        results.push({
          id: doc.id,
          displayName: userData.displayName || 'User',
          email: userData.email,
          isRequestSent: false, // We'll fetch this later
          isFriend: friendIds.includes(doc.id)
        });
      });
      
      setSearchResults(results);
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
      
      toast.success(t('social.friendRequestSent'));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(t('common.error'));
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('social.findFriends')}</h2>
        
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder={t('social.searchByEmail')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            {t('common.search')}
          </Button>
        </div>
        
        <div className="space-y-4">
          {searchResults.length === 0 && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>{t('social.searchToFindUsers')}</p>
            </div>
          ) : (
            searchResults.map(result => (
              <div key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{result.displayName}</p>
                  <p className="text-sm text-muted-foreground">{result.email}</p>
                </div>
                <div>
                  {result.isFriend ? (
                    <Button disabled variant="outline" size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      {t('social.alreadyFriends')}
                    </Button>
                  ) : result.isRequestSent ? (
                    <Button disabled variant="outline" size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      {t('social.requestSent')}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleSendFriendRequest(result.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t('social.sendRequest')}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="text-center py-4">{t('common.loading')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
