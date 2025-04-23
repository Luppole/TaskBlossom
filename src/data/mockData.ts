import { Task, TaskCategory } from '../types/task';

export const mockCategories: TaskCategory[] = [
  {
    id: '1',
    name: 'Personal',
    color: '#F7C8E0' // blossom-pink
  },
  {
    id: '2',
    name: 'Work',
    color: '#B4A7D6' // blossom-purple
  },
  {
    id: '3',
    name: 'Health',
    color: '#B9E6C9' // blossom-green
  },
  {
    id: '4',
    name: 'Education',
    color: '#A4C4F4' // blossom-blue
  },
  {
    id: '5',
    name: 'Finance',
    color: '#FFE599' // blossom-yellow
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    completed: false,
    dueDate: new Date(2025, 3, 23, 12, 0), // Tomorrow at noon
    priority: 'high',
    category: mockCategories[1], // Work
    notes: 'Include budget estimates and timeline',
    createdAt: new Date(2025, 3, 20)
  },
  {
    id: '2',
    title: 'Go for a 30-minute run',
    completed: false,
    dueDate: new Date(2025, 3, 22, 8, 0), // Today at 8am
    priority: 'medium',
    category: mockCategories[2], // Health
    notes: null,
    createdAt: new Date(2025, 3, 19)
  },
  {
    id: '3',
    title: 'Pay electricity bill',
    completed: true,
    dueDate: new Date(2025, 3, 20, 23, 59), // Yesterday
    priority: 'high',
    category: mockCategories[4], // Finance
    notes: null,
    createdAt: new Date(2025, 3, 18)
  },
  {
    id: '4',
    title: 'Call mom',
    completed: false,
    dueDate: new Date(2025, 3, 22, 18, 0), // Today at 6pm
    priority: 'medium',
    category: mockCategories[0], // Personal
    notes: null,
    createdAt: new Date(2025, 3, 21)
  },
  {
    id: '5',
    title: 'Review lecture notes',
    completed: false,
    dueDate: new Date(2025, 3, 24, 12, 0), // Day after tomorrow
    priority: 'low',
    category: mockCategories[3], // Education
    notes: 'Focus on chapters 3-5',
    createdAt: new Date(2025, 3, 21)
  },
  {
    id: '6',
    title: 'Buy groceries',
    completed: false,
    dueDate: new Date(2025, 3, 22, 20, 0), // Today at 8pm
    priority: 'medium',
    category: mockCategories[0], // Personal
    notes: 'Milk, eggs, bread, fruits',
    createdAt: new Date(2025, 3, 21)
  },
  {
    id: '7',
    title: 'Submit expense report',
    completed: false,
    dueDate: new Date(2025, 3, 26, 17, 0), // Next week
    priority: 'low',
    category: mockCategories[1], // Work
    notes: null,
    createdAt: new Date(2025, 3, 20)
  }
];

export const motivationalQuotes = [
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Your time is limited, don't waste it living someone else's life.",
  "It always seems impossible until it's done.",
  "The best way to predict the future is to create it.",
  "Small progress is still progress.",
  "Focus on progress, not perfection.",
  "You don't have to be great to start, but you have to start to be great.",
  "Productivity is never an accident. It is always the result of commitment to excellence.",
  "The way to get started is to quit talking and begin doing."
];
