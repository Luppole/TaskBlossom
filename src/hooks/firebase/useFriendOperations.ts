
import { collection, doc, setDoc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from './useFirebaseUser';
import { Friend, FriendRequest } from '@/types/friend';
import { toast } from 'sonner';
import { convertFirebaseTimestamps } from '@/utils/firebaseHelpers';

export const useFriendOperations = () => {
  const { user } = useFirebaseUser();

  // Get friends
  const getFriends = async (): Promise<Friend[]> => {
    if (!user) return [];
    
    try {
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      const querySnapshot = await getDocs(friendsRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          username: data.username,
          displayName: data.displayName,
          photoURL: data.photoURL,
          since: data.since ? data.since.toDate() : new Date(),
        };
      });
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  };

  // Get friend requests
  const getFriendRequests = async (): Promise<FriendRequest[]> => {
    if (!user) return [];
    
    try {
      // Change the query to work without the complex index
      // Just get all friend requests for the current user without sorting
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('recipientId', '==', user.uid),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      
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
      // If there's a missing index error, provide information to the user
      if (error.toString().includes('requires an index')) {
        toast.error('Friend requests need database indexing. Please check the admin console.');
      }
      return [];
    }
  };

  // Send a friend request
  const sendFriendRequest = async (recipientId: string, recipientName?: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const friendRequestRef = collection(db, 'friendRequests');
      
      // Check if there's already a pending request
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
      
      // Create a new friend request
      await addDoc(friendRequestRef, {
        senderId: user.uid,
        senderName: user.displayName || 'User',
        recipientId,
        recipientName: recipientName || 'User',
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Get the request
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found');
      }
      
      const requestData = requestSnap.data();
      
      if (requestData.recipientId !== user.uid) {
        throw new Error('Unauthorized to accept this request');
      }
      
      // Update the request status
      await updateDoc(requestRef, {
        status: 'accepted'
      });
      
      // Add friend to current user's friends
      const myFriendRef = doc(db, 'users', user.uid, 'friends', requestData.senderId);
      await setDoc(myFriendRef, {
        userId: requestData.senderId,
        username: requestData.senderName,
        displayName: requestData.senderName,
        photoURL: null, 
        since: Timestamp.now()
      });
      
      // Add current user to the other user's friends
      const theirFriendRef = doc(db, 'users', requestData.senderId, 'friends', user.uid);
      await setDoc(theirFriendRef, {
        userId: user.uid,
        username: user.displayName || 'User',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL,
        since: Timestamp.now()
      });
      
    } catch (error) {
      console.error('Error accepting friend request:', error);
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
      
      // Update the request status
      await updateDoc(requestRef, {
        status: 'rejected'
      });
      
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  };

  // Remove a friend
  const removeFriend = async (friendId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Delete from current user's friends
      const myFriendRef = doc(db, 'users', user.uid, 'friends', friendId);
      await deleteDoc(myFriendRef);
      
      // Delete from other user's friends
      const theirFriendRef = doc(db, 'users', friendId, 'friends', user.uid);
      await deleteDoc(theirFriendRef);
      
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  return {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  };
};
