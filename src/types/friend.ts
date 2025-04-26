
import { Timestamp } from "firebase/firestore";

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface FriendData {
  id: string;
  userId: string;
  displayName: string;
  addedAt: Date;
}

export type ActivityType = 
  | 'meal_logged'
  | 'workout_completed' 
  | 'goal_achieved'
  | 'weight_updated'
  | 'friend_added';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  timestamp: Date;
  data?: any;
  friendId?: string;
  friendName?: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  settings: {
    publicProfile: boolean;
    shareProgress: boolean;
    shareFitness: boolean;
  };
  userData?: any;
  fitnessData?: {
    workouts: any[];
  } | null;
  progressData?: {
    progress: any[];
  } | null;
}
