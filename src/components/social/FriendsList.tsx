
import React, { useState, useEffect } from 'react';
import { FriendData } from '@/types/friend';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserCircle, UserMinus, Loader2, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const FriendsList = () => {
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendToRemove, setFriendToRemove] = useState<FriendData | null>(null);
  const { getFriends, removeFriend } = useFirebase();

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

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
          Your Friends
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div>
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4"
        >
          Your Friends
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Friends Yet</h3>
          <p className="text-muted-foreground mb-6">Discover and connect with other users to build your network</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4"
      >
        Your Friends
      </motion.h2>
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
                <Avatar className="h-10 w-10 transition-transform hover:scale-105">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {friend.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{friend.displayName}</h3>
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
      </AnimatePresence>

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
    </div>
  );
};

export default FriendsList;
