
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
  dueDate?: Date;
  priority: TaskPriority;
  category?: TaskCategory;
  notes?: string;
  createdAt: Date;
}
