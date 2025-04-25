
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Exercise, WorkoutSession } from '@/types/task';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: WorkoutSession) => void;
  initialWorkout?: WorkoutSession | null;
}

const workoutTypes = [
  "Upper Body", 
  "Lower Body", 
  "Push",
  "Pull", 
  "Legs", 
  "Full Body", 
  "Cardio", 
  "HIIT", 
  "Yoga",
  "Custom"
];

const WorkoutModal: React.FC<WorkoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialWorkout 
}) => {
  const [type, setType] = useState(initialWorkout?.type || '');
  const [date, setDate] = useState<Date>(initialWorkout?.date || new Date());
  const [duration, setDuration] = useState(initialWorkout?.duration?.toString() || '');
  const [notes, setNotes] = useState(initialWorkout?.notes || '');
  const [exercises, setExercises] = useState<Exercise[]>(initialWorkout?.exercises || []);
  const [customType, setCustomType] = useState('');
  
  useEffect(() => {
    if (initialWorkout) {
      setType(initialWorkout.type);
      setDate(initialWorkout.date);
      setDuration(initialWorkout.duration.toString());
      setNotes(initialWorkout.notes || '');
      setExercises(initialWorkout.exercises || []);
    } else {
      resetForm();
    }
  }, [initialWorkout]);
  
  const resetForm = () => {
    setType('');
    setDate(new Date());
    setDuration('');
    setNotes('');
    setExercises([]);
    setCustomType('');
  };
  
  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      notes: null
    };
    
    setExercises([...exercises, newExercise]);
  };
  
  const handleExerciseChange = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };
  
  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };
  
  const handleSave = () => {
    if (!type || !duration) return;
    
    const finalType = type === 'Custom' ? customType : type;
    
    const workout: WorkoutSession = {
      id: initialWorkout?.id || uuidv4(),
      date,
      type: finalType,
      duration: parseInt(duration),
      notes: notes || null,
      exercises
    };
    
    onSave(workout);
    
    if (!initialWorkout) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialWorkout ? 'Edit Workout' : 'Add Workout'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workout-type">Workout Type</Label>
              <Select 
                value={type} 
                onValueChange={(value) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {type === 'Custom' && (
                <div className="mt-2">
                  <Input 
                    id="custom-type" 
                    placeholder="Enter custom workout type"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter workout duration"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Exercises</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddExercise}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Exercise
              </Button>
            </div>
            
            {exercises.length === 0 ? (
              <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                No exercises added yet. Click 'Add Exercise' to start.
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Exercise {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`name-${exercise.id}`} className="text-xs">Exercise Name</Label>
                        <Input
                          id={`name-${exercise.id}`}
                          value={exercise.name}
                          onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)}
                          placeholder="e.g. Bench Press"
                          className="h-8 mt-1"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor={`sets-${exercise.id}`} className="text-xs">Sets</Label>
                          <Input
                            id={`sets-${exercise.id}`}
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseChange(exercise.id, 'sets', parseInt(e.target.value))}
                            className="h-8 mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`reps-${exercise.id}`} className="text-xs">Reps</Label>
                          <Input
                            id={`reps-${exercise.id}`}
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseChange(exercise.id, 'reps', parseInt(e.target.value))}
                            className="h-8 mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`weight-${exercise.id}`} className="text-xs">Weight</Label>
                          <Input
                            id={`weight-${exercise.id}`}
                            type="number"
                            min="0"
                            value={exercise.weight}
                            onChange={(e) => handleExerciseChange(exercise.id, 'weight', parseInt(e.target.value))}
                            className="h-8 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Label htmlFor={`notes-${exercise.id}`} className="text-xs">Notes (optional)</Label>
                      <Input
                        id={`notes-${exercise.id}`}
                        value={exercise.notes || ''}
                        onChange={(e) => handleExerciseChange(exercise.id, 'notes', e.target.value || null)}
                        placeholder="Any notes about this exercise"
                        className="h-8 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this workout"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {initialWorkout ? 'Update' : 'Save'} Workout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutModal;
