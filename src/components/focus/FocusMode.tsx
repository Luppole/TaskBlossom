
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Clock, Focus, PauseCircle, PlayCircle, Volume2, CheckCircle2, RefreshCw } from 'lucide-react';
import useSound from 'use-sound';
import confetti from 'canvas-confetti';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUS_TIMES = [
  { label: '5 min', value: 5 * 60 },
  { label: '15 min', value: 15 * 60 },
  { label: '25 min', value: 25 * 60 },
  { label: '45 min', value: 45 * 60 },
  { label: '60 min', value: 60 * 60 },
];

const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose }) => {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isComplete, setIsComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Sound effects
  const [playStart] = useSound('/sounds/start.mp3', { volume: volume / 100 });
  const [playTick] = useSound('/sounds/tick.mp3', { volume: (volume / 100) * 0.5 });
  const [playComplete] = useSound('/sounds/complete.mp3', { volume: volume / 100 });
  
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (tickInterval.current) {
        clearInterval(tickInterval.current);
      }
    };
  }, []);
  
  // Handle the timer
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      tickInterval.current = setInterval(() => {
        setTimeRemaining((prev) => {
          // Play tick sound every 15 seconds
          if (prev % 15 === 0 && prev > 0 && !isMuted) {
            playTick();
          }
          
          // When time is up
          if (prev <= 1) {
            if (tickInterval.current) clearInterval(tickInterval.current);
            setIsRunning(false);
            setIsComplete(true);
            
            // Play completion sound and show celebration
            if (!isMuted) {
              playComplete();
            }
            
            // Trigger confetti celebration
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 }
            });
            
            return 0;
          }
          
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && tickInterval.current) {
      clearInterval(tickInterval.current);
    }
    
    return () => {
      if (tickInterval.current) {
        clearInterval(tickInterval.current);
      }
    };
  }, [isRunning, timeRemaining, isMuted, playTick, playComplete]);
  
  // Format the time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = () => {
    if (initialTime === 0) return 0;
    return ((initialTime - timeRemaining) / initialTime) * 100;
  };
  
  const toggleTimer = () => {
    // Start timer
    if (!isRunning && timeRemaining > 0) {
      setIsRunning(true);
      if (!isMuted) {
        playStart();
      }
    } 
    // Pause timer
    else if (isRunning) {
      setIsRunning(false);
    }
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(initialTime);
    setIsComplete(false);
    if (tickInterval.current) {
      clearInterval(tickInterval.current);
    }
  };
  
  const selectTime = (seconds: number) => {
    setInitialTime(seconds);
    setTimeRemaining(seconds);
    setIsComplete(false);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5" /> Focus Mode
          </DialogTitle>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div 
              key="timer"
              className="py-8 flex flex-col items-center justify-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Time selection chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {FOCUS_TIMES.map((time) => (
                  <Badge 
                    key={time.value}
                    variant={initialTime === time.value ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => !isRunning && selectTime(time.value)}
                  >
                    {time.label}
                  </Badge>
                ))}
              </div>
              
              {/* Timer circle */}
              <motion.div 
                className="relative flex items-center justify-center"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg width="200" height="200" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="5"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progressPercentage() / 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                      rotate: -90,
                      transformOrigin: "center",
                      strokeDasharray: "283",
                      strokeDashoffset: "0",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div 
                    className="text-5xl font-mono font-bold"
                    key={timeRemaining}
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatTime()}
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Controls */}
              <div className="flex gap-4 items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full"
                    onClick={toggleTimer}
                    disabled={timeRemaining === 0}
                  >
                    {isRunning ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetTimer}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </motion.div>
              </div>
              
              {/* Volume control */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Volume</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={toggleMute}
                  >
                    <Volume2 className={`h-4 w-4 ${isMuted ? 'text-muted-foreground' : 'text-primary'}`} />
                  </Button>
                </div>
                <Slider 
                  value={[volume]} 
                  min={0} 
                  max={100} 
                  step={1} 
                  onValueChange={(value) => setVolume(value[0])}
                  disabled={isMuted}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="complete"
              className="py-8 flex flex-col items-center justify-center space-y-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-center">Great job!</h3>
              <p className="text-center text-muted-foreground">
                You've completed your focus session. Take a short break before starting another one.
              </p>
              
              <div className="flex gap-4 mt-4">
                <Button onClick={resetTimer} variant="outline">
                  Start Again
                </Button>
                <Button onClick={onClose}>
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FocusMode;
