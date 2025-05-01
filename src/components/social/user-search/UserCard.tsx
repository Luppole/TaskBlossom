
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Check, UserMinus } from 'lucide-react';

interface UserSearchResult {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  isRequestSent: boolean;
  isFriend: boolean;
}

interface UserCardProps {
  user: UserSearchResult;
  index: number;
  onSendFriendRequest: (userId: string) => void;
  onRemoveFriend: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  index, 
  onSendFriendRequest, 
  onRemoveFriend 
}) => {
  return (
    <motion.div 
      key={user.id} 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-all"
    >
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 transition-transform hover:scale-110">
          <AvatarImage src={user.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {(user.username?.[0] || user.full_name?.[0] || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.full_name || user.username}</p>
          <p className="text-sm text-muted-foreground">@{user.username || user.email?.split('@')[0]}</p>
        </div>
      </div>
      <div>
        {user.isFriend ? (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              onClick={() => onRemoveFriend(user.id)}
            >
              <UserMinus className="h-4 w-4" />
              Unfollow
            </Button>
          </motion.div>
        ) : user.isRequestSent ? (
          <Button disabled variant="outline" size="sm" className="gap-2">
            <Check className="h-4 w-4" />
            Request Sent
          </Button>
        ) : (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 transition-all hover:bg-primary/10 hover:text-primary"
              onClick={() => onSendFriendRequest(user.id)}
            >
              <UserPlus className="h-4 w-4" />
              Follow
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UserCard;
