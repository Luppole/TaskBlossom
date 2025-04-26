import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FriendRequest, FriendData, ActivityItem } from '@/types/friend';
import { UserSettings } from '@/types/settings';
import { useFirebaseUser } from './useFirebaseUser';
import { convertFirebaseTimestamp } from '@/utils/firebaseHelpers';

export const useFriendOperations = () => {
  const { user } = useFirebaseUser();

  const sendFriendRequest = async (recipientId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = collection(db, 'friendRequests');
      
      await addDoc(requestRef, {
        senderId: user.uid,
        senderName: user.displayName,
        recipientId,
        status: 'pending',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };
  
  const acceptFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) throw new Error('Friend request not found');
      
      const requestData = requestDoc.data() as FriendRequest;
      
      await updateDoc(requestRef, { status: 'accepted' });
      
      const currentUserFriendRef = doc(db, 'users', user.uid, 'friends', requestData.senderId);
      const senderFriendRef = doc(db, 'users', requestData.senderId, 'friends', user.uid);
      
      const senderUserDoc = await getDoc(doc(db, 'userSettings', requestData.senderId));
      const senderUser = await getDoc(doc(db, 'users', requestData.senderId));
      
      await setDoc(currentUserFriendRef, {
        userId: requestData.senderId,
        displayName: requestData.senderName,
        addedAt: Timestamp.now()
      });
      
      await setDoc(senderFriendRef, {
        userId: user.uid,
        displayName: user.displayName,
        addedAt: Timestamp.now()
      });
      
      await addActivity(user.uid, {
        type: 'friend_added',
        userId: requestData.senderId,
        userName: requestData.senderName,
        timestamp: Timestamp.now()
      });
      
      await addActivity(requestData.senderId, {
        type: 'friend_added',
        userId: user.uid,
        userName: user.displayName || 'User',
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };
  
  const rejectFriendRequest = async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await updateDoc(requestRef, { status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  };
  
  const getFriendRequests = async () => {
    if (!user) return [];
    
    try {
      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('recipientId', '==', user.uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      } as FriendRequest));
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  };
  
  const getFriends = async () => {
    if (!user) return [];
    
    try {
      const friendsRef = collection(db, 'users', user.uid, 'friends');
      const querySnapshot = await getDocs(friendsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: (doc.data().addedAt as Timestamp).toDate()
      } as FriendData));
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  };
  
  const removeFriend = async (friendId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const currentUserFriendRef = doc(db, 'users', user.uid, 'friends', friendId);
      const friendUserRef = doc(db, 'users', friendId, 'friends', user.uid);
      
      await deleteDoc(currentUserFriendRef);
      await deleteDoc(friendUserRef);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };
  
  const addActivity = async (userId: string, activity: Omit<ActivityItem, 'id'>) => {
    try {
      const activitiesRef = collection(db, 'users', userId, 'activities');
      await addDoc(activitiesRef, activity);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const getFriendActivities = async () => {
    if (!user) return [];
    
    try {
      const friends = await getFriends();
      
      if (friends.length === 0) return [];
      
      const activities: ActivityItem[] = [];
      
      for (const friend of friends) {
        const settingsRef = doc(db, 'userSettings', friend.userId);
        const settingsDoc = await getDoc(settingsRef);
        
        if (!settingsDoc.exists()) continue;
        
        const settings = settingsDoc.data() as UserSettings;
        
        if (settings.publicProfile) {
          const activitiesRef = collection(db, 'users', friend.userId, 'activities');
          const q = query(
            activitiesRef,
            orderBy('timestamp', 'desc'),
            limit(10)
          );
          
          const querySnapshot = await getDocs(q);
          
          const friendActivities = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: convertFirebaseTimestamp(data.timestamp) || new Date(),
              friendId: friend.userId,
              friendName: friend.displayName
            } as ActivityItem;
          });
          
          activities.push(...friendActivities);
        }
      }
      
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting friend activities:', error);
      return [];
    }
  };
  
  const getUserProfile = async (userId: string) => {
    try {
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (!settingsDoc.exists()) return null;
      
      const settings = settingsDoc.data() as UserSettings;
      
      if (!settings.publicProfile && (!user || user.uid !== userId)) return null;
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      let userData = {};
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      }
      
      let fitnessData = null;
      if (settings.shareFitness || (user && user.uid === userId)) {
        const workoutsRef = collection(db, 'users', userId, 'workouts');
        const workoutsQuery = query(workoutsRef, orderBy('date', 'desc'), limit(5));
        const workoutsSnapshot = await getDocs(workoutsQuery);
        
        const workouts = workoutsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: convertFirebaseTimestamp(data.date) || new Date()
          };
        });
        
        fitnessData = { workouts };
      }
      
      let progressData = null;
      if (settings.shareProgress || (user && user.uid === userId)) {
        const progressRef = collection(db, 'users', userId, 'progress');
        const progressQuery = query(progressRef, orderBy('date', 'desc'), limit(10));
        const progressSnapshot = await getDocs(progressQuery);
        
        const progress = progressSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: convertFirebaseTimestamp(data.date) || new Date()
          };
        });
        
        progressData = { progress };
      }
      
      return {
        userId,
        displayName: userDoc.exists() ? userDoc.data().displayName : 'User',
        settings: {
          publicProfile: settings.publicProfile,
          shareProgress: settings.shareProgress,
          shareFitness: settings.shareFitness
        },
        userData,
        fitnessData,
        progressData
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  return {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriends,
    removeFriend,
    getFriendActivities,
    getUserProfile,
  };
};
