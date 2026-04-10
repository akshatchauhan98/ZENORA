
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileQuestion, 
  Loader2, 
  Trophy, 
  RotateCcw,
  Play,
  Timer,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Progress } from '@/components/ui/progress';

function MathText({ text }: { text: string }) {
  const cleaned = (text || "").replace(/\$\$([a-zA-Z0-9\s])\$\$/g, '$1');
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className="prose-slate dark:prose-invert max-w-none text-inherit font-medium"
    >
      {cleaned}
    </ReactMarkdown>
  );
}

export default function MockTestsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState('5');
  const [timeLimit, setTimeLimit] = useState('10');
  const [isUntimed, setIsUntimed] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [test, setTest] = useState<any | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, skipped: 0 });

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  useEffect(() => {
    if (testStarted && timeLeft > 0 && !isUntimed) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, timeLeft === 0, isUntimed]);

  const handleGenerateTest = async () => {
    const qCount = parseInt(numQuestions);
    const tLimit = parseInt(timeLimit);

    if (!subject.trim()) {
      toast({ variant: 'destructive', title: 'Subject Required', description: 'Please enter a subject or topic.' });
      return;
    }

    setIsGenerating(true);
    setTest(null);
    setTestStarted(false);
    setShowResults(false);
    setUserAnswers({});
    
    try {
      const prompt = `Generate a rigorous academic mock test for the following:
      Subject: ${subject}
      Difficulty: ${difficulty}
      Questions Required: ${qCount}
      
      IMPORTANT: Return ONLY a JSON object. No markdown text outside the JSON.
      Structure:
      {
        "title": "Mock Test Name",
        "questions": [
          {
            "id": "1",
            "questionText": "Question text with LaTeX math wrapped in $$ $$ if needed",
            "options": ["A text", "B text", "C text", "D text"],
            "correctAnswer": "A"
          }
        ]
      }`;

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, format: 'json' }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // result might be stringified JSON or already an object depending on the route's output
      const parsedTest = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      
      if (!parsedTest || !parsedTest.questions) {
        throw new Error("Assessment synthesis was incomplete.");
      }

      setTest(parsedTest);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Synthesis Failed', description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    if (!isUntimed) {
      setTimeLeft(parseInt(timeLimit) * 60);
    } else {
      setTimeLeft(0);
    }
  };

  const handleSubmitTest = () => {
    if (!test || showResults) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    test.questions.forEach((q: any) => {
      const selectedLetter = userAnswers[q.id];
      if (!selectedLetter) {
        skippedCount++;
      } else if (selectedLetter === q.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });
    
    const finalScore = (correctCount / test.questions.length) * 100;
    setScore(Math.round(finalScore));
    setStats({ correct: correctCount, wrong: wrongCount, skipped: skippedCount });
    setShowResults(true);

    if (user) {
      const activityRef = collection(firestore, `users/${user.uid}/activityLog`);
      addDoc(activityRef, {
        userId: user.uid,
        activityType: 'MOCK_TEST_ATTEMPTED',
        subject,
        score: finalScore,
        correct: correctCount,
        total: test.questions.length,
        timestamp: serverTimestamp(),
      });
    }
  };

  const handleReset = () => {
    setTest(null);
    setTestStarted(false);
    setShowResults(false);
    setUserAnswers({});
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progress = test ? (answeredCount / test.questions.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20 px-4 font-lexend">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Mock Test Specialist
          </h1>
        </div>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-13 pl-1">
          Precision Assessment Grid
        </p>
      </div>

      {!test ? (
        <Card className="rounded-[40px] border-border bg-card shadow-sm overflow-hidden animate-in fade-in duration-700">
          <CardHeader className="bg-secondary/50 p-10 border-b border-border">
            <CardTitle className="flex items-center gap-4 text-foreground text-2xl font-black uppercase tracking-tight">
              <FileQuestion className="h-7 w-7 text-primary" />
              Configure Assessment
            </CardTitle>
            <CardDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-2">
              Neural parameters for target mock exam
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-widest ml-2">Subject / Knowledge Domain</Label>
                <Input
                  className="h-14 rounded-2xl border-border bg-background dark:bg-[#1A1D24] text-foreground dark:text-[#F9FAFB] px-6 font-bold focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-0 placeholder:text-[#94A3B8] transition-all shadow-sm"
                  placeholder="e.g., Quantum Physics, Corporate Law"
                  value={subject || ""}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-widest ml-2">Complexity Level</Label>
                <Select onValueChange={setDifficulty} value={difficulty || "Medium"}>
                  <SelectTrigger className="h-14 rounded-2xl border-border bg-background dark:bg-[#1A1D24] text-foreground dark:text-[#F9FAFB] font-bold focus:ring-2 focus:ring-[#3B82F6] transition-all shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-card border-border">
                    <SelectItem value="Easy" className="rounded-xl font-bold">Easy</SelectItem>
                    <SelectItem value="Medium" className="rounded-xl font-bold">Medium</SelectItem>
                    <SelectItem value="Hard" className="rounded-xl font-bold">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-widest ml-2">Quantity (1-100 Items)</Label>
                <Input
                  type="number"
                  className="h-14 rounded-2xl border-border bg-background dark:bg-[#1A1D24] text-foreground dark:text-[#F9FAFB] px-6 font-bold focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-0 placeholder:text-[#94A3B8] transition-all shadow-sm"
                  placeholder="Enter count"
                  value={numQuestions || ""}
                  min="1"
                  max="100"
                  onChange={(e) => setNumQuestions(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <Label className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Time Constraint (Mins)</Label>
                  <button 
                    onClick={() => setIsUntimed(!isUntimed)}
                    className={cn(
                      "text-[10px] font-black uppercase px-3 py-1 rounded-full transition-all",
                      isUntimed ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isUntimed ? 'Infinite Active' : 'Enable Infinite'}
                  </button>
                </div>
                <Input
                  type="number"
                  className={cn(
                    "h-14 rounded-2xl border-border px-6 font-bold focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-0 transition-all shadow-sm",
                    isUntimed ? "bg-secondary/50 opacity-50 cursor-not-allowed text-muted-foreground" : "bg-background dark:bg-[#1A1D24] text-foreground dark:text-[#F9FAFB]"
                  )}
                  placeholder="Minutes"
                  value={timeLimit || ""}
                  min="1"
                  max="180"
                  disabled={isUntimed}
                  onChange={(e) => setTimeLimit(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateTest} 
              className="w-full h-16 rounded-[24px] bg-primary text-[#FFFFFF] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all gap-3"
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6 fill-current" />}
              {isGenerating ? 'Synthesizing Assessment...' : 'Prepare Practice Session'}
            </Button>
          </CardContent>
        </Card>
      ) : !testStarted ? (
        <Card className="rounded-[40px] border-border bg-card shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-secondary/50 p-10 border-b border-border">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-black text-foreground tracking-tight">{test.title}</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-black uppercase text-[10px] tracking-widest">{subject}</span>
                  <div className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">{difficulty} Difficulty</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FileQuestion className="h-7 w-7" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-secondary/30 rounded-3xl border border-border text-center">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Items</p>
                <p className="text-2xl font-black text-foreground">{test.questions.length}</p>
              </div>
              <div className="p-6 bg-secondary/30 rounded-3xl border border-border text-center">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Window</p>
                <p className="text-2xl font-black text-foreground">{isUntimed ? '∞' : `${timeLimit}m`}</p>
              </div>
              <div className="p-6 bg-secondary/30 rounded-3xl border border-border text-center">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Subject</p>
                <p className="text-sm font-black text-foreground truncate">{subject}</p>
              </div>
            </div>
            
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-foreground font-bold">Neural Protocol Activated</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Select the most accurate response for each prompt. {!isUntimed && `The grid will auto-submit after ${timeLimit} minutes.`}
                </p>
              </div>
            </div>

            <Button onClick={handleStartTest} className="w-full h-16 rounded-[24px] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all">
              Initialize Grid Interface
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="sticky top-20 z-20 flex flex-col gap-4 bg-card/80 backdrop-blur-3xl p-6 rounded-[32px] shadow-2xl border border-border/50">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <FileQuestion className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-black text-foreground">Protocol Q{answeredCount}/{test.questions.length}</span>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Neural Sync Active</p>
                </div>
              </div>
              {!isUntimed && (
                <div className={cn(
                  "flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm",
                  timeLeft < 60 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-secondary text-foreground"
                )}>
                  <Timer className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
            <Progress value={progress} className="h-2 rounded-full bg-secondary" />
          </div>

          <div className="space-y-6">
            {test.questions.map((q: any, index: number) => (
              <Card key={q.id} className="rounded-[32px] border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-10">
                  <div className="flex items-start gap-5 mb-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary font-black text-sm shrink-0 border border-primary/10">
                      {index + 1}
                    </span>
                    <div className="text-xl font-bold text-foreground leading-relaxed">
                      <MathText text={q.questionText} />
                    </div>
                  </div>

                  <RadioGroup 
                    onValueChange={(val) => setUserAnswers(prev => ({ ...prev, [q.id]: val }))}
                    value={userAnswers[q.id] || ""}
                    disabled={showResults}
                    className="grid gap-4"
                  >
                    {q.options.map((optionText: string, optIdx: number) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const currentLetter = letters[optIdx];
                      const isCorrect = currentLetter === q.correctAnswer;
                      const isSelected = userAnswers[q.id] === currentLetter;
                      
                      return (
                        <div 
                          key={optIdx} 
                          onClick={() => {
                            if (!showResults) {
                              setUserAnswers(prev => ({ ...prev, [q.id]: currentLetter }));
                            }
                          }}
                          className={cn(
                            "flex items-center space-x-4 p-5 rounded-[20px] border transition-all duration-300 cursor-pointer relative select-none",
                            isSelected 
                              ? "border-[#3B82F6] bg-[#EFF6FF] dark:bg-blue-900/20 shadow-sm" 
                              : "border-border hover:border-[#3B82F6]/30 bg-background/50 hover:-translate-y-0.5 hover:shadow-md",
                            showResults && isCorrect && "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20",
                            showResults && isSelected && !isCorrect && "border-destructive bg-destructive/5"
                          )}
                        >
                          <RadioGroupItem value={currentLetter} id={`${q.id}-${currentLetter}`} className="sr-only" />
                          <div className="flex items-center space-x-4 w-full pointer-events-none">
                            <div className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black border transition-all",
                              isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
                            )}>
                              {currentLetter}
                            </div>
                            <div className="flex-1 font-bold text-foreground/90 text-sm">
                              <MathText text={optionText} />
                            </div>
                            {showResults && isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />}
                            {showResults && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-destructive shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-6">
            {!showResults ? (
              <Button 
                onClick={handleSubmitTest} 
                className="flex-1 h-20 rounded-[32px] bg-primary text-primary-foreground font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Submit Assessment
              </Button>
            ) : (
              <div className="w-full space-y-8">
                <Card className="rounded-[48px] border-none shadow-2xl bg-card overflow-hidden animate-in slide-in-from-top-10 duration-700">
                  <CardHeader className="bg-primary p-12 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    <Trophy className={cn("h-20 w-20 mx-auto mb-6 relative z-10", score >= 70 ? "text-amber-300 drop-shadow-2xl" : "text-white/40")} />
                    <CardTitle className="text-4xl font-black text-primary-foreground relative z-10 uppercase tracking-tight">Performance Summary</CardTitle>
                    <p className="text-primary-foreground/80 font-black uppercase tracking-[0.3em] text-xs mt-4 relative z-10">Accuracy Rating: {score}%</p>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="grid grid-cols-3 gap-8 mb-12">
                      <div className="text-center p-6 bg-secondary/20 rounded-[28px] border border-border">
                        <p className="text-3xl font-black text-emerald-500">{stats.correct}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Correct</p>
                      </div>
                      <div className="text-center p-6 bg-secondary/20 rounded-[28px] border border-border">
                        <p className="text-3xl font-black text-destructive">{stats.wrong}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Faults</p>
                      </div>
                      <div className="text-center p-6 bg-secondary/20 rounded-[28px] border border-border">
                        <p className="text-3xl font-black text-muted-foreground">{stats.skipped}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">Omissions</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleReset} 
                      className="w-full h-16 rounded-[24px] bg-primary text-primary-foreground font-black text-lg hover:scale-[1.02] transition-all"
                    >
                      <RotateCcw className="mr-3 h-5 w-5" />
                      Initialize New Protocol
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
