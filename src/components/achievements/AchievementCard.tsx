
import React from 'react';
import { Achievement } from '@/types/achievement';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BadgeDisplay from './BadgeDisplay';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const { title, description, badge, progress, completed, currentCount, requiredCount } = achievement;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden relative border transition-all duration-300",
        completed && "border-primary/20 bg-accent/30"
      )}>
        {completed && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            Completed
          </div>
        )}
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <BadgeDisplay badge={badge} size="md" />
          </div>
          <div className="flex-grow space-y-2">
            <div>
              <h3 className="font-medium line-clamp-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{currentCount} / {requiredCount}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
