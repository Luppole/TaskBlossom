
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BadgeCheck, BadgePlus, Filter, Loader } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import AchievementCard from '@/components/achievements/AchievementCard';
import BadgeDisplay from '@/components/achievements/BadgeDisplay';
import { Achievement, Badge } from '@/types/achievement';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AchievementsPage: React.FC = () => {
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState('achievements');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch badges - we type cast the response since TypeScript doesn't know about our new tables yet
        const { data: badgeData, error: badgeError } = await supabase
          .from('badges')
          .select('*') as { data: any[], error: any };
        
        if (badgeError) throw badgeError;
        
        // Fetch user's achievements
        const { data: achievementData, error: achievementError } = await supabase
          .from('user_achievements')
          .select('*, badge_id(*)') as { data: any[], error: any };
        
        if (achievementError) throw achievementError;
        
        // Transform the data to match our types
        const formattedBadges: Badge[] = badgeData?.map((badge) => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          unlockedAt: badge.unlocked_at || undefined,
        })) || [];
        
        const formattedAchievements: Achievement[] = achievementData?.map((achievement) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          badge: {
            id: achievement.badge_id.id,
            name: achievement.badge_id.name,
            description: achievement.badge_id.description,
            icon: achievement.badge_id.icon,
            rarity: achievement.badge_id.rarity,
            unlockedAt: achievement.badge_id.unlocked_at || undefined,
          },
          progress: achievement.progress,
          completed: achievement.completed,
          completedAt: achievement.completed_at || undefined,
          requiredCount: achievement.required_count,
          currentCount: achievement.current_count,
        })) || [];
        
        setBadges(formattedBadges);
        setAchievements(formattedAchievements);
      } catch (error) {
        console.error('Error fetching achievements data:', error);
        toast({
          title: "Couldn't load achievements",
          description: "There was a problem loading your achievements data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'completed') return achievement.completed;
    if (filter === 'in-progress') return !achievement.completed;
    return true;
  });
  
  const completedAchievements = achievements.filter(a => a.completed).length;
  const totalAchievements = achievements.length;
  const unlockedBadges = badges.filter(b => b.unlockedAt).length;
  
  const nextBadge = badges.find(b => !b.unlockedAt);
  
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Achievements & Badges</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock badges as you complete tasks and reach milestones.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card shadow rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Achievements Completed</p>
              <h3 className="text-2xl font-bold">
                {completedAchievements}/{totalAchievements}
              </h3>
            </div>
            <Award className="h-8 w-8 text-primary opacity-80" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card shadow rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Badges Unlocked</p>
              <h3 className="text-2xl font-bold">
                {unlockedBadges}/{badges.length}
              </h3>
            </div>
            <BadgeCheck className="h-8 w-8 text-primary opacity-80" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card shadow rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Next Badge</p>
              <h3 className="text-lg font-bold line-clamp-1">
                {nextBadge?.name || 'All badges unlocked!'}
              </h3>
            </div>
            <BadgePlus className="h-8 w-8 text-primary opacity-80" />
          </div>
        </motion.div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>
          
          {activeTab === 'achievements' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-1" /> {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('in-progress')}>
                  In Progress
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <TabsContent value="achievements" className="mt-4">
          {achievements.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Award className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium text-lg">No achievements yet</h3>
              <p className="text-muted-foreground mt-1">
                Complete tasks and reach milestones to earn achievements
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence>
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="badges" className="mt-4">
          {badges.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <BadgeCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-medium text-lg">No badges available</h3>
              <p className="text-muted-foreground mt-1">
                Check back later for available badges
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg">
                  <BadgeDisplay badge={badge} size="lg" />
                  <div className="text-center">
                    <h3 className="text-sm font-medium">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsPage;
