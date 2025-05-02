
import React from 'react';
import { Badge } from '@/types/achievement';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Badge as BadgeIcon, Star, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ 
  badge, 
  size = 'md',
  showTooltip = true
}) => {
  const isUnlocked = !!badge.unlockedAt;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const getBadgeIcon = () => {
    switch(badge.icon) {
      case 'star': return <Star className="h-full w-full" />;
      case 'award': return <Award className="h-full w-full" />;
      case 'trophy': return <Trophy className="h-full w-full" />;
      case 'sparkles': return <Sparkles className="h-full w-full" />;
      default: return <BadgeIcon className="h-full w-full" />;
    }
  };
  
  const getRarityColors = () => {
    if (!isUnlocked) return 'from-gray-400 to-gray-500 text-gray-300';
    
    switch(badge.rarity) {
      case 'common': return 'from-blue-400 to-blue-600 text-blue-100';
      case 'uncommon': return 'from-green-400 to-green-600 text-green-100';
      case 'rare': return 'from-purple-500 to-purple-700 text-purple-100';
      case 'epic': return 'from-pink-500 to-pink-700 text-pink-100';
      case 'legendary': return 'from-amber-400 to-amber-600 text-amber-100';
      default: return 'from-blue-400 to-blue-600 text-blue-100';
    }
  };
  
  const BadgeComponent = () => (
    <motion.div
      initial={isUnlocked ? { scale: 0.8, opacity: 0 } : { scale: 1 }}
      animate={isUnlocked ? { scale: 1, opacity: 1 } : { scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        sizeClasses[size],
        'rounded-full flex items-center justify-center bg-gradient-to-br p-0.5',
        getRarityColors()
      )}
    >
      <div className={cn(
        'rounded-full flex items-center justify-center w-full h-full',
        isUnlocked ? 'bg-background/10 backdrop-blur-sm' : 'bg-background/50'
      )}>
        {getBadgeIcon()}
        {!isUnlocked && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <BadgeIcon className="h-1/2 w-1/2 text-gray-400 opacity-60" />
          </div>
        )}
      </div>
    </motion.div>
  );
  
  if (!showTooltip) return <BadgeComponent />;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <BadgeComponent />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            {isUnlocked ? (
              <p className="text-xs text-muted-foreground">
                Unlocked on {new Date(badge.unlockedAt!).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground font-medium">🔒 Locked</p>
            )}
            <p className={cn(
              "text-xs uppercase font-bold",
              badge.rarity === 'common' && "text-blue-500",
              badge.rarity === 'uncommon' && "text-green-500",
              badge.rarity === 'rare' && "text-purple-500",
              badge.rarity === 'epic' && "text-pink-500",
              badge.rarity === 'legendary' && "text-amber-500",
            )}>
              {badge.rarity}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BadgeDisplay;
