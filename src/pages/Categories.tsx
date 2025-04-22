
import React from 'react';
import { mockCategories, mockTasks } from '@/data/mockData';

const Categories: React.FC = () => {
  // Count tasks for each category
  const categoryCounts = mockCategories.map(category => {
    const totalTasks = mockTasks.filter(task => task.category?.id === category.id).length;
    const completedTasks = mockTasks.filter(
      task => task.category?.id === category.id && task.completed
    ).length;
    
    return {
      ...category,
      totalTasks,
      completedTasks,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  });

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Organize your tasks into meaningful groups
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryCounts.map(category => (
          <div 
            key={category.id}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <h3 className="font-medium">{category.name}</h3>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{category.completedTasks} completed</span>
              <span>{category.totalTasks} total</span>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{ 
                  width: `${category.progress}%`,
                  backgroundColor: category.color 
                }}
              />
            </div>
          </div>
        ))}
        
        {/* Add Category Card */}
        <div className="bg-white rounded-lg border border-dashed p-4 flex flex-col items-center justify-center min-h-[120px] hover:bg-secondary/50 transition-colors cursor-pointer">
          <div className="text-3xl mb-2">+</div>
          <span className="text-muted-foreground">Add Category</span>
        </div>
      </div>
    </div>
  );
};

export default Categories;
