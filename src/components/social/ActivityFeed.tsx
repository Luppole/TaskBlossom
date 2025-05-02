
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Activity, Dumbbell, Utensils, Scale, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Define activity types
export type ActivityType = 
  | 'meal_logged'
  | 'workout_completed' 
  | 'goal_achieved'
  | 'weight_updated'
  | 'friend_added'
  | 'friend_removed';

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

const ActivityIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case 'meal_logged':
      return <Utensils className="h-5 w-5 text-amber-500" />;
    case 'workout_completed':
      return <Dumbbell className="h-5 w-5 text-emerald-500" />;
    case 'weight_updated':
      return <Scale className="h-5 w-5 text-blue-500" />;
    case 'friend_added':
      return <UserPlus className="h-5 w-5 text-purple-500" />;
    case 'friend_removed':
      return <UserMinus className="h-5 w-5 text-rose-500" />;
    case 'goal_achieved':
      return <Activity className="h-5 w-5 text-rose-500" />;
    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
};

const ActivityMessage = ({ activity }: { activity: ActivityItem }) => {
  switch (activity.type) {
    case 'meal_logged':
      return <>logged a meal</>;
    case 'workout_completed':
      return <>completed a workout</>;
    case 'weight_updated':
      return <>updated their weight</>;
    case 'friend_added':
      return <>added {activity.data?.friendName || 'a user'} as a friend</>;
    case 'friend_removed':
      return <>removed {activity.data?.friendName || 'a user'} from friends</>;
    case 'goal_achieved':
      return <>achieved a fitness goal</>;
    default:
      return <>did something</>;
  }
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, getUserProfile, getFriends } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user's friends
        const friends = await getFriends();
        
        // For now, generate mock activities for friends
        // In a real app, you would fetch actual activities from a table
        const mockActivities: ActivityItem[] = [];
        
        for (const friend of friends) {
          const profile = await getUserProfile(friend.userId);
          
          if (profile) {
            // Add some random activities
            const activityTypes: ActivityType[] = [
              'meal_logged', 
              'workout_completed', 
              'weight_updated', 
              'goal_achieved'
            ];
            
            // Add 1-3 activities per friend
            const numActivities = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numActivities; i++) {
              const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
              const hoursAgo = Math.floor(Math.random() * 24);
              
              mockActivities.push({
                id: `${friend.userId}-${i}`,
                type: activityType,
                userId: friend.userId,
                userName: profile.full_name || profile.username || 'User',
                timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
                data: {}
              });
            }
          }
        }
        
        // Sort by timestamp (newest first)
        mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
        toast.error('Failed to load activity feed');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [user, getFriends, getUserProfile]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Friend Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Friend Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-8"
          >
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground mb-6">
              When your friends log meals, workouts, or achieve goals, you'll see their activity here
            </p>
            <Button 
              onClick={() => navigate('/social?tab=discover')} 
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Find Friends
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Friend Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {activities.map(activity => (
            <motion.div 
              key={activity.id} 
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="mt-1">
                <AvatarFallback className="bg-muted">
                  <ActivityIcon type={activity.type} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => handleViewProfile(activity.userId)}
                  >
                    {activity.userName}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {format(activity.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  <ActivityMessage activity={activity} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
