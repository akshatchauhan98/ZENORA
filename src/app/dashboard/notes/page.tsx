
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
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
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Bookmark, 
  Star, 
  Plus, 
  Filter, 
  BookOpen, 
  Loader2,
  Trash2,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses } from '@/lib/course-data';
import { getSubjects } from '@/lib/subject-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function NotesRepositoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Note Contribution Form
  const [newNote, setNewNote] = useState({
    title: '',
    subject: '',
    course: '',
    semester: '1',
  });

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  useEffect(() => {
    if (userDoc && !selectedCourse) {
      setSelectedCourse(userDoc.course || '');
      setSelectedSemester(String(userDoc.semester || '1'));
      setNewNote(prev => ({ ...prev, course: userDoc.course || '', semester: String(userDoc.semester || '1') }));
    }
  }, [userDoc, selectedCourse]);

  const availableSubjects = useMemo(() => {
    if (!selectedCourse || !selectedSemester) return [];
    return getSubjects(selectedCourse, Number(selectedSemester));
  }, [selectedCourse, selectedSemester]);

  const contributionSubjects = useMemo(() => {
    if (!newNote.course || !newNote.semester) return [];
    return getSubjects(newNote.course, Number(newNote.semester));
  }, [newNote.course, newNote.semester]);

  const notesRef = useMemoFirebase(() => collection(firestore, 'notes'), [firestore]);
  
  const filteredNotesQuery = useMemoFirebase(() => {
    if (!notesRef) return null;
    return query(notesRef); // Fetch all digital/handwritten for library
  }, [notesRef]);

  const { data: allNotes, isLoading } = useCollection(filteredNotesQuery);

  const handleAddNote = async () => {
    if (!user || !newNote.title || !newNote.subject) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please fill all required fields.' });
      return;
    }

    setIsUploading(true);
    try {
      await addDoc(notesRef, {
        ...newNote,
        semester: Number(newNote.semester),
        type: 'handwritten',
        fileURL: 'https://placehold.co/600x400/0B2E33/B8E3E9.pdf?text=Sample+Note+Artifact',
        uploadedBy: user.uid,
        rating: 0,
        ratingCount: 0,
        createdAt: serverTimestamp(),
      });
      setIsContributionOpen(false);
      setNewNote({ title: '', subject: '', course: userDoc?.course || '', semester: String(userDoc?.semester || '1') });
      toast({ title: 'Artifact Synced', description: 'Your notes are now available in the repository.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: e.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogActivity = (subject: string) => {
    if (!user) return;
    const activityRef = collection(firestore, `users/${user.uid}/activityLog`);
    addDoc(activityRef, {
      userId: user.uid,
      activityType: 'NOTE_VIEWED',
      subject,
      timestamp: serverTimestamp(),
    });
  };

  const handleSaveNote = async (noteId: string, isSaved: boolean) => {
    if (!user || !userDocRef) return;
    try {
      await updateDoc(userDocRef, {
        savedNotes: isSaved ? arrayRemove(noteId) : arrayUnion(noteId)
      });
      toast({ title: isSaved ? 'Removed from saved' : 'Note Saved', description: 'Your collection has been updated.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: e.message });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(firestore, `notes/${noteId}`));
      toast({ title: 'Artifact Purged', description: 'Removed from community repository.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: e.message });
    }
  };

  const displayNotes = useMemo(() => {
    if (!allNotes) return [];
    return allNotes.filter(n => {
      const matchesSearch = !searchQuery || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCourse = !selectedCourse || n.course === selectedCourse;
      const matchesSemester = !selectedSemester || n.semester === Number(selectedSemester);
      const matchesSubject = !selectedSubject || selectedSubject === 'all' || n.subject === selectedSubject;

      return matchesSearch && matchesCourse && matchesSemester && matchesSubject;
    });
  }, [allNotes, searchQuery, selectedCourse, selectedSemester, selectedSubject]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-10 rounded-[32px] border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Notes Repository
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-bold pl-1 ml-13">
            Community-driven handwritten artifact collection.
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search notes..." 
            className="h-12 pl-11 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/50 backdrop-blur-sm p-6 rounded-[24px] border border-border">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Degree / Course</Label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="h-12 rounded-xl bg-background border-border text-foreground font-bold focus:ring-primary">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Semester</Label>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="h-12 rounded-xl bg-background border-border text-foreground font-bold focus:ring-primary">
              <SelectValue placeholder="Select Sem" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(8)].map((_, i) => (
                <SelectItem key={i+1} value={String(i+1)}>Semester {i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-12 rounded-xl bg-background border-border text-foreground font-bold focus:ring-primary">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button 
            variant="outline"
            className="w-full h-12 rounded-xl border-border bg-background text-muted-foreground hover:text-primary font-bold gap-2"
            onClick={() => { setSelectedCourse(userDoc?.course || ''); setSelectedSemester(String(userDoc?.semester || '1')); setSelectedSubject(''); }}
          >
            <Filter className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-4">
          <TabsList className="bg-secondary p-1 rounded-[16px] h-12">
            <TabsTrigger value="all" className="rounded-[12px] px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all">Library</TabsTrigger>
            <TabsTrigger value="my" className="rounded-[12px] px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all">My Uploads</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-[12px] px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest transition-all">Saved</TabsTrigger>
          </TabsList>
          
          <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest gap-3 vibrant-blue-glow hover:scale-[1.03] transition-all">
                <Plus className="h-5 w-5" />
                Contribute Notes
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none p-10 bg-card">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <UploadCloud className="h-7 w-7 text-primary" />
                  Note Synthesis
                </DialogTitle>
                <DialogDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Share academic artifacts with the community.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Title</Label>
                    <Input placeholder="e.g., Mid-term Calculus Revision" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="h-12 rounded-xl bg-secondary border-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Subject</Label>
                      <Select value={newNote.subject} onValueChange={v => setNewNote({...newNote, subject: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-secondary border-none font-bold">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {contributionSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Sem</Label>
                      <Select value={newNote.semester} onValueChange={v => setNewNote({...newNote, semester: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-secondary border-none font-bold">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(8)].map((_, i) => <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddNote} disabled={isUploading} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                  Initialize Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Accessing Library...</p>
            </div>
          ) : displayNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNotes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  isOwner={user?.uid === note.uploadedBy}
                  isSaved={userDoc?.savedNotes?.includes(note.id)}
                  onSave={() => handleSaveNote(note.id, userDoc?.savedNotes?.includes(note.id) || false)}
                  onDelete={() => handleDeleteNote(note.id)}
                  onView={() => handleLogActivity(note.subject)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 bg-card/30 rounded-[40px] border border-dashed border-border">
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div>
                <h3 className="text-foreground text-xl font-black uppercase tracking-tight">No artifacts found</h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest max-w-xs mt-2 mx-auto">Adjust filters or initiate community contribution.</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNotes?.filter(n => n.uploadedBy === user?.uid).map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isOwner 
                isSaved={userDoc?.savedNotes?.includes(note.id)}
                onSave={() => handleSaveNote(note.id, userDoc?.savedNotes?.includes(note.id) || false)}
                onDelete={() => handleDeleteNote(note.id)}
                onView={() => handleLogActivity(note.subject)}
              />
            ))}
            {!allNotes?.some(n => n.uploadedBy === user?.uid) && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-[40px] bg-card/20 flex flex-col items-center gap-4">
                <Plus className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Workspace archive empty.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNotes?.filter(n => userDoc?.savedNotes?.includes(n.id)).map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isOwner={user?.uid === note.uploadedBy}
                isSaved 
                onSave={() => handleSaveNote(note.id, true)}
                onDelete={() => handleDeleteNote(note.id)}
                onView={() => handleLogActivity(note.subject)}
              />
            ))}
            {!allNotes?.some(n => userDoc?.savedNotes?.includes(n.id)) && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-[40px] bg-card/20 flex flex-col items-center gap-4">
                <Bookmark className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Personal collection empty.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoteCard({ note, isSaved, isOwner, onSave, onDelete, onView }: { 
  note: any; 
  isSaved?: boolean; 
  isOwner?: boolean;
  onSave: () => void;
  onDelete?: () => void;
  onView?: () => void;
}) {
  return (
    <Card className="rounded-[28px] border-border bg-card hover:border-primary/20 transition-all duration-500 group overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
            <FileText className="h-7 w-7" />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 rounded-xl transition-all", isSaved ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}
              onClick={onSave}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </Button>
            {isOwner && (
              <Button variant="ghost" size="icon" onClick={onDelete} className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all">
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        <CardTitle className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight truncate">
          {note.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] mt-2 flex items-center gap-2">
          <span className="text-primary/60">{note.subject}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>Semester {note.semester}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-8 pt-4 space-y-8">
        <div className="flex items-center justify-between border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="text-sm font-black text-foreground">{note.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">({note.ratingCount || 1})</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Artifact</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="secondary"
            className="rounded-xl h-14 bg-secondary hover:bg-secondary/80 text-foreground font-black text-xs uppercase tracking-widest transition-all"
            onClick={() => { onView?.(); window.open(note.fileURL, '_blank'); }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            className="rounded-xl h-14 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest transition-all vibrant-blue-glow"
            asChild
          >
            <a href={note.fileURL} download target="_blank" rel="noopener noreferrer" onClick={onView}>
              <Download className="h-4 w-4 mr-2" />
              Obtain
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
