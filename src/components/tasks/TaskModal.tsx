
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, CalendarIcon, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskPriority, TaskCategory } from '@/types/task';
import { defaultCategories } from '@/data/taskData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/contexts/FirebaseContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task;
  initialDate?: Date;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTask,
  initialDate
}) => {
  const { user, getCategories } = useFirebase();
  const [title, setTitle] = useState(initialTask?.title || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialTask?.dueDate || initialDate || undefined);
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'medium');
  const [categoryId, setCategoryId] = useState<string | undefined>(initialTask?.category?.id || undefined);
  const [categories, setCategories] = useState<TaskCategory[]>(defaultCategories);
  
  useEffect(() => {
    const loadCategories = async () => {
      if (user) {
        try {
          const fetchedCategories = await getCategories();
          if (fetchedCategories.length > 0) {
            setCategories(fetchedCategories);
          }
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      }
    };
    
    loadCategories();
  }, [user, getCategories]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const category = categoryId 
      ? categories.find(cat => cat.id === categoryId) 
      : undefined;
    
    const newTask: Task = {
      id: initialTask?.id || uuidv4(),
      title,
      completed: initialTask?.completed || false,
      dueDate,
      priority,
      category,
      notes: notes.trim() || null,
      createdAt: initialTask?.createdAt || new Date(),
    };
    
    onSave(newTask);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup 
              value={priority} 
              onValueChange={(value) => setPriority(value as TaskPriority)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Low
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  High
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
