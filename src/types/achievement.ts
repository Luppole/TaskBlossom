
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // Date when badge was unlocked, if null then locked
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: Badge;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string; // Date when achievement was completed
  requiredCount: number;
  currentCount: number;
}
