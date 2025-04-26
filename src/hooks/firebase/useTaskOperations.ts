
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types/task';
import { useFirebaseUser } from './useFirebaseUser';
import { useContext } from 'react';
import { FirebaseContext } from '@/contexts/FirebaseContext';

export const useTaskOperations = () => {
  const { user } = useFirebaseUser();
  const context = useContext(FirebaseContext);
  
  const getTasks = async () => {
    if (!user) {
      // Return local tasks if no user is authenticated
      return context?.getLocalTasks() || [];
    }
    
    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
          createdAt: data.createdAt.toDate(),
          notes: data.notes || null
        } as Task;
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) {
      // Use local task creation for guests
      if (context?.createLocalTask) {
        return context.createLocalTask(taskData);
      }
      throw new Error('No context available for local task creation');
    }
    
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
      throw error;
    }
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    if (!user) {
      // Use local task update for guests
      if (context?.updateLocalTask) {
        return context.updateLocalTask(taskId, data);
      }
      throw new Error('No context available for local task update');
    }
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      
      const firestoreData: Record<string, any> = { ...data };
      if (firestoreData.dueDate instanceof Date) {
        firestoreData.dueDate = Timestamp.fromDate(firestoreData.dueDate);
      }
      
      await updateDoc(taskRef, firestoreData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) {
      // Use local task deletion for guests
      if (context?.deleteLocalTask) {
        return context.deleteLocalTask(taskId);
      }
      throw new Error('No context available for local task deletion');
    }
    
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
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
