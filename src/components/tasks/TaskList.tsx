
import React from 'react';
import { Task } from '@/types/task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-4xl mb-4 animate-float">✨</div>
        <h3 className="text-xl font-medium mb-2">No tasks here!</h3>
        <p className="text-muted-foreground">
          You're all caught up. Add a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
};

export default TaskList;
