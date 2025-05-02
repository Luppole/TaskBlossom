
import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserCircle, UserMinus, Loader2, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Friend {
  id: string;
  userId: string;
  displayName: string;
  avatar_url?: string;
  addedAt: Date;
}

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const { getFriends, removeFriend } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        const fetchedFriends = await getFriends();
        setFriends(fetchedFriends);
      } catch (error) {
        console.error('Error loading friends:', error);
        toast.error('Error loading friends');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [getFriends]);

  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    try {
      await removeFriend(friendToRemove.userId);
      setFriends(friends.filter(friend => friend.userId !== friendToRemove.userId));
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Something went wrong');
    } finally {
      setFriendToRemove(null);
    }
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile page
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading friends...</span>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center py-8 text-muted-foreground"
      >
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Friends Yet</h3>
        <p className="text-muted-foreground mb-6">Discover and connect with other users to build your network</p>
        <Button 
          onClick={() => navigate('/social?tab=discover')} 
          variant="outline"
          className="gap-2"
        >
          <UserCircle className="h-4 w-4" />
          Find Friends
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div className="space-y-4">
        {friends.map((friend, index) => (
          <motion.div 
            key={friend.userId} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 transition-transform hover:scale-105 cursor-pointer" 
                      onClick={() => handleViewProfile(friend.userId)}>
                {friend.avatar_url ? (
                  <AvatarImage src={friend.avatar_url} alt={friend.displayName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {friend.displayName[0].toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium"
                  onClick={() => handleViewProfile(friend.userId)}
                >
                  {friend.displayName}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Friends since {format(friend.addedAt, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFriendToRemove(friend)}
              className="text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </motion.div>

      <AlertDialog open={!!friendToRemove} onOpenChange={(open) => !open && setFriendToRemove(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friendToRemove?.displayName} from your friends?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFriend} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};

export default FriendsList;
