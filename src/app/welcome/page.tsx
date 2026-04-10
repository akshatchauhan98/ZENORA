
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Github, Linkedin, Code2, Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';
import { SearchableSelect } from '@/components/searchable-select';
import { colleges } from '@/lib/college-data';
import { courses } from '@/lib/course-data';
import { LiveBackground } from '@/components/live-background';

export default function WelcomePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    fullName: '',
    college: '',
    course: '',
    semester: '1',
    cgpa: '',
    github: '',
    leetcode: '',
    linkedin: '',
    targetRole: 'Software Engineer',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!profile.fullName || !profile.college || !profile.course || !profile.cgpa || !profile.github || !profile.leetcode || !profile.linkedin) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Protocol',
        description: 'All mandatory academic and professional artifacts are required.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        fullName: profile.fullName,
        college: profile.college,
        course: profile.course,
        semester: Number(profile.semester),
        cgpa: Number(profile.cgpa),
        targetRole: profile.targetRole,
        isProfileComplete: true,
        links: {
          github: profile.github,
          leetcode: profile.leetcode,
          linkedin: profile.linkedin
        },
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({ title: 'Identity Synchronized', description: 'Welcome to Zenora OS.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sync Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <LiveBackground />
      <div className="flex items-center justify-center min-h-screen p-4 py-20">
        <div className="w-full max-w-2xl">
          <div className="flex justify-center mb-8">
            <AppLogo />
          </div>
          <Card className="rounded-[40px] border-none glass-card shadow-2xl bg-card/80 overflow-hidden">
            <CardHeader className="bg-primary p-10 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Rocket className="h-20 w-20" />
              </div>
              <CardTitle className="text-3xl font-black uppercase tracking-tight">Identity Initialization</CardTitle>
              <CardDescription className="text-primary-foreground/80 font-bold text-xs uppercase tracking-widest mt-2">
                Mandatory Academic & Professional Profile Completion
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Full Legal Name</Label>
                  <Input value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} placeholder="John Doe" className="h-12 rounded-xl bg-secondary border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Target Profession</Label>
                  <Input value={profile.targetRole} onChange={e => setProfile({...profile, targetRole: e.target.value})} placeholder="e.g. SDE, Data Analyst" className="h-12 rounded-xl bg-secondary border-none font-bold" />
                </div>
                <div className="space-y-2 col-span-full">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Academic Institution</Label>
                  <SearchableSelect value={profile.college} onChange={val => setProfile({...profile, college: val})} options={colleges.map(c => ({ value: c, label: c }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Course Track</Label>
                  <SearchableSelect value={profile.course} onChange={val => setProfile({...profile, course: val})} options={courses} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Semester</Label>
                    <SearchableSelect value={profile.semester} onChange={val => setProfile({...profile, semester: val})} options={[...Array(8)].map((_, i) => ({ value: `${i + 1}`, label: `${i + 1}` }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">CGPA</Label>
                    <Input type="number" step="0.01" value={profile.cgpa} onChange={e => setProfile({...profile, cgpa: e.target.value})} placeholder="0.00" className="h-12 rounded-xl bg-secondary border-none font-bold" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Professional Footprints
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="relative group">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} placeholder="Github Username" className="h-12 pl-11 rounded-xl bg-secondary border-none font-bold" />
                  </div>
                  <div className="relative group">
                    <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={profile.leetcode} onChange={e => setProfile({...profile, leetcode: e.target.value})} placeholder="LeetCode Username" className="h-12 pl-11 rounded-xl bg-secondary border-none font-bold" />
                  </div>
                  <div className="relative group col-span-full">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} placeholder="LinkedIn Profile URL" className="h-12 pl-11 rounded-xl bg-secondary border-none font-bold" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl vibrant-blue-glow" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Rocket className="mr-2 h-5 w-5" />}
                Initialize Academic Grid
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
