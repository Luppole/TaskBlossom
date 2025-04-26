import { collection, doc, setDoc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from './useFirebaseUser';
import { FriendRequest, FriendData } from '@/types/friend';
import { toast } from 'sonner';
import { convertFirebaseTimestamps } from '@/utils/firebaseHelpers';

export const useFriendOperations = () => {
  const { user } = useFirebaseUser();

  // Get friends
  const getFriends = async (): Promise<FriendData[]> => {
    if (!user) return [];
    
    try {
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      const querySnapshot = await getDocs(friendsRef);
      
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
      return [];
    }
  };

  // Get friend requests
  const getFriendRequests = async (): Promise<FriendRequest[]> => {
    if (!user) return [];
    
    try {
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
      
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found');
      }
      
      const requestData = requestSnap.data();
      
      if (requestData.recipientId !== user.uid) {
        throw new Error('Unauthorized to accept this request');
      }
      
      await updateDoc(requestRef, {
        status: 'accepted'
      });
      
      const myFriendRef = doc(db, 'users', user.uid, 'friends', requestData.senderId);
      await setDoc(myFriendRef, {
        userId: requestData.senderId,
        username: requestData.senderName,
        displayName: requestData.senderName,
        photoURL: null, 
        since: Timestamp.now()
      });
      
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
      const myFriendRef = doc(db, 'users', user.uid, 'friends', friendId);
      await deleteDoc(myFriendRef);
      
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
