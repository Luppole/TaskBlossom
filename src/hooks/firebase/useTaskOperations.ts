
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types/task';
import { useFirebaseUser } from './useFirebaseUser';
import { toast } from 'sonner';

export const useTaskOperations = () => {
  const { user } = useFirebaseUser();

  const getTasks = async () => {
    if (!user) return [];
    
    try {
      console.log("Fetching tasks for user:", user.uid);
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log("Tasks fetch completed, count:", querySnapshot.size);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          notes: data.notes || null
        } as Task;
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      
      // Check for specific permission errors
      if (error.toString().includes("Missing or insufficient permissions")) {
        toast.error("Permission error accessing tasks. Please check Firebase rules.");
      } else {
        toast.error("Failed to load tasks");
      }
      
      return [];
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(collection(db, 'users', user.uid, 'tasks'));
      const now = new Date();
      
      const task: Task = {
        ...taskData,
        id: taskRef.id,
        createdAt: now,
        notes: taskData.notes || null
      };
      
      const firestoreTask = {
        ...task,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        createdAt: Timestamp.fromDate(now)
      };
      
      await setDoc(taskRef, firestoreTask);
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      
      const firestoreData: Record<string, any> = { ...data };
      if (firestoreData.dueDate instanceof Date) {
        firestoreData.dueDate = Timestamp.fromDate(firestoreData.dueDate);
      }
      
      await updateDoc(taskRef, firestoreData);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  return {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
