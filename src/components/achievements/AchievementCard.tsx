
import React from 'react';
import { Achievement } from '@/types/achievement';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BadgeDisplay from './BadgeDisplay';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

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
        completed ? "border-primary/20 bg-accent/30" : ""
      )}>
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <BadgeDisplay badge={badge} size="md" />
          </div>
          <div className="flex-grow space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium line-clamp-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {completed && (
                <div className="ml-2 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{currentCount} / {requiredCount}</span>
                <span>{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-1.5" 
                indicatorClassName={completed ? "bg-primary" : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
