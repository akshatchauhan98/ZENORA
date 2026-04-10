
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Clock as StopwatchIcon, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StudyTimerProps {
  tasks: any[];
}

export function StudyTimer({ tasks }: StudyTimerProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const [timerInput, setTimerInput] = useState('25'); // in minutes
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Formatting HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (mode === 'stopwatch') return prev + 1;
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    toast({
      title: 'Neural Link Completed',
      description: 'Focus session concluded. Activity logged to grid.',
    });
    
    saveSession(parseInt(timerInput) * 60);
  };

  const toggleStart = () => {
    if (!isRunning && mode === 'timer' && time === 0) {
      const seconds = parseInt(timerInput) * 60;
      if (isNaN(seconds) || seconds <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Duration', description: 'Enter minutes for the neural timer.' });
        return;
      }
      setTime(seconds);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const saveSession = async (duration: number) => {
    if (!user || duration <= 0) return;

    try {
      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      
      // Save to sessions log
      await addDoc(collection(firestore, 'studySessions'), {
        userId: user.uid,
        taskId: selectedTaskId === 'none' ? null : selectedTaskId,
        taskTitle: selectedTask ? selectedTask.title : 'General Study',
        duration,
        date: new Date().toISOString().split('T')[0],
        type: mode,
        timestamp: serverTimestamp(),
      });

      // Update global activity log for dashboard visibility
      await addDoc(collection(firestore, `users/${user.uid}/activityLog`), {
        userId: user.uid,
        activityType: 'STUDY_SESSION',
        subject: selectedTask ? selectedTask.subject : 'General',
        duration,
        timestamp: serverTimestamp(),
      });

    } catch (error: any) {
      console.error('Session Save Error:', error);
    }
  };

  // Switch modes
  const handleModeChange = (newMode: 'stopwatch' | 'timer') => {
    if (isRunning) {
      if (!confirm('Switching modes will interrupt the current link. Proceed?')) return;
    }
    setIsRunning(false);
    setMode(newMode);
    setTime(0);
  };

  // Timer Progress Percentage
  const progressPercentage = mode === 'timer' && time > 0 
    ? (time / (parseInt(timerInput) * 60)) * 100 
    : 0;

  return (
    <Card className="rounded-[40px] bg-[#171B31]/60 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-linear" 
          style={{ width: `${mode === 'timer' ? 100 - progressPercentage : 0}%` }} 
        />
      </div>

      <CardHeader className="p-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              {mode === 'stopwatch' ? <StopwatchIcon className="h-6 w-6" /> : <Timer className="h-6 w-6" />}
            </div>
            <div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Study Command Center</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-1">Neural Focus Protocol</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-2xl border border-white/5">
            <button
              onClick={() => handleModeChange('stopwatch')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                mode === 'stopwatch' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              )}
            >
              Stopwatch
            </button>
            <button
              onClick={() => handleModeChange('timer')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                mode === 'timer' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
              )}
            >
              Timer
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Main Display */}
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative group">
              {/* Pulse Ring */}
              <div className={cn(
                "absolute -inset-4 rounded-full border-2 border-primary/10 transition-all duration-1000",
                isRunning && "animate-pulse border-primary/30"
              )} />
              
              <div className="text-7xl md:text-8xl font-black text-white tracking-tighter font-mono flex items-center tabular-nums">
                {formatTime(time)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={toggleStart}
                className={cn(
                  "h-16 w-16 rounded-full transition-all active:scale-90 vibrant-blue-glow border-none",
                  isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-primary/90 text-white"
                )}
              >
                {isRunning ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="h-16 w-16 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-90"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Assign Objective</Label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-900 border-white/5 font-bold text-white focus:ring-primary">
                  <SelectValue placeholder="Select current task" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl">
                  <SelectItem value="none">General Neural Focus</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id} className="rounded-xl">
                      {task.title} ({task.subject})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {mode === 'timer' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Session Duration (Minutes)</Label>
                <div className="flex gap-3">
                  {['15', '25', '45', '60'].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => { setTimerInput(mins); setTime(parseInt(mins) * 60); }}
                      className={cn(
                        "flex-1 h-12 rounded-xl border border-white/5 text-xs font-black transition-all",
                        timerInput === mins ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Custom minutes..."
                  value={timerInput}
                  onChange={(e) => { setTimerInput(e.target.value); setTime(parseInt(e.target.value || '0') * 60); }}
                  className="h-14 rounded-2xl bg-slate-900 border-white/5 font-bold text-white text-center"
                  disabled={isRunning}
                />
              </div>
            )}

            {mode === 'stopwatch' && isRunning && (
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <LayoutDashboard className="h-5 w-5 text-primary animate-spin-slow" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Tracking Active</p>
                    <p className="text-sm font-bold text-white mt-1">
                      {selectedTaskId === 'none' ? 'Synthesizing General Knowledge' : `Focused on: ${tasks.find(t => t.id === selectedTaskId)?.title}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
