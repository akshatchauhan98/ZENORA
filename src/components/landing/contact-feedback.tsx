
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, Star, Loader2, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactFeedback() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      userEmail: formData.get('email'),
      message: formData.get('message'),
      rating: rating,
      timestamp: serverTimestamp(),
    };

    if (!data.name || !data.userEmail || !data.message) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'feedback'), data);
      toast({ 
        title: 'Success!', 
        description: 'Your feedback has been received. Our team will contact you via zenoraa.app@gmail.com if needed.' 
      });
      (e.target as HTMLFormElement).reset();
      setRating(0);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-32 px-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-foreground tracking-tight">Get in Touch & Feedback</h2>
          <p className="text-muted-foreground font-medium max-w-lg mx-auto">
            We value your input. Whether you have a question or want to share your experience, we're here to listen.
          </p>
        </div>

        <Card className="rounded-[48px] overflow-hidden border border-border shadow-2xl glass-card">
          <CardContent className="p-0 grid md:grid-cols-5">
            <div className="md:col-span-2 bg-card p-12 text-foreground flex flex-col justify-between border-r border-border">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">Let's Connect</h3>
                  <p className="text-muted-foreground font-medium">Need help? Contact us at zenoraa.app@gmail.com</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <a href="mailto:zenoraa.app@gmail.com" className="font-bold text-foreground hover:text-primary transition-colors">
                      zenoraa.app@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-foreground">Global Support Link</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-12 rounded-xl gap-2 font-bold" asChild>
                  <a href="mailto:zenoraa.app@gmail.com">
                    <Mail className="h-4 w-4" />
                    Email Us
                  </a>
                </Button>
              </div>

              <div className="pt-12">
                <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4">Social Presence</div>
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center font-bold text-muted-foreground hover:text-primary transition-colors border border-border cursor-pointer">IG</div>
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center font-bold text-muted-foreground hover:text-primary transition-colors border border-border cursor-pointer">TW</div>
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center font-bold text-muted-foreground hover:text-primary transition-colors border border-border cursor-pointer">LI</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="md:col-span-3 p-12 bg-background/50 space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Full Name</Label>
                  <Input name="name" placeholder="John Doe" className="h-12 rounded-xl bg-card border-border text-foreground focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Email Address</Label>
                  <Input name="email" type="email" placeholder="m@example.com" className="h-12 rounded-xl bg-card border-border text-foreground focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Your Message</Label>
                  <Textarea name="message" placeholder="How can we help?" className="min-h-[120px] rounded-xl bg-card border-border text-foreground focus:border-primary transition-all" />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Rate Your Experience</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={cn(
                          "transition-all duration-300 transform active:scale-90",
                          rating >= star ? "text-primary" : "text-muted hover:text-primary/50"
                        )}
                      >
                        <Star className={cn("h-8 w-8", rating >= star && "fill-current")} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-95" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Send className="h-6 w-6 mr-2" />}
                Send to Zenora Team
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
