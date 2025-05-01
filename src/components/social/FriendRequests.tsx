
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FriendRequest } from '@/types/friend';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Check, X, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFriendRequests, acceptFriendRequest, rejectFriendRequest } = useFirebase();

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
      toast.success('Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('An error occurred');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      setFriendRequests(prev => prev.filter(request => request.id !== requestId));
      toast.success('Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
          Friend Requests
        </h2>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
          Friend Requests
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          <UserPlus className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>You don't have any friend requests</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
        Friend Requests
      </h2>
      <div className="space-y-4">
        {friendRequests.map(request => (
          <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {request.senderName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{request.senderName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(request.createdAt, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => handleAccept(request.id)}
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="flex items-center gap-1"
                onClick={() => handleReject(request.id)}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;
