'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, 
  Brain, 
  Music, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  ChevronRight, 
  Sparkles,
  Smile,
  Meh,
  Frown,
  Laugh
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MOODS = [
  { id: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-400' },
  { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-slate-400' },
  { id: 'smile', icon: Smile, label: 'Good', color: 'text-emerald-400' },
  { id: 'great', icon: Laugh, label: 'Great', color: 'text-purple-400' },
  { id: 'zen', icon: Sparkles, label: 'Zen', color: 'text-amber-400' },
];

const RESOURCES = [
  { title: 'Binaural Beats for Concentration', duration: '60 min', icon: Music },
  { title: '5-Minute Guided Meditation', duration: '5 min', icon: Brain },
  { title: 'Ergonomic Stretches', duration: '8 min', icon: Wind },
];

export default function WellbeingPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerHovered, setIsTimerHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto pb-20 animate-in fade-in duration-1000">
      <div className="space-y-4 text-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <Wind className="h-3 w-3" />
          Mindfulness Protocol
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none">
          Your Mind is Your <span className="text-primary">Greatest Asset.</span>
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
          Academic excellence starts with a balanced mind. Track your energy and find focus in a sanctuary designed for clarity.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-10 space-y-10">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="h-40 w-40 rounded-full border-4 border-primary/30 flex items-center justify-center relative z-10"
          >
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-black text-xs uppercase tracking-widest">Breathe</span>
            </div>
          </motion.div>
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <span>Inhale</span>
          <span>Hold</span>
          <span>Exhale</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-[40px] border-none bg-card shadow-sm overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Daily Energy Sync</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">How does your mind feel today?</p>
            </div>
            
            <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-[28px] transition-all duration-500 min-w-[80px]",
                    selectedMood === mood.id 
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-110" 
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <mood.icon className={cn("h-7 w-7", selectedMood === mood.id ? "text-white" : mood.color)} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <motion.div
          onMouseEnter={() => setIsTimerHovered(true)}
          onMouseLeave={() => setIsTimerHovered(false)}
          layout
          className={cn(
            "rounded-[40px] bg-card border-none shadow-sm overflow-hidden cursor-default transition-all duration-500",
            isTimerHovered ? "ring-2 ring-primary/20" : ""
          )}
        >
          <div className="p-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Focus Protocol</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deep work initialization</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Brain className="h-6 w-6" />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                  <circle
                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={440} strokeDashoffset={440 - (440 * timerProgress) / 100}
                    strokeLinecap="round" className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-foreground tabular-nums font-mono">{formatTime(timeLeft)}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Remaining</span>
                </div>
              </div>

              <AnimatePresence>
                {isTimerHovered && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex items-center gap-4 pt-4 overflow-hidden"
                  >
                    <Button size="icon" onClick={() => setIsTimerActive(!isTimerActive)} className="h-12 w-12 rounded-xl bg-primary text-white shadow-lg">
                      {isTimerActive ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => { setTimeLeft(25 * 60); setIsTimerActive(false); }} className="h-12 w-12 rounded-xl bg-secondary/50 border-none">
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <Card className="rounded-[40px] border-none bg-card shadow-sm overflow-hidden lg:col-span-2">
          <CardContent className="p-10 space-y-10">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Neural Anchors</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resources for synaptic balance</p>
              </div>
              <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest">View Archive</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {RESOURCES.map((res, idx) => (
                <div key={idx} className="group flex flex-col p-8 rounded-[32px] bg-secondary/30 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-500 cursor-pointer">
                  <div className="mb-6 p-4 rounded-2xl bg-card w-fit group-hover:scale-110 transition-transform duration-500">
                    <res.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-black text-foreground mb-2 leading-tight">{res.title}</h4>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{res.duration}</span>
                    <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
