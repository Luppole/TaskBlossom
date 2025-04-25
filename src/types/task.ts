
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

export interface WorkoutSession {
  id: string;
  date: Date;
  type: string;
  duration: number; // in minutes
  notes: string | null;
  exercises: Exercise[];
  userId?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // in kg/lbs
  notes: string | null;
}

export interface MealLog {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  notes: string | null;
  userId?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
}

export interface ProgressLog {
  id: string;
  date: Date;
  weight: number;
  userId?: string;
}

export interface FitnessGoals {
  dailyCalorieGoal: number;
  weeklyWorkoutGoal: number;
  targetWeight?: number;
}
