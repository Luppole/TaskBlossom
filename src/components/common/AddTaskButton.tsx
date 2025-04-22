
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  return (
    <Button 
      onClick={onClick} 
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-lg z-40"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add Task</span>
    </Button>
  );
};

export default AddTaskButton;
