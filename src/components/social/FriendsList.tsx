
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FriendData } from '@/types/friend';
import { useFirebase } from '@/contexts/FirebaseContext';
import { UserCircle, User, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FriendsList = () => {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const { getFriends, removeFriend } = useFirebase();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const userFriends = await getFriends();
        setFriends(userFriends);
      } catch (error) {
        console.error('Error loading friends:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [getFriends]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleRemoveClick = (friend: FriendData) => {
    setSelectedFriend(friend);
    setShowRemoveDialog(true);
  };

  const handleRemoveFriend = async () => {
    if (!selectedFriend) return;
    
    try {
      await removeFriend(selectedFriend.userId);
      setFriends(prev => prev.filter(friend => friend.userId !== selectedFriend.userId));
      toast.success(t('social.friendRemoved'));
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error(t('common.error'));
    } finally {
      setShowRemoveDialog(false);
      setSelectedFriend(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  if (friends.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('social.friendsList')}</h2>
        <div className="text-center py-8 text-muted-foreground">
          <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>{t('social.noFriends')}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/social?tab=discover')}
          >
            {t('social.findFriends')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('social.friendsList')}</h2>
        <div className="space-y-4">
          {friends.map(friend => (
            <div key={friend.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">{friend.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('social.friendSince', { date: format(friend.addedAt, 'MMM d, yyyy') })}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => handleViewProfile(friend.userId)}
                >
                  <User className="h-4 w-4" />
                  {t('social.viewProfile')}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveClick(friend)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('social.removeFriend')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('social.removeFriendConfirm', { name: selectedFriend?.displayName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveFriend}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('social.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FriendsList;
