
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TaskCategory } from '@/types/task';
import { useFirebaseUser } from './useFirebaseUser';

export const useCategoryOperations = () => {
  const { user } = useFirebaseUser();

  const getCategories = async () => {
    if (!user) return [];
    
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TaskCategory));
    } catch (error) {
      console.error('Error getting categories:', error);
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
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  };

  return {
    getCategories,
    saveCategories,
  };
};
