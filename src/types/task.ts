
export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskCategory = {
  id: string;
  name: string;
  color: string;
};

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string | null;
  dueDate?: Date;
  priority: TaskPriority;
  category?: TaskCategory;
  notes: string | null;
  createdAt: Date;
}
