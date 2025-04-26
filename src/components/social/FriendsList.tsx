
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FriendData } from '@/types/friend';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserCircle, UserMinus, Loader2, Users } from 'lucide-react';

const FriendsList = () => {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState<FriendData | null>(null);
  const { getFriends, removeFriend } = useFirebase();
  const { t } = useTranslation();

  useEffect(() => {
    const loadFriends = async () => {
      try {
        console.log("Loading friends...");
        setLoading(true);
        const fetchedFriends = await getFriends();
        console.log(`Loaded ${fetchedFriends.length} friends`);
        setFriends(fetchedFriends);
      } catch (error) {
        console.error('Error loading friends:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [getFriends, t]);

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      await removeFriend(friendToRemove.userId);
      setFriends(friends.filter(friend => friend.userId !== friendToRemove.userId));
      toast.success(t('social.friendRemoved'));
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error(t('common.error'));
    } finally {
      setFriendToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('social.yourFriends')}</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">{t('social.noFriendsYet')}</h3>
            <p className="text-muted-foreground mb-6">{t('social.findFriendsDescription')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('social.yourFriends')}</h2>
      <div className="space-y-4">
        {friends.map(friend => (
          <Card key={friend.userId} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{friend.displayName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('social.friendSince')} {format(friend.addedAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFriendToRemove(friend)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!friendToRemove} onOpenChange={(open) => !open && setFriendToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('social.removeFriend')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('social.removeFriendConfirm', { name: friendToRemove?.displayName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFriend} className="bg-destructive text-destructive-foreground">
              {t('common.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FriendsList;
