
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TaskFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filter, onFilterChange }) => {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      <Badge 
        variant={filter === 'all' ? "default" : "outline"} 
        className="cursor-pointer"
        onClick={() => onFilterChange('all')}
      >
        All
      </Badge>
      <Badge 
        variant={filter === 'pending' ? "default" : "outline"} 
        className="cursor-pointer"
        onClick={() => onFilterChange('pending')}
      >
        Pending
      </Badge>
      <Badge 
        variant={filter === 'completed' ? "default" : "outline"} 
        className="cursor-pointer"
        onClick={() => onFilterChange('completed')}
      >
        Completed
      </Badge>
      <Badge 
        variant={filter === 'overdue' ? "default" : "outline"} 
        className="cursor-pointer"
        onClick={() => onFilterChange('overdue')}
      >
        Overdue
      </Badge>
    </div>
  );
};

export default TaskFilters;
