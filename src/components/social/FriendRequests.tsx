
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FriendRequest } from '@/types/friend';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Check, X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFriendRequests, acceptFriendRequest, rejectFriendRequest } = useFirebase();
  const { t } = useTranslation();

  useEffect(() => {
    const loadFriendRequests = async () => {
      try {
        const requests = await getFriendRequests();
        setFriendRequests(requests);
      } catch (error) {
        console.error('Error loading friend requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendRequests();
  }, [getFriendRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(request => request.id !== requestId));
      toast.success(t('social.friendRequestAccepted'));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error(t('common.error'));
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(request => request.id !== requestId));
      toast.success(t('social.friendRequestRejected'));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  if (friendRequests.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('social.friendRequests')}</h2>
        <div className="text-center py-8 text-muted-foreground">
          <UserPlus className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>{t('social.noFriendRequests')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('social.friendRequests')}</h2>
      <div className="space-y-4">
        {friendRequests.map(request => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">{request.senderName}</p>
              <p className="text-sm text-muted-foreground">
                {format(request.createdAt, 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => handleAccept(request.id)}
              >
                <Check className="h-4 w-4" />
                {t('common.accept')}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="flex items-center gap-1"
                onClick={() => handleReject(request.id)}
              >
                <X className="h-4 w-4" />
                {t('common.reject')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
