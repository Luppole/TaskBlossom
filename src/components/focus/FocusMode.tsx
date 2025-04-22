
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Clock, Focus, PauseCircle, PlayCircle, Volume2 } from 'lucide-react';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose }) => {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [volume, setVolume] = useState(50);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);
  
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(25 * 60);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5" /> Focus Mode
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-8 flex flex-col items-center justify-center space-y-8">
          <motion.div 
            className="text-5xl font-mono font-bold"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatTime()}
          </motion.div>
          
          <div className="flex gap-4 items-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={toggleTimer}
            >
              {isRunning ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetTimer}
            >
              Reset
            </Button>
          </div>
          
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Volume</span>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <Slider 
              value={[volume]} 
              min={0} 
              max={100} 
              step={1} 
              onValueChange={(value) => setVolume(value[0])}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FocusMode;
