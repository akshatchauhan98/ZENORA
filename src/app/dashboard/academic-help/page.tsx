
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { solveImageQuestion } from '@/ai/flows/vision-solver-flow';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  FileText, 
  GraduationCap, 
  Lightbulb, 
  Search,
  MessageSquareQuote,
  Zap,
  Camera,
  Loader2,
  Sparkles,
  Send,
  Copy,
  Download,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { courses } from '@/lib/course-data';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

const MODES = [
  { id: 'Ask Doubt', title: 'Ask Doubt', icon: MessageSquareQuote, description: 'Personal tutor for any query', color: 'bg-blue-500/10 text-blue-500', hover: 'group-hover:bg-blue-500 group-hover:text-white' },
  { id: 'Math Solver', title: 'Math Solver', icon: Calculator, description: 'Step-by-step math visualizations', color: 'bg-indigo-500/10 text-indigo-500', hover: 'group-hover:bg-indigo-500 group-hover:text-white' },
  { id: 'Assignment Helper', title: 'Assignment Pro', icon: FileText, description: 'Research and structural guidance', color: 'bg-sky-500/10 text-sky-500', hover: 'group-hover:bg-sky-500 group-hover:text-white' },
  { id: 'Concept Simplifier', title: 'Concept Builder', icon: Lightbulb, description: 'Break down complex frameworks', color: 'bg-violet-500/10 text-violet-500', hover: 'group-hover:bg-violet-500 group-hover:text-white' },
  { id: 'Exam Prep', title: 'Exam Strategies', icon: GraduationCap, description: 'High-yield study structures', color: 'bg-blue-600/10 text-blue-600', hover: 'group-hover:bg-blue-600 group-hover:text-white' },
  { id: 'Revision Notes', title: 'Quick Summary', icon: Zap, description: 'Concise points for fast learning', color: 'bg-emerald-500/10 text-emerald-500', hover: 'group-hover:bg-emerald-500 group-hover:text-white' },
];

const FALLBACK_SUBJECTS: Record<string, string[]> = {
  'btech-cs': ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Discrete Mathematics'],
  'mba': ['Financial Management', 'Marketing Management', 'Organizational Behavior', 'Business Analytics'],
  'bsc-math': ['Calculus', 'Linear Algebra', 'Real Analysis', 'Differential Equations'],
  'mbbs': ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology'],
};

export default function AcademicHelpPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const dynamicSubjects = useMemo(() => {
    if (!userDoc?.course) return ['General Subject'];
    const courseKey = userDoc.course;
    return FALLBACK_SUBJECTS[courseKey] || ['Other Subject'];
  }, [userDoc?.course]);

  const handleLogActivity = (type: string, subject: string) => {
    if (!user) return;
    const activityRef = collection(firestore, `users/${user.uid}/activityLog`);
    addDoc(activityRef, {
      userId: user.uid,
      activityType: type,
      subject,
      timestamp: serverTimestamp(),
    });
  };

  const handleGetHelp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSubject) {
      toast({ variant: 'destructive', title: 'Subject Required', description: 'Please select your subject track.' });
      return;
    }
    if (!activeMode) {
      toast({ variant: 'destructive', title: 'Method Required', description: 'Select an AI learning method below.' });
      return;
    }
    if (!question.trim()) {
      toast({ variant: 'destructive', title: 'Empty Query', description: 'What are you studying today?' });
      return;
    }

    setIsLoading(true);
    setAiResponse('');

    try {
      const prompt = `You are a specialist academic mentor. Solve this academic query:
      Subject: ${selectedSubject}
      Mode: ${activeMode}
      Context: Course ${userDoc?.course || 'General'}, Semester ${userDoc?.semester || 1}
      Question: ${question.trim()}
      
      Instructions:
      - Use clear Markdown headings (# Title, ## Explanation, etc.)
      - Use LaTeX ($$ $$) for all mathematical expressions.
      - Be concise but thorough.`;

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiResponse(data.result || "");
      handleLogActivity('AI_QUESTION', selectedSubject);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'AI Offline', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setAiResponse('');
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await solveImageQuestion({
            photoDataUri: base64,
            subject: selectedSubject || 'General',
          });
          setAiResponse(result.solution);
          handleLogActivity('IMAGE_SOLVER', selectedSubject || 'General');
        } catch (err: any) {
          toast({ variant: 'destructive', title: 'Analysis Failed', description: err.message });
        } finally {
          setIsUploading(false);
        }
      };
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Vision Error', description: error.message });
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    toast({ title: 'Copied', description: 'Markdown response copied to clipboard.' });
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-20 px-4 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-10 glass-card p-12 rounded-[40px] border-border relative overflow-hidden bg-card/80">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              Academic Specialist
            </h1>
          </div>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] pl-1 ml-13">
            {userDoc?.course ? `${courses.find(c => c.value === userDoc.course)?.label} • Semester ${userDoc.semester}` : 'Your personalized AI learning partner.'}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] ml-2">Academic Track</Label>
            <Select onValueChange={setSelectedSubject} value={selectedSubject || ''} disabled={isLoading}>
              <SelectTrigger className="h-16 rounded-2xl border-border bg-secondary/50 text-foreground font-bold focus:ring-primary hover:bg-secondary transition-all">
                <SelectValue placeholder="Select current subject" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-card border-border backdrop-blur-xl">
                {dynamicSubjects.map((sub) => (
                  <SelectItem key={sub} value={sub} className="rounded-xl font-medium focus:bg-primary focus:text-primary-foreground">{sub}</SelectItem>
                ))}
                <SelectItem value="Other Subject" className="rounded-xl font-medium focus:bg-primary focus:text-primary-foreground">Other Topic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] ml-2">Describe Your Challenge</Label>
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <Input 
                  className="h-16 pl-14 rounded-2xl border-border bg-secondary/50 text-foreground font-bold placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:bg-secondary transition-all"
                  placeholder="Ask a doubt or solve a math problem..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetHelp()}
                />
              </div>
              <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-2xl border-border bg-secondary/50 hover:bg-secondary hover:text-primary transition-all active:scale-95"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
              >
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((mode, idx) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              "group relative flex flex-col items-start p-8 rounded-[32px] glass-card transition-all duration-500 hover:shadow-2xl text-left",
              activeMode === mode.id ? "ring-2 ring-primary bg-secondary/50 scale-[1.05]" : "hover:-translate-y-2 border-transparent",
              `[animation-delay:${idx * 100}ms]`
            )}
          >
            <div className={cn(
              "mb-6 p-5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
              mode.color,
              mode.hover
            )}>
              <mode.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">{mode.title}</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">{mode.description}</p>
            {activeMode === mode.id && (
              <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {aiResponse ? (
        <Card className="rounded-[40px] border-none glass-card overflow-hidden animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-secondary/50 border-b border-border p-10 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-4 text-primary text-xl font-black tracking-tight">
              <Sparkles className="h-6 w-6 animate-pulse" />
              Specialist Insights
            </CardTitle>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="rounded-2xl h-12 w-12 hover:bg-background text-muted-foreground hover:text-foreground transition-all">
                <Copy className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-background text-muted-foreground hover:text-foreground transition-all">
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-12">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-primary prose-headings:font-black prose-p:font-medium prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {aiResponse}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : activeMode && (
        <div className="flex flex-col items-center gap-8 py-20 animate-in fade-in">
          <Button 
            onClick={handleGetHelp} 
            className="h-20 px-20 rounded-[28px] bg-primary text-primary-foreground shadow-primary/20 shadow-2xl text-xl font-black active:scale-95 transition-all group"
            disabled={isLoading || !question.trim() || !selectedSubject}
          >
            {isLoading ? <Loader2 className="mr-4 h-8 w-8 animate-spin" /> : <Send className="mr-4 h-8 w-8 transition-transform group-hover:translate-x-1" />}
            {isLoading ? 'Processing Query...' : 'Analyze Challenge'}
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">Ready to assist with {activeMode}</span>
            <div className="h-px w-8 bg-border" />
          </div>
        </div>
      )}
    </div>
  );
}
