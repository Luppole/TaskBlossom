
import { collection, doc, setDoc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from './useFirebaseUser';
import { FriendRequest, FriendData, ActivityItem } from '@/types/friend';
import { toast } from 'sonner';
import { convertFirebaseTimestamps } from '@/utils/firebaseHelpers';

export const useFriendOperations = () => {
  const { user } = useFirebaseUser();

  // Get friends
  const getFriends = async (): Promise<FriendData[]> => {
    if (!user) return [];
    
    try {
      console.log("Fetching friends for user:", user.uid);
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      const querySnapshot = await getDocs(friendsRef);
      
      console.log("Friends fetch completed, count:", querySnapshot.size);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          displayName: data.displayName || data.username || 'User',
          addedAt: data.since ? data.since.toDate() : new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting friends:', error);
      toast.error('Failed to load friends');
      return [];
    }
  };

  // Get friend requests
  const getFriendRequests = async (): Promise<FriendRequest[]> => {
    if (!user) return [];
    
    try {
      console.log("Fetching friend requests for user:", user.uid);
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('recipientId', '==', user.uid),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      
      console.log("Friend requests fetch completed, count:", querySnapshot.size);
      
      return querySnapshot.docs.map(doc => {
        const data = convertFirebaseTimestamps(doc.data());
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          recipientId: data.recipientId,
          status: data.status,
          createdAt: data.createdAt,
        };
      });
    } catch (error) {
      console.error('Error getting friend requests:', error);
      if (error.toString().includes('requires an index')) {
        toast.error('Friend requests need database indexing. Please check the admin console.');
      } else {
        toast.error('Failed to load friend requests');
      }
      return [];
    }
  };

  // Send a friend request
  const sendFriendRequest = async (recipientId: string, recipientName?: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const friendRequestRef = collection(db, 'friendRequests');
      
      const existingQuery = query(
        friendRequestRef,
        where('senderId', '==', user.uid),
        where('recipientId', '==', recipientId),
        where('status', '==', 'pending')
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('Friend request already sent');
      }
      
      await addDoc(friendRequestRef, {
        senderId: user.uid,
        senderName: user.displayName || 'User',
        recipientId,
        recipientName: recipientName || 'User',
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      toast.success('Friend request sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      throw error;
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      console.log("Accepting friend request:", requestId);
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found');
      }
      
      const requestData = requestSnap.data();
      
      if (requestData.recipientId !== user.uid) {
        throw new Error('Unauthorized to accept this request');
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'accepted'
      });
      
      // Add to my friends collection
      const myFriendRef = doc(db, 'users', user.uid, 'friends', requestData.senderId);
      await setDoc(myFriendRef, {
        userId: requestData.senderId,
        username: requestData.senderName,
        displayName: requestData.senderName,
        photoURL: null, 
        since: Timestamp.now()
      });
      
      // Add to their friends collection
      const theirFriendRef = doc(db, 'users', requestData.senderId, 'friends', user.uid);
      await setDoc(theirFriendRef, {
        userId: user.uid,
        username: user.displayName || 'User',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL,
        since: Timestamp.now()
      });
      
      console.log("Friend request accepted successfully");
      toast.success('Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
      throw error;
    }
  };

  // Reject a friend request
  const rejectFriendRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found');
      }
      
      const requestData = requestSnap.data();
      
      if (requestData.recipientId !== user.uid) {
        throw new Error('Unauthorized to reject this request');
      }
      
      await updateDoc(requestRef, {
        status: 'rejected'
      });
      
      toast.success('Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
      throw error;
    }
  };

  // Remove a friend
  const removeFriend = async (friendId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const myFriendRef = doc(db, 'users', user.uid, 'friends', friendId);
      await deleteDoc(myFriendRef);
      
      const theirFriendRef = doc(db, 'users', friendId, 'friends', user.uid);
      await deleteDoc(theirFriendRef);
      
      toast.success('Friend removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      throw error;
    }
  };

  // Get friend activities
  const getFriendActivities = async (): Promise<ActivityItem[]> => {
    if (!user) return [];
    
    try {
      // First, get all friends
      const friends = await getFriends();
      
      if (friends.length === 0) {
        return [];
      }
      
      // Mock activity data for now as real activity data requires more complex queries
      // In a real app, you would query an activities collection
      const mockActivities: ActivityItem[] = friends.map((friend, index) => ({
        id: `activity-${index}`,
        type: ['meal_logged', 'workout_completed', 'goal_achieved', 'friend_added'][Math.floor(Math.random() * 4)] as any,
        userId: friend.userId,
        userName: friend.displayName,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        friendId: friend.userId,
        friendName: friend.displayName
      }));
      
      // Sort by timestamp, newest first
      return mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting friend activities:', error);
      toast.error('Failed to load activity feed');
      return [];
    }
  };

  return {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendActivities
  };
};
