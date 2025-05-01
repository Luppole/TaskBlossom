
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Users } from 'lucide-react';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
  onShowAll: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  loading,
  onShowAll
}) => {
  return (
    <motion.div 
      className="flex flex-col gap-2 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex gap-2">
        <Input 
          placeholder="Search by name or username"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="transition-all focus:ring-2 focus:ring-primary/20"
        />
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={onSearch}
            disabled={loading || !searchQuery.trim()}
            className="gap-2 transition-transform hover:scale-105"
            variant="default"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAll}
          className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1"
        >
          <Users className="h-3.5 w-3.5" />
          Show all users
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SearchHeader;
