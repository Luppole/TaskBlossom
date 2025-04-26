
import { TaskCategory } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

// Motivational quotes for the Today page
export const motivationalQuotes = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Believe you can and you're halfway there.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "You are never too old to set another goal or to dream a new dream.",
  "Strive not to be a success, but rather to be of value.",
  "The best time to plant a tree was 20 years ago. The second best time is now."
];

// Default task categories
export const defaultCategories: TaskCategory[] = [
  {
    id: uuidv4(),
    name: 'Work',
    color: '#4285F4'
  },
  {
    id: uuidv4(),
    name: 'Personal',
    color: '#EA4335'
  },
  {
    id: uuidv4(),
    name: 'Health',
    color: '#34A853'
  },
  {
    id: uuidv4(),
    name: 'Learning',
    color: '#FBBC05'
  }
];
