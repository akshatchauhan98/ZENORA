
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, 
  Settings2, 
  Loader2, 
  UserCircle, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  Sparkles, 
  ChevronRight, 
  LayoutDashboard,
  Linkedin,
  Github,
  Code2
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SearchableSelect } from '@/components/searchable-select';
import { colleges } from '@/lib/college-data';
import { courses } from '@/lib/course-data';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Academic Help',
    description: 'Expert doubt solving and math visualization.',
    href: '/dashboard/academic-help',
    imageId: 'academic-help',
    gradient: 'from-primary/10 to-transparent'
  },
  {
    title: 'Mock Tests',
    description: 'Practice with advanced analytics.',
    href: '/dashboard/mock-tests',
    imageId: 'campus-life',
    gradient: 'from-primary/10 to-transparent'
  },
  {
    title: 'Planner',
    description: 'Strategic schedules and deadlines.',
    href: '/dashboard/planner',
    imageId: 'planner-reminders',
    gradient: 'from-primary/10 to-transparent'
  },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userDoc, isLoading: isDocLoading } = useDoc(userDocRef);

  const activityRef = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/activityLog`) : null), [user, firestore]);
  const activityQuery = useMemoFirebase(() => activityRef ? query(activityRef, orderBy('timestamp', 'desc'), limit(10)) : null, [activityRef]);
  const { data: activities, isLoading: isActivitiesLoading } = useCollection(activityQuery);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    college: '',
    course: '',
    semester: '',
    github: '',
    leetcode: '',
    linkedin: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userDoc && isEditDialogOpen) {
      setProfile({
        fullName: userDoc.fullName || user?.displayName || '',
        college: userDoc.college || '',
        course: userDoc.course || '',
        semester: userDoc.semester ? String(userDoc.semester) : '',
        github: userDoc.links?.github || '',
        leetcode: userDoc.links?.leetcode || '',
        linkedin: userDoc.links?.linkedin || ''
      });
    }
  }, [userDoc, isEditDialogOpen, user?.displayName]);

  const stats = useMemo(() => {
    const totalQuestions = activities?.filter(a => a.activityType === 'AI_QUESTION').length || 0;
    const testsAttempted = activities?.filter(a => a.activityType === 'MOCK_TEST_ATTEMPTED').length || 0;
    const scores = activities?.filter(a => a.score !== undefined).map(a => a.score) || [];
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    return [
      { label: 'Total Doubts', value: totalQuestions, icon: Brain, color: 'text-primary', bg: 'bg-primary/10' },
      { label: 'Exams Taken', value: testsAttempted, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
      { label: 'Mean Score', value: `${Math.round(avgScore)}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    ];
  }, [activities]);

  const chartData = useMemo(() => {
    if (!activities) return [];
    const data: Record<string, number> = {};
    activities.forEach(a => {
      const type = (a.activityType || 'Other').replace('_', ' ').toLowerCase();
      data[type] = (data[type] || 0) + 1;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const handleUpdateProfile = async () => {
    if (!user || !userDocRef) return;
    setIsSaving(true);
    try {
      if (profile.fullName !== user.displayName) {
        await updateProfile(user, { displayName: profile.fullName });
      }
      updateDocumentNonBlocking(userDocRef, {
        fullName: profile.fullName,
        college: profile.college,
        course: profile.course,
        semester: Number(profile.semester),
        links: {
          github: profile.github,
          leetcode: profile.leetcode,
          linkedin: profile.linkedin
        },
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Profile Updated', description: 'Your academic identity has been synced.' });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-10 rounded-2xl relative overflow-hidden bg-card border border-border shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Workspace, <span className="text-foreground/90">{userDoc?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar'}</span>
              </h1>
              <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Academic Operating System</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold tracking-tight text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 
              {userDoc?.college || 'Academic Institution'}
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" /> 
              {courses.find(c => c.value === userDoc?.course)?.label || 'Degree Track'}
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" /> 
              Semester {userDoc?.semester || '1'}
            </span>
          </div>
        </div>

        <Button 
          onClick={() => setIsEditDialogOpen(true)} 
          className="h-12 px-8 rounded-lg gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-md"
        >
          <Settings2 className="h-4 w-4" />
          Refine Profile
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className={cn("rounded-xl glass-card card-glow border-none", `[animation-delay:${i * 100}ms]`)}>
            <CardContent className="p-8 flex items-center gap-6">
              <div className={cn("p-4 rounded-lg shadow-sm", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-xl bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-wider text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Workspace Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-8">
            {isActivitiesLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/20" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="currentColor" className="opacity-50" dy={10} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(var(--primary), 0.05)' }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }} 
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" className="opacity-80 hover:opacity-100 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground/40">
                <TrendingUp className="h-12 w-12" />
                <p className="text-[10px] font-black uppercase tracking-widest">No activity data to chart</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-xl bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-3 uppercase tracking-wider text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Pulse Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <div className="flex flex-col">
                {isActivitiesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
                  </div>
                ) : activities?.length ? activities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 border-b border-border hover:bg-muted/30 transition-all group cursor-pointer">
                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-foreground">
                        {activity.activityType.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1 truncate">
                        {activity.subject}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 space-y-4">
                    <Brain className="h-12 w-12 opacity-40" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Brand pathways quiet...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, idx) => {
          const image = PlaceHolderImages.find(img => img.id === feature.imageId);
          return (
            <Link href={feature.href} key={feature.href} className="group animate-slide-up" style={{ animationDelay: `${600 + idx * 100}ms` }}>
              <Card className="h-full rounded-xl overflow-hidden bg-card card-glow border-border shadow-sm group relative">
                <div className={cn("relative h-48 w-full transition-all duration-500 group-hover:scale-105", feature.gradient)}>
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover opacity-10 group-hover:opacity-20 transition-all"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-8 right-6">
                    <div className="p-3 rounded-lg bg-background/80 backdrop-blur-xl w-fit mb-3 border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
                <CardContent className="p-8">
                  <p className="text-muted-foreground text-xs font-semibold leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-wider gap-2">
                    Initialize Module 
                    <div className="h-0.5 w-8 bg-primary/20 rounded-full group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl bg-card p-10 border-border shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <UserCircle className="h-6 w-6 text-primary" />
              Academic Identity
            </h2>
            <p className="text-muted-foreground font-medium text-xs">
              Synchronize your workspace configuration
            </p>
          </div>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Full Legal Name</Label>
              <Input 
                value={profile.fullName || ""} 
                onChange={(e) => setProfile({...profile, fullName: e.target.value})} 
                className="h-12 rounded-lg bg-muted/50 border-border focus:ring-primary font-semibold px-4" 
                placeholder="Enter scholar name"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Academic Institution</Label>
              <SearchableSelect 
                value={profile.college || ""} 
                onChange={(val) => setProfile({...profile, college: val})} 
                options={colleges.map(c => ({ value: c, label: c }))} 
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Degree Track</Label>
                <SearchableSelect 
                  value={profile.course || ""} 
                  onChange={(val) => setProfile({...profile, course: val})} 
                  options={courses} 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Semester</Label>
                <SearchableSelect 
                  value={profile.semester || ""} 
                  onChange={(val) => setProfile({...profile, semester: val})} 
                  options={[...Array(12)].map((_, i) => ({ value: `${i + 1}`, label: `Semester ${i + 1}` }))} 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest ml-1">Neural Network Artifacts</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Github className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">GitHub ID</span>
                  </div>
                  <Input 
                    value={profile.github || ""} 
                    onChange={(e) => setProfile({...profile, github: e.target.value})} 
                    className="h-11 rounded-lg bg-muted/50 border-border font-semibold" 
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Code2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">LeetCode ID</span>
                  </div>
                  <Input 
                    value={profile.leetcode || ""} 
                    onChange={(e) => setProfile({...profile, leetcode: e.target.value})} 
                    className="h-11 rounded-lg bg-muted/50 border-border font-semibold" 
                    placeholder="Username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Linkedin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">LinkedIn URL</span>
                </div>
                <Input 
                  value={profile.linkedin || ""} 
                  onChange={(e) => setProfile({...profile, linkedin: e.target.value})} 
                  className="h-11 rounded-lg bg-muted/50 border-border font-semibold" 
                  placeholder="Profile link"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-8">
            <Button onClick={handleUpdateProfile} className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-all" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
              Update Core Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
