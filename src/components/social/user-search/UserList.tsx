
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User } from 'lucide-react';
import UserCard from './UserCard';

interface UserSearchResult {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  isRequestSent: boolean;
  isFriend: boolean;
}

interface UserListProps {
  users: UserSearchResult[];
  emptyMessage: string;
  isLoading?: boolean;
  onSendFriendRequest: (userId: string) => void;
  onRemoveFriend: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  emptyMessage,
  isLoading = false,
  onSendFriendRequest,
  onRemoveFriend
}) => {
  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading...</span>
      </motion.div>
    );
  }
  
  if (users.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-8 text-muted-foreground"
      >
        <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-4">
      <AnimatePresence>
        {users.map((user, index) => (
          <UserCard 
            key={user.id}
            user={user}
            index={index}
            onSendFriendRequest={onSendFriendRequest}
            onRemoveFriend={onRemoveFriend}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserList;
