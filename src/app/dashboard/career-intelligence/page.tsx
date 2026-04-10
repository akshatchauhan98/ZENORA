
'use client';

import React, { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Github, 
  Rocket, 
  Loader2, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  BrainCircuit,
  Plus,
  Zap,
  Trash2,
  Globe,
  Trophy,
  Briefcase,
  Edit2,
  Check,
  X,
  CalendarDays,
  CircleDot,
  Layers,
  BookOpen,
  Code2,
  Star,
  Sparkles,
  Building2,
  ListTodo,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom LeetCode Icon
function LeetCodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-2.04 2.04a1.377 1.374 0 0 0 0 1.942l2.04 2.04a1.377 1.374 0 0 0 1.942 0 1.377 1.374 0 0 0 0-1.942l-1.07-1.07 1.07-1.07a1.377 1.374 0 0 0 0-1.942 1.374 1.374 0 0 0-.981-.414zm-4.738 2.59a1.377 1.374 0 0 0-1.942 0L.414 8.973a1.377 1.374 0 0 0 0 1.942l2.04 2.04a1.377 1.374 0 0 0 1.942 0 1.377 1.374 0 0 0 0-1.942L3.326 10.04l5.419-5.419a1.377 1.374 0 0 0 0-1.942zM23.586 8.973a1.377 1.374 0 0 0-1.942 0l-2.04 2.04a1.377 1.374 0 0 0 0 1.942l2.04 2.04a1.377 1.374 0 0 0 1.942 0 1.377 1.374 0 0 0 0-1.942l-1.07-1.07 1.07-1.07a1.377 1.374 0 0 0 0-1.942zM13.483 13.483a1.374 1.374 0 0 0-.961.414l-2.04 2.04a1.377 1.374 0 0 0 0 1.942l2.04 2.04a1.377 1.374 0 0 0 1.942 0 1.377 1.374 0 0 0 0-1.942l-1.07-1.07 1.07-1.07a1.377 1.374 0 0 0 0-1.942zM13.483 13.483a1.374 1.374 0 0 0-.961.414l-2.04 2.04a1.377 1.374 0 0 0 0 1.942l2.04 2.04a1.377 1.374 0 0 0 1.942 0 1.377 1.374 0 0 0 0-1.942l-1.07-1.07 1.07-1.07a1.377 1.374 0 0 0 0-1.942z"/>
    </svg>
  );
}

const cleanUsername = (val: string) => {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.includes('github.com/') || trimmed.includes('leetcode.com/')) {
    return trimmed.split('/').filter(Boolean).pop() || "";
  }
  return trimmed;
}

function CircularProgress({ value, label }: { value: number; label: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  
  const numericValue = Number(value);
  const safeValue = isNaN(numericValue) ? 0 : Math.min(100, Math.max(0, numericValue));
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg className="w-48 h-48 -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-secondary opacity-20"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-foreground">{safeValue}%</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export default function CareerIntelligencePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [isSyncingLeetcode, setIsSyncingLeetcode] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [editingField, setEditingField] = useState<'github' | 'leetcode' | null>(null);
  const [tempValue, setEditingValue] = useState('');

  const careerDataRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}/career_intelligence/data`) : null, [user, firestore]);
  const { data: careerData, isLoading: isDataLoading } = useDoc(careerDataRef);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const handleUpdateFootprint = async () => {
    if (!editingField || !userDocRef) return;
    try {
      const currentLinks = userDoc?.links || {};
      const cleanVal = cleanUsername(tempValue);
      
      await updateDoc(userDocRef, {
        links: {
          ...currentLinks,
          [editingField]: cleanVal
        }
      });
      setEditingField(null);
      toast({ title: 'Identity Updated' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update Error', description: e.message });
    }
  };

  const handleSyncGithub = async () => {
    const githubUser = userDoc?.links?.github;
    if (!githubUser) {
      toast({ variant: 'destructive', title: 'ID Missing', description: 'Configure GitHub username first.' });
      return;
    }
    
    setIsSyncingGithub(true);
    try {
      const res = await fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`);
      if (!res.ok) throw new Error("Failed to fetch GitHub data.");
      
      const repos = await res.json();
      const languages = Array.from(new Set(repos.map((r: any) => r.language).filter(Boolean)));
      const stars = repos.reduce((acc: number, r: any) => acc + (r.stargazers_count || 0), 0);

      if (careerDataRef) {
        await setDoc(careerDataRef, {
          githubData: {
            username: githubUser,
            repoCount: repos.length,
            languages,
            stars,
            lastSynced: new Date().toISOString()
          }
        }, { merge: true });
      }
      toast({ title: 'GitHub Footprint Indexed' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync Error', description: e.message });
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const handleSyncLeetcode = async () => {
    const leetcodeUser = userDoc?.links?.leetcode;
    if (!leetcodeUser) {
      toast({ variant: 'destructive', title: 'ID Missing', description: 'Configure LeetCode username first.' });
      return;
    }

    setIsSyncingLeetcode(true);
    try {
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${leetcodeUser}`);
      const stats = await res.json();
      
      if (stats.status === 'error') throw new Error("LeetCode user not found.");

      if (careerDataRef) {
        await setDoc(careerDataRef, {
          leetcodeData: {
            username: leetcodeUser,
            totalSolved: stats.totalSolved,
            easy: stats.easySolved,
            medium: stats.mediumSolved,
            hard: stats.hardSolved,
            ranking: stats.ranking,
            lastSynced: new Date().toISOString()
          }
        }, { merge: true });
      }
      toast({ title: 'LeetCode Metrics Synchronized' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Sync Error', description: e.message });
    } finally {
      setIsSyncingLeetcode(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !careerDataRef) return;
    const currentSkills = careerData?.skills || [];
    try {
      await setDoc(careerDataRef, {
        skills: [...currentSkills, { name: newSkill.trim(), level: skillLevel }]
      }, { merge: true });
      setNewSkill('');
      toast({ title: 'Skill Synthesized' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Matrix Update Error' });
    }
  };

  const handleRemoveSkill = async (name: string) => {
    if (!careerDataRef) return;
    try {
      await updateDoc(careerDataRef, {
        skills: (careerData.skills || []).filter((s: any) => s.name !== name)
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Removal Failed' });
    }
  };

  const handleAnalyze = async () => {
    if (!userDoc || !careerDataRef || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const userData = {
        skills: careerData?.skills || [],
        github: careerData?.githubData,
        leetcode: careerData?.leetcodeData,
        academic: {
          course: userDoc.course || 'B.Tech',
          semester: Number(userDoc.semester) || 1,
          cgpa: userDoc.cgpa || 7.0,
          targetRole: userDoc.targetRole || 'Software Engineer'
        }
      };

      // Call the robust internal API route instead of external functions
      const response = await fetch("/api/career-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Neural synthesis fault.");
      }

      // result.data contains the JSON string from the AI as requested
      const aiAnalysis = JSON.parse(result.data);

      await setDoc(careerDataRef, { 
        analysis: aiAnalysis, 
        updatedAt: serverTimestamp() 
      }, { merge: true });

      toast({ title: 'Placement Synthesis Complete' });
    } catch (e: any) {
      console.error('[Frontend] Analysis Error:', e);
      toast({ variant: 'destructive', title: 'Analysis Fault', description: e.message || 'System busy.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const phaseIcons = [BookOpen, Layers, Rocket];

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000 px-4 sm:px-0">
      {/* Header Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 sm:p-10 rounded-[40px] bg-card border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Rocket className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Placement Agent</h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-bold pl-1 ml-13">Intelligent Preparation Logic</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button 
            onClick={handleSyncGithub} 
            variant="outline" 
            className="h-12 sm:h-14 rounded-2xl border-border bg-secondary/50 font-bold px-4 sm:px-6 hover:bg-secondary transition-all text-xs sm:text-sm" 
            disabled={isSyncingGithub}
          >
            {isSyncingGithub ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Github className="mr-2 h-4 w-4" />}
            Sync GitHub
          </Button>
          <Button 
            onClick={handleSyncLeetcode} 
            variant="outline" 
            className="h-12 sm:h-14 rounded-2xl border-border bg-secondary/50 font-bold px-4 sm:px-6 hover:bg-secondary transition-all text-xs sm:text-sm" 
            disabled={isSyncingLeetcode}
          >
            {isSyncingLeetcode ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <LeetCodeIcon className="mr-2 h-4 w-4" />}
            Sync LeetCode
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing} 
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-primary text-white font-black uppercase text-[10px] sm:text-xs tracking-widest gap-3 shadow-xl vibrant-blue-glow"
          >
            {isAnalyzing ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap className="h-5 w-5" />}
            Initialize Prep Agent
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Capability Matrix */}
        <Card className="rounded-[32px] border-none bg-card shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3 uppercase tracking-tight">
              <Trophy className="h-6 w-6 text-primary" /> Capability Matrix
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Define technical assets</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6 flex-1">
            <div className="flex gap-2">
              <Input 
                placeholder="Skill name..." 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)} 
                className="h-12 rounded-xl bg-secondary border-none font-bold text-xs" 
              />
              <select 
                value={skillLevel} 
                onChange={e => setSkillLevel(e.target.value as any)} 
                className="h-12 rounded-xl bg-secondary border-none font-bold px-3 text-[10px] uppercase tracking-widest"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <Button onClick={handleAddSkill} size="icon" className="h-12 w-12 shrink-0 rounded-xl bg-primary text-white"><Plus className="h-5 w-5" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {careerData?.skills?.map((skill: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 rounded-lg bg-secondary/50 text-[10px] font-bold uppercase tracking-widest gap-2 border-none">
                  {skill.name}
                  <button onClick={() => handleRemoveSkill(skill.name)} className="h-5 w-5 rounded-md hover:bg-destructive hover:text-white flex items-center justify-center transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Footprints */}
        <Card className="rounded-[32px] border-none bg-card shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3 uppercase tracking-tight">
              <Globe className="h-6 w-6 text-primary" /> Technical Footprints
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity synchronization grid</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6 flex-1">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-secondary/30 flex flex-col gap-3 border border-border/50 transition-all hover:bg-secondary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border">
                      <Github className="h-4 w-4 text-foreground" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">GitHub ID</span>
                  </div>
                  {editingField === 'github' ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10" onClick={handleUpdateFootprint}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:bg-rose-500/10" onClick={() => setEditingField(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary transition-all" onClick={() => { setEditingField('github'); setEditingValue(userDoc?.links?.github || ''); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                  )}
                </div>
                {editingField === 'github' ? (
                  <Input value={tempValue} onChange={e => setEditingValue(e.target.value)} className="h-10 bg-background border-border text-xs font-bold rounded-lg" autoFocus placeholder="Username" onKeyDown={e => e.key === 'Enter' && handleUpdateFootprint()} />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-bold truncate max-w-[140px]", !userDoc?.links?.github ? "text-muted-foreground/40 italic" : "text-foreground")}>
                      {userDoc?.links?.github || 'Not Configured'}
                    </span>
                    {careerData?.githubData && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest h-5 px-2">Synced</Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-secondary/30 flex flex-col gap-3 border border-border/50 transition-all hover:bg-secondary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border">
                      <LeetCodeIcon className="h-4 w-4 text-[#FFA116]" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">LeetCode ID</span>
                  </div>
                  {editingField === 'leetcode' ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10" onClick={handleUpdateFootprint}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:bg-rose-500/10" onClick={() => setEditingField(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary transition-all" onClick={() => { setEditingField('leetcode'); setEditingValue(userDoc?.links?.leetcode || ''); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                  )}
                </div>
                {editingField === 'leetcode' ? (
                  <Input value={tempValue} onChange={e => setEditingValue(e.target.value)} className="h-10 bg-background border-border text-xs font-bold rounded-lg" autoFocus placeholder="Username" onKeyDown={e => e.key === 'Enter' && handleUpdateFootprint()} />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-bold truncate max-w-[140px]", !userDoc?.links?.leetcode ? "text-muted-foreground/40 italic" : "text-foreground")}>
                      {userDoc?.links?.leetcode || 'Not Configured'}
                    </span>
                    {careerData?.leetcodeData && (
                      <Badge className="bg-[#FFA116]/10 text-[#FFA116] border-none font-black text-[9px] uppercase tracking-widest h-5 px-2">Synced</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Metrics */}
        <Card className="rounded-[32px] border-none bg-card shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-3 uppercase tracking-tight">
              <Briefcase className="h-6 w-6 text-primary" /> Target Metrics
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Academic constraints grid</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6 flex-1">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Current CGPA</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={userDoc?.cgpa || ''} 
                  onChange={e => userDocRef && updateDoc(userDocRef, { cgpa: parseFloat(e.target.value) })} 
                  className="h-12 rounded-xl bg-secondary border-none font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Desired Role</Label>
                <Input 
                  value={userDoc?.targetRole || ''} 
                  onChange={e => userDocRef && updateDoc(userDocRef, { targetRole: e.target.value })} 
                  className="h-12 rounded-xl bg-secondary border-none font-bold" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {careerData?.analysis ? (
        <Tabs defaultValue="overview" className="w-full space-y-8">
          <TabsList className="bg-secondary p-1 rounded-2xl h-14 w-fit border border-border">
            <TabsTrigger value="overview" className="rounded-xl px-8 h-11 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all">Placement Agent</TabsTrigger>
            <TabsTrigger value="roadmap" className="rounded-xl px-8 h-11 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all">Prep Roadmap</TabsTrigger>
            <TabsTrigger value="interview" className="rounded-xl px-8 h-11 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all">Interview Command</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid gap-8 lg:grid-cols-5">
              <Card className="lg:col-span-2 rounded-[40px] border-none bg-card shadow-sm overflow-hidden flex flex-col items-center justify-center p-10">
                <CircularProgress 
                  value={careerData.analysis.placement_probability} 
                  label="Probability" 
                />
                <div className="mt-10 text-center space-y-4 w-full">
                  <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status Level</p>
                    <Badge className="bg-primary text-white font-black text-xs uppercase tracking-widest px-4 py-1 rounded-full">
                      {careerData.analysis.level}
                    </Badge>
                  </div>
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Risk Profile</p>
                    <span className="text-sm font-black text-foreground uppercase tracking-tight">{careerData.analysis.risk_level} Risk</span>
                  </div>
                </div>
              </Card>

              <div className="lg:col-span-3 space-y-8">
                <Card className="rounded-[40px] border-none bg-card shadow-sm overflow-hidden">
                  <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <ShieldCheck className="h-7 w-7 text-primary" /> Evaluation Protocol
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                        <Check className="h-3 w-3" /> Core Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {careerData.analysis.strengths?.map((s: string, i: number) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-emerald-500/5 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Technical Gaps
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {careerData.analysis.missing_skills?.map((s: string, i: number) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-amber-500/5 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/10">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-2">
                        <ListTodo className="h-3 w-3" /> Daily Protocol
                      </h4>
                      <div className="grid gap-3">
                        {careerData.analysis.daily_plan?.map((plan: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            <p className="text-xs font-bold text-foreground leading-relaxed">{plan}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[40px] border-none bg-card shadow-sm overflow-hidden">
              <CardHeader className="p-10 bg-primary/5 border-b border-border">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <CalendarDays className="h-7 w-7 text-primary" /> Phased Preparation Roadmap
                </CardTitle>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Target Role: {userDoc?.targetRole || 'Software Engineer'}</p>
              </CardHeader>
              <CardContent className="p-10">
                <div className="relative space-y-16">
                  <div className="absolute left-8 top-4 bottom-4 w-px bg-border border-dashed" />
                  
                  {careerData.analysis.roadmap?.map((phase: any, idx: number) => {
                    const Icon = phaseIcons[idx] || CircleDot;
                    return (
                      <div key={idx} className="relative pl-24 group">
                        <div className="absolute left-0 top-0 h-16 w-16 rounded-[24px] bg-card border-2 border-primary flex flex-col items-center justify-center z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                          <span className="text-[10px] font-black leading-none opacity-60 mb-1">PHASE</span>
                          <span className="text-xl font-black leading-none">{idx + 1}</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-primary" />
                                <h4 className="text-2xl font-black tracking-tight text-foreground">{phase.phase}</h4>
                              </div>
                              <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">{phase.duration}</p>
                            </div>
                          </div>
                          
                          <div className="grid gap-4 sm:grid-cols-2">
                            {phase.tasks?.map((task: string, tIdx: number) => (
                              <div key={tIdx} className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all">
                                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-foreground/80 leading-relaxed">{task}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview" className="animate-in slide-in-from-right-4 duration-500">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="rounded-[40px] border-none bg-card shadow-sm overflow-hidden">
                <CardHeader className="p-10">
                  <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
                    <MessageSquare className="h-6 w-6 text-primary" /> Interview Tactics
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Focus areas for technical screenings</CardDescription>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-4">
                  {careerData.analysis.interview_preparation?.map((area: string, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                      <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-foreground/80 leading-relaxed">{area}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[40px] border-none bg-primary text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
                <CardHeader className="p-10">
                  <CardTitle className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
                    <Building2 className="h-6 w-6 text-white" /> Target Magnitude
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Target Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {careerData.analysis.job_roles?.map((role: string, i: number) => (
                        <span key={i} className="px-4 py-2 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/20">{role}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Expected Magnitude</p>
                    <p className="text-4xl font-black">{careerData.analysis.expected_package}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-card/30 rounded-[40px] border border-dashed border-border text-center">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/20">
            <Zap className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">System Offline</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground max-w-sm mt-2 mx-auto leading-relaxed">
              Populate your technical artifacts and click 'Initialize Prep Agent' to begin your placement evaluation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
