'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Star, 
  Trash2, 
  Loader2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { StudyTimer } from '@/components/study-timer';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'History', 'Literature', 'Economics', 'Other'];
const PRIORITIES = [
  { label: 'High', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: '🔴' },
  { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🟡' },
  { label: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '🟢' },
];

export default function StudentPlannerPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    subject: 'Mathematics',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    priority: 'Medium',
    repeatType: 'None',
  });

  const tasksRef = useMemoFirebase(() => collection(firestore, 'tasks'), [firestore]);
  const userTasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(tasksRef, where('userId', '==', user.uid));
  }, [user, tasksRef]);

  const { data: rawTasks, isLoading } = useCollection(userTasksQuery);

  const allTasks = useMemo(() => {
    if (!rawTasks) return [];
    return [...rawTasks].sort((a, b) => {
      if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      return (a.time || '').localeCompare(b.time || '');
    });
  }, [rawTasks]);

  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = addDays(today, 1);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    return allTasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      if (activeTab === 'today') return isSameDay(taskDate, today);
      if (activeTab === 'tomorrow') return isSameDay(taskDate, tomorrow);
      if (activeTab === 'week') return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
      return true;
    });
  }, [allTasks, activeTab]);

  const stats = useMemo(() => {
    if (!filteredTasks) return { total: 0, completed: 0, percentage: 0 };
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.isCompleted).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, percentage };
  }, [filteredTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTask.title.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(tasksRef, {
        ...newTask,
        userId: user.uid,
        isCompleted: false,
        isStarred: false,
        createdAt: serverTimestamp(),
      });
      setIsAddDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        subject: 'Mathematics',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        priority: 'Medium',
        repeatType: 'None',
      });
      toast({ title: 'Task Initialized', description: 'Your study plan has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (taskId: string, current: boolean) => {
    const taskDoc = doc(firestore, `tasks/${taskId}`);
    try {
      await updateDoc(taskDoc, { isCompleted: !current });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: e.message });
    }
  };

  const toggleStar = async (taskId: string, current: boolean) => {
    const taskDoc = doc(firestore, `tasks/${taskId}`);
    try {
      await updateDoc(taskDoc, { isStarred: !current });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync Error', description: e.message });
    }
  };

  const deleteTask = async (taskId: string) => {
    const taskDoc = doc(firestore, `tasks/${taskId}`);
    try {
      await deleteDoc(taskDoc);
      toast({ title: 'Task Deleted', description: 'Removed from your neural planner.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: e.message });
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-20 animate-in fade-in duration-1000">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 p-10 rounded-[40px] bg-card/60 backdrop-blur-3xl border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
        
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary vibrant-blue-glow flex items-center justify-center">
              <CalendarIcon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Daily Planner</h1>
              <p className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Strategic Workspace</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Momentum</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-foreground">{Math.round(stats.percentage)}%</span>
                <Progress value={stats.percentage} className="h-2 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completed</p>
              <p className="text-2xl font-black text-primary">{stats.completed} <span className="text-muted-foreground text-sm font-bold">/ {stats.total}</span></p>
            </div>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 rounded-2xl gap-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-[1.03] transition-all vibrant-blue-glow border-none shadow-lg">
              <Plus className="h-5 w-5" />
              New Objective
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[32px] bg-card border-none p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Initialize Task</DialogTitle>
              <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Neural Planning Protocol</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Task Title</Label>
                <Input 
                  placeholder="e.g., Quantum Mechanics Revision" 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="h-12 rounded-xl bg-secondary border-none font-bold text-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Subject</Label>
                  <Select value={newTask.subject} onValueChange={v => setNewTask({...newTask, subject: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary border-none font-bold text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Priority</Label>
                  <Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary border-none font-bold text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {PRIORITIES.map(p => <SelectItem key={p.label} value={p.label}>{p.icon} {p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Due Date</Label>
                  <Input 
                    type="date" 
                    value={newTask.date} 
                    onChange={e => setNewTask({...newTask, date: e.target.value})}
                    className="h-12 rounded-xl bg-secondary border-none font-bold text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Set Time</Label>
                  <Input 
                    type="time" 
                    value={newTask.time} 
                    onChange={e => setNewTask({...newTask, time: e.target.value})}
                    className="h-12 rounded-xl bg-secondary border-none font-bold text-foreground"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                  Deploy Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Study Command Center (Timer/Stopwatch) */}
      <StudyTimer tasks={allTasks} />

      {/* Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-card/40 backdrop-blur-xl rounded-[24px] border border-border w-fit">
          {(['today', 'tomorrow', 'week'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                activeTab === tab 
                  ? "bg-primary text-primary-foreground shadow-lg vibrant-blue-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
          <Sparkles className="h-4 w-4" />
          {filteredTasks.length} Active Protocols
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Neural Grid...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task, idx) => (
            <div 
              key={task.id}
              className={cn(
                "group flex items-center gap-6 p-6 rounded-[28px] glass-card border-border hover:border-primary/20 transition-all duration-500 animate-slide-up",
                task.isCompleted && "opacity-60",
                `[animation-delay:${idx * 50}ms]`
              )}
            >
              <div className="flex items-center justify-center">
                <Checkbox 
                  checked={task.isCompleted} 
                  onCheckedChange={() => toggleComplete(task.id, task.isCompleted)}
                  className="h-7 w-7 rounded-lg border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={cn(
                    "text-lg font-black tracking-tight truncate",
                    task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {task.title}
                  </h3>
                  {task.isStarred && <Star className="h-4 w-4 text-amber-400 fill-current" />}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="h-3.5 w-3.5" />
                    {task.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {task.subject}
                  </div>
                  <Badge className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                    PRIORITIES.find(p => p.label === task.priority)?.bg,
                    PRIORITIES.find(p => p.label === task.priority)?.color,
                    PRIORITIES.find(p => p.label === task.priority)?.border
                  )}>
                    {task.priority}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleStar(task.id, task.isStarred)}
                  className={cn("h-10 w-10 rounded-xl", task.isStarred ? "text-amber-400" : "text-muted-foreground hover:text-foreground")}
                >
                  <Star className={cn("h-5 w-5", task.isStarred && "fill-current")} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTask(task.id)}
                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[40px] border-dashed border-border bg-transparent">
            <TrendingUp className="h-16 w-16 text-muted-foreground/10 mb-6" />
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Zero Objectives Found</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">Initialize a new neural protocol to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}