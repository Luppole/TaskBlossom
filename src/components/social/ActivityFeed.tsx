
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityItem, ActivityType } from '@/types/friend';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Activity, Dumbbell, Utensils, Scale, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
    case 'goal_achieved':
      return <Activity className="h-5 w-5 text-rose-500" />;
    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
};

const ActivityMessage = ({ activity }: { activity: ActivityItem }) => {
  const { t } = useTranslation();
  
  switch (activity.type) {
    case 'meal_logged':
      return <>{activity.userName} {t('social.activity.mealLogged')}</>;
    case 'workout_completed':
      return <>{activity.userName} {t('social.activity.workoutCompleted')}</>;
    case 'weight_updated':
      return <>{activity.userName} {t('social.activity.weightUpdated')}</>;
    case 'friend_added':
      return <>{activity.userName} {t('social.activity.friendAdded', { name: activity.data?.friendName || t('social.aUser') })}</>;
    case 'goal_achieved':
      return <>{activity.userName} {t('social.activity.goalAchieved')}</>;
    default:
      return <>{activity.userName} {t('social.activity.didSomething')}</>;
  }
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFriendActivities } = useFirebase();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const friendActivities = await getFriendActivities();
        setActivities(friendActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [getFriendActivities]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">{t('social.noActivity')}</h3>
            <p className="text-muted-foreground mb-6">{t('social.noActivityDescription')}</p>
            <Button 
              onClick={() => navigate('/social?tab=discover')} 
              variant="outline"
            >
              {t('social.findFriends')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">{t('social.friendActivity')}</h2>
        <div className="space-y-6">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="bg-muted rounded-full p-2 mt-1">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => handleViewProfile(activity.userId)}
                  >
                    {activity.friendName || activity.userName}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {format(activity.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  <ActivityMessage activity={activity} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
