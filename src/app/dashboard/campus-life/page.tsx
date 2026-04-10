'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { collection, serverTimestamp, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useDoc, useFirestore, useUser, useCollection, useMemoFirebase, useFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { askQuestionsAboutCollegeLife } from '@/ai/flows/ask-questions-about-college-life';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Rocket, 
  Loader2, 
  Plus, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  Users, 
  Trash2,
  Sparkles,
  MapPin,
  Camera,
  Eye,
  Edit2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = "zenoraa.app@gmail.com";

export default function CampusLifePage() {
  const { user } = useUser();
  const { storage } = useFirebase();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    type: 'event' as 'event' | 'club',
    contact: '',
  });

  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);

  const eventsRef = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
  const eventsQuery = useMemoFirebase(() => eventsRef ? query(eventsRef, orderBy('createdAt', 'desc')) : null, [eventsRef]);
  const { data: remoteEvents, isLoading: isEventsLoading } = useCollection(eventsQuery);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleAskQuestion = async () => {
    if (!question.trim() || !userData?.college) {
      toast({
        variant: 'destructive',
        title: 'Information Required',
        description: 'Ensure your profile is complete and enter a question.',
      });
      return;
    }
    
    setIsAiLoading(true);
    setAnswer('');
    try {
      const result = await askQuestionsAboutCollegeLife({ 
        collegeName: userData.college, 
        question: question.trim() 
      });
      setAnswer(result.answer);
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'AI Offline', description: error.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  const uploadImage = async (eventId: string): Promise<string | null> => {
    if (!selectedFile) return null;
    try {
      const storageRef = ref(storage, `events/${eventId}/image.jpg`);
      await uploadBytes(storageRef, selectedFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      return null;
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !eventForm.title || !eventForm.date || !selectedFile) {
      toast({ variant: 'destructive', title: 'Submission Blocked', description: 'Title, date, and image are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(collection(firestore, 'events'));
      const imageURL = await uploadImage(docRef.id);
      
      setDocumentNonBlocking(docRef, {
        ...eventForm,
        id: docRef.id,
        imageURL: imageURL || '',
        college: userData?.college || 'General',
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
      }, { merge: true });

      setIsAddEventOpen(false);
      resetForm();
      toast({ title: 'Event Synthesized', description: 'The campus bulletin has been updated.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Transmission Error', description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId) return;

    setIsSubmitting(true);
    try {
      const eventRef = doc(firestore, 'events', editingEventId);
      
      let updatedImageURL = undefined;
      if (selectedFile) {
        updatedImageURL = await uploadImage(editingEventId);
      }

      const updateData: any = {
        title: eventForm.title || "",
        date: eventForm.date || "",
        location: eventForm.location || "",
        description: eventForm.description || "",
        type: eventForm.type || "event",
        contact: eventForm.contact || "",
        updatedAt: serverTimestamp(),
      };

      if (updatedImageURL) {
        updateData.imageURL = updatedImageURL;
      }

      updateDocumentNonBlocking(eventRef, updateData);

      setIsEditEventOpen(false);
      resetForm();
      toast({ title: 'Artifact Refined', description: 'Changes synchronized successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Sync Failure', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('Permanently purge this event artifact?')) return;
    const eventRef = doc(firestore, 'events', eventId);
    deleteDocumentNonBlocking(eventRef);
    toast({ title: 'Artifact Purged', description: 'Removed from campus grid.' });
  };

  const resetForm = () => {
    setEventForm({ title: '', date: '', location: '', description: '', type: 'event', contact: '' });
    setSelectedFile(null);
    setEditingEventId(null);
  };

  const openEdit = (event: any) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title || '',
      date: event.date || '',
      location: event.location || '',
      description: event.description || '',
      type: event.type || 'event',
      contact: event.contact || '',
    });
    setIsEditEventOpen(true);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-10 rounded-[40px] bg-card border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Campus Pulse
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-bold pl-1 ml-13">
            Live updates for {userData?.college || 'Academic Institution'}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isAddEventOpen} onOpenChange={(open) => { setIsAddEventOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest gap-3 vibrant-blue-glow hover:scale-[1.03] transition-all">
                <Plus className="h-5 w-5" />
                Deploy Bulletin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-[32px] bg-card border-none p-10 overflow-y-auto max-h-[90vh]">
              <div className="mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                  Broadcast Sync
                </h2>
                <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Initialize campus-wide event media</p>
              </div>
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Banner Media</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer relative h-40 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-all"
                  >
                    {selectedFile ? (
                      <>
                        <Image src={URL.createObjectURL(selectedFile)} fill className="object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Visual Artifact</span>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Title</label>
                  <Input placeholder="Tech Fest 2024" value={eventForm.title || ""} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="h-12 rounded-xl bg-secondary border-none font-bold" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Date</label>
                    <Input placeholder="Dec 15, 2024" value={eventForm.date || ""} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="h-12 rounded-xl bg-secondary border-none font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Type</label>
                    <select value={eventForm.type || "event"} onChange={e => setEventForm({...eventForm, type: e.target.value as any})} className="w-full h-12 rounded-xl bg-secondary border-none font-bold px-4 appearance-none focus:ring-2 focus:ring-primary">
                      <option value="event">Workshop/Fest</option>
                      <option value="club">Club/Comm</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Detailed Description</label>
                  <Textarea placeholder="Core objectives..." value={eventForm.description || ""} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="rounded-xl bg-secondary border-none font-bold min-h-[100px]" required />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="mr-2" />}
                  {isSubmitting ? 'Deploying...' : 'Deploy Grid Artifact'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={isEditEventOpen} onOpenChange={(open) => { setIsEditEventOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[550px] rounded-[32px] bg-card border-none p-10 overflow-y-auto max-h-[90vh]">
          <div className="mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Edit2 className="h-7 w-7 text-primary" />
              Refine Broadcast
            </h2>
            <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Modify existing campus artifact</p>
          </div>
          <form onSubmit={handleUpdateEvent} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Title</label>
              <Input value={eventForm.title || ""} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="h-12 rounded-xl bg-secondary border-none font-bold" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Date</label>
                <Input value={eventForm.date || ""} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="h-12 rounded-xl bg-secondary border-none font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Type</label>
                <select value={eventForm.type || "event"} onChange={e => setEventForm({...eventForm, type: e.target.value as any})} className="w-full h-12 rounded-xl bg-secondary border-none font-bold px-4 appearance-none focus:ring-2 focus:ring-primary">
                  <option value="event">Workshop/Fest</option>
                  <option value="club">Club/Comm</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Description</label>
              <Textarea value={eventForm.description || ""} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="rounded-xl bg-secondary border-none font-bold min-h-[100px]" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Change Media (Optional)</label>
              <Input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="h-12 rounded-xl bg-secondary border-none font-bold py-3" />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              {isSubmitting ? 'Synchronizing...' : 'Synchronize Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border-none glass-card overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                Neural Q&A
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Inquiry channel for campus dynamics</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-6">
              <div className="relative group">
                <Input
                  placeholder="Ask about the digital library or tech clubs..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
                  className="h-14 rounded-2xl bg-secondary/50 border-none font-bold pr-14"
                />
                <Button 
                  onClick={handleAskQuestion} 
                  disabled={isAiLoading || !question.trim()}
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary p-0"
                >
                  {isAiLoading ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {answer && (
                <div className="p-6 rounded-[28px] bg-secondary/30 border border-border/50 animate-in slide-in-from-bottom-2">
                  <p className="text-sm font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap">{answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="events" className="w-full space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <TabsList className="bg-secondary p-1 rounded-2xl h-12">
                <TabsTrigger value="events" className="rounded-xl px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all">Events</TabsTrigger>
                <TabsTrigger value="clubs" className="rounded-xl px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all">Clubs</TabsTrigger>
              </TabsList>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mr-4">Grid Synchronized</span>
            </div>

            <TabsContent value="events" className="mt-0">
              {isEventsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accessing Bulletin...</p>
                </div>
              ) : remoteEvents?.filter(e => e.type === 'event').length ? (
                <div className="grid gap-8">
                  {remoteEvents.filter(e => e.type === 'event').map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      canEdit={isAdmin || user?.uid === event.createdBy}
                      onEdit={() => openEdit(event)}
                      onDelete={() => handleDeleteEvent(event.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center glass-card rounded-[40px] border-dashed border-border border-2 bg-transparent flex flex-col items-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Academic calendar clear.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="clubs" className="mt-0">
              <div className="grid gap-8">
                {remoteEvents?.filter(e => e.type === 'club').map((club) => (
                  <EventCard 
                    key={club.id} 
                    event={club} 
                    canEdit={isAdmin || user?.uid === club.createdBy}
                    onEdit={() => openEdit(club)}
                    onDelete={() => handleDeleteEvent(club.id)} 
                    />
                ))}
                {!remoteEvents?.filter(e => e.type === 'club').length && (
                  <div className="py-24 text-center glass-card rounded-[40px] border-dashed border-border border-2 bg-transparent flex flex-col items-center">
                    <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No active communities found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, canEdit, onEdit, onDelete }: { event: any; canEdit: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="rounded-[32px] border-border bg-card hover:border-primary/20 transition-all duration-500 group overflow-hidden shadow-sm hover:shadow-xl">
      <div className="relative h-56 w-full">
        {event.imageURL ? (
          <Image src={event.imageURL} fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt={event.title} unoptimized />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Rocket className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
            {event.type}
          </span>
        </div>
      </div>
      
      <CardContent className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">{event.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-primary font-black uppercase text-[10px] tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                {event.date}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-widest">{event.college}</span>
            {event.location && (
              <>
                <div className="h-1 w-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-primary/70 font-bold text-[10px] uppercase tracking-widest">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-sm font-medium text-foreground/70 leading-relaxed line-clamp-3">
          {event.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 px-6 border-border hover:bg-secondary transition-all gap-2">
            <Eye className="h-3.5 w-3.5" />
            Artifact Specs
          </Button>
          
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-11 w-11 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
