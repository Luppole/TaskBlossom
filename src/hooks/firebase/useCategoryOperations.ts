
import { collection, doc, setDoc, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TaskCategory } from '@/types/task';
import { useFirebaseUser } from './useFirebaseUser';
import { toast } from 'sonner';

export const useCategoryOperations = () => {
  const { user } = useFirebaseUser();

  const getCategories = async () => {
    if (!user) return [];
    
    try {
      console.log("Fetching categories for user:", user.uid);
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const q = query(categoriesRef);
      const querySnapshot = await getDocs(q);
      
      console.log("Categories fetch completed, count:", querySnapshot.size);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TaskCategory));
    } catch (error) {
      console.error('Error getting categories:', error);
      toast.error('Failed to load categories');
      return [];
    }
  };

  const saveCategories = async (categories: TaskCategory[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      for (const category of categories) {
        const categoryRef = doc(db, 'users', user.uid, 'categories', category.id);
        await setDoc(categoryRef, {
          name: category.name,
          color: category.color
        });
      }
      
      console.log(`Saved ${categories.length} categories successfully`);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Failed to save categories');
      throw error;
    }
  };

  return {
    getCategories,
    saveCategories,
  };
};
