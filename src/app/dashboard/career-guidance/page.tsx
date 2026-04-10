'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { receiveCareerGuidance, CareerGuidanceOutput } from '@/ai/flows/receive-career-guidance-from-ai';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

export default function CareerGuidancePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [interests, setInterests] = useState('');
  const [experience, setExperience] = useState('');
  const [guidance, setGuidance] = useState<CareerGuidanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const userDocRef = user ? doc(firestore, `users/${user.uid}`) : null;
  const { data: userDoc, isLoading: isUserLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (userDoc) {
      setUserData(userDoc);
    }
  }, [userDoc]);

  const handleGetGuidance = async () => {
    if (!interests && !experience) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please tell us about your interests or experience.',
      });
      return;
    }
     if (!userData) {
      toast({
        variant: 'destructive',
        title: 'User Data Not Found',
        description: 'Could not retrieve your user profile. Please try again.',
      });
      return;
    }

    setIsLoading(true);
    setGuidance(null);
    try {
      const result = await receiveCareerGuidance({
        course: userData.course || 'Not specified',
        semester: userData.semester || 1,
        interests,
        previousExperience: experience,
      });
      setGuidance(result);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AI Request Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderList = (items: string[] | undefined, emptyText: string) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-muted-foreground p-2">{emptyText}</p>;
    }
    return (
      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Career Counselor</CardTitle>
            <CardDescription>
              Tell us about yourself to get personalized career advice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interests">Your Interests</Label>
              <Input
                id="interests"
                placeholder="e.g., AI, Web Development, Marketing"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Previous Experience</Label>
              <Textarea
                id="experience"
                placeholder="e.g., Internship at Tech Corp, personal projects"
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleGetGuidance} className="w-full" disabled={isLoading || isUserLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Get Guidance
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Your AI-Powered Guidance</CardTitle>
            <CardDescription>
              Suggestions tailored to your profile will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="suggestions">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="guidance">Guidance</TabsTrigger>
                  <TabsTrigger value="paths">Career Paths</TabsTrigger>
                </TabsList>
                <TabsContent value="suggestions" className="mt-4">
                  <Accordion type="single" collapsible className="w-full" defaultValue="internships">
                    <AccordionItem value="internships">
                      <AccordionTrigger>Internship Suggestions</AccordionTrigger>
                      <AccordionContent>
                        {guidance ? renderList(guidance.internshipSuggestions, 'No internship suggestions available.') : 'Suggestions for relevant internships will be listed here.'}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="courses">
                      <AccordionTrigger>Course Suggestions</AccordionTrigger>
                      <AccordionContent>
                        {guidance ? renderList(guidance.courseSuggestions, 'No course suggestions available.') : 'Recommended courses to enhance your skills will appear here.'}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="certifications">
                      <AccordionTrigger>Certification Suggestions</AccordionTrigger>
                      <AccordionContent>
                        {guidance ? renderList(guidance.certificationSuggestions, 'No certification suggestions available.') : 'Valuable certifications to boost your profile will be shown here.'}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
                <TabsContent value="guidance" className="mt-4">
                  <Accordion type="single" collapsible className="w-full" defaultValue="resume">
                      <AccordionItem value="resume">
                        <AccordionTrigger>Resume Guidance</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guidance?.resumeGuidance || 'Tips and feedback on improving your resume.'}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="cover-letter">
                        <AccordionTrigger>Cover Letter Guidance</AccordionTrigger>
                        <AccordionContent>
                           <p className="text-sm text-muted-foreground whitespace-pre-wrap">{guidance?.coverLetterGuidance || 'Guidance on writing effective cover letters for job applications.'}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                </TabsContent>
                <TabsContent value="paths" className="mt-4">
                   <div className="text-sm text-muted-foreground p-4 bg-secondary rounded-lg">
                      {guidance ? renderList(guidance.careerPathSuggestions, 'No career path suggestions available.') : 'Potential career paths based on your profile will be outlined here.'}
                   </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
