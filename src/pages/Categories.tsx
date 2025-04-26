
import React, { useState, useEffect } from 'react';
import { defaultCategories } from '@/data/taskData';
import { TaskCategory } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Categories: React.FC = () => {
  const { user, getCategories, saveCategories, getTasks } = useFirebase();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#B4A7D6');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  
  // Load categories and tasks
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (user) {
          console.log("Loading categories data...");
          // Load categories from Firebase
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories.length > 0 ? fetchedCategories : defaultCategories);
          
          // Load tasks for calculating progress
          const fetchedTasks = await getTasks();
          setTasks(fetchedTasks);
          console.log(`Loaded ${fetchedTasks.length} tasks and ${fetchedCategories.length} categories`);
        } else {
          // Use default categories for non-logged in users
          setCategories(defaultCategories);
          setTasks([]);
          toast.error("Please login to view your categories");
          navigate('/login');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error : new Error('Unknown error occurred'));
        toast.error('Failed to load categories');
        setCategories(defaultCategories);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, getCategories, getTasks, navigate]);
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: TaskCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor
    };
    
    try {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      
      if (user) {
        // Save to Firebase if user is logged in
        await saveCategories(updatedCategories);
        toast.success('Category added');
      }
      
      setNewCategoryName('');
      setNewCategoryColor('#B4A7D6');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };
  
  const getTaskCountForCategory = (categoryId: string) => {
    return tasks.filter(task => task.category?.id === categoryId).length;
  };
  
  const getCompletedTaskCountForCategory = (categoryId: string) => {
    return tasks.filter(task => 
      task.category?.id === categoryId && task.completed
    ).length;
  };
  
  const calculateProgress = (categoryId: string) => {
    const total = getTaskCountForCategory(categoryId);
    if (total === 0) return 0;
    
    const completed = getCompletedTaskCountForCategory(categoryId);
    return Math.round((completed / total) * 100);
  };
  
  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="mb-6">You need to be logged in to view and manage categories</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Organize your tasks into custom categories
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </header>
      
      {error && (
        <Card className="mb-6 border-red-300">
          <CardContent className="p-4 text-center">
            <p className="text-red-500">Error loading categories. Please try again.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()} 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-70">
              <CardContent className="p-4 h-24 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const taskCount = getTaskCountForCategory(category.id);
            const progress = calculateProgress(category.id);
            
            return (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-heading text-lg font-semibold">{category.name}</h3>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {taskCount} tasks · {progress}% complete
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${progress}%`, 
                        backgroundColor: category.color
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="Work, Personal, Health..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-10 h-10 rounded-md border-0 cursor-pointer"
                />
                <div className="flex-1">
                  <Input
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
