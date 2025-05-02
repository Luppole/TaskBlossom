
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BadgeCheck, BadgePlus, Filter, Star } from 'lucide-react';
import { useSupabase } from '@/contexts/SupabaseContext';
import AchievementCard from '@/components/achievements/AchievementCard';
import BadgeDisplay from '@/components/achievements/BadgeDisplay';
import { Achievement, Badge } from '@/types/achievement';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data for now - would be replaced with actual data from Supabase
const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Early Bird',
    description: 'Complete 5 tasks before 9 AM',
    icon: 'sparkles',
    rarity: 'common',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: 'award',
    rarity: 'rare',
    unlockedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Consistent Achiever',
    description: 'Maintain a 7-day streak',
    icon: 'trophy',
    rarity: 'uncommon',
  },
  {
    id: '4',
    name: 'Perfection!',
    description: 'Complete all tasks on time for a week',
    icon: 'star',
    rarity: 'epic',
  },
  {
    id: '5',
    name: 'Task Legend',
    description: 'Complete 1000 tasks',
    icon: 'award',
    rarity: 'legendary',
  },
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Early Bird',
    description: 'Complete 5 tasks before 9 AM',
    badge: mockBadges[0],
    progress: 100,
    completed: true,
    completedAt: new Date().toISOString(),
    requiredCount: 5,
    currentCount: 5,
  },
  {
    id: '2',
    title: 'Task Master',
    description: 'Complete 100 tasks',
    badge: mockBadges[1],
    progress: 100,
    completed: true,
    completedAt: new Date().toISOString(),
    requiredCount: 100,
    currentCount: 100,
  },
  {
    id: '3',
    title: 'Consistent Achiever',
    description: 'Maintain a 7-day streak',
    badge: mockBadges[2],
    progress: 40,
    completed: false,
    requiredCount: 7,
    currentCount: 3,
  },
  {
    id: '4',
    title: 'Perfection!',
    description: 'Complete all tasks on time for a week',
    badge: mockBadges[3],
    progress: 20,
    completed: false,
    requiredCount: 7,
    currentCount: 1,
  },
  {
    id: '5',
    title: 'Task Legend',
    description: 'Complete 1000 tasks',
    badge: mockBadges[4],
    progress: 20,
    completed: false,
    requiredCount: 1000,
    currentCount: 200,
  },
];

const AchievementsPage: React.FC = () => {
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState('achievements');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  
  // In a real implementation, we would fetch achievements and badges from Supabase
  const achievements = mockAchievements;
  const badges = mockBadges;
  
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'completed') return achievement.completed;
    if (filter === 'in-progress') return !achievement.completed;
    return true;
  });
  
  const completedAchievements = achievements.filter(a => a.completed).length;
  const totalAchievements = achievements.length;
  const unlockedBadges = badges.filter(b => b.unlockedAt).length;
  
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
                {badges.find(b => !b.unlockedAt)?.name || 'All badges unlocked!'}
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
        </TabsContent>
        
        <TabsContent value="badges" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsPage;
