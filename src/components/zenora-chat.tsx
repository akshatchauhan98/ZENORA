'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, doc, writeBatch, getDocs } from 'firebase/firestore';
import { zenoraChat } from '@/ai/flows/zenora-chat-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Trash2, Bot, Lightbulb, BookOpen, Quote, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function ChatColoredResponse({ text }: { text: string }) {
  const sections = useMemo(() => {
    if (!text) return [];
    const pattern = /\[(CONCEPT|EXPLANATION|EXAMPLE|FINAL_ANSWER)\]/g;
    const splitText = text.split(pattern);
    const result: { type: string; content: string }[] = [];

    if (splitText[0].trim()) {
      result.push({ type: 'intro', content: splitText[0].trim() });
    }

    for (let i = 1; i < splitText.length; i += 2) {
      const type = splitText[i];
      const content = splitText[i + 1]?.trim() || '';
      result.push({ type, content });
    }
    return result;
  }, [text]);

  if (sections.length === 0) {
    return <div className="whitespace-pre-wrap animate-in fade-in duration-700">{text}</div>;
  }

  return (
    <div className="space-y-5">
      {sections.map((section, idx) => {
        const animationClass = `animate-in slide-in-from-bottom-2 fade-in duration-500 [animation-delay:${idx * 150}ms] fill-mode-forwards opacity-0`;
        switch (section.type) {
          case 'CONCEPT':
            return (
              <div key={idx} className={cn("rounded-2xl border-l-4 border-primary bg-primary/5 p-4 text-xs", animationClass)}>
                <h4 className="flex items-center gap-2 font-black text-primary mb-2 uppercase tracking-widest text-[10px]">
                  <Lightbulb className="h-3.5 w-3.5" /> Core Concept
                </h4>
                <div className="text-foreground leading-relaxed font-medium">{section.content}</div>
              </div>
            );
          case 'EXPLANATION':
            return (
              <div key={idx} className={cn("rounded-2xl border-l-4 border-muted-foreground/40 bg-muted/30 p-4 text-xs", animationClass)}>
                <h4 className="flex items-center gap-2 font-black text-muted-foreground mb-2 uppercase tracking-widest text-[10px]">
                  <BookOpen className="h-3.5 w-3.5" /> Logic & Synthesis
                </h4>
                <div className="text-foreground leading-relaxed font-medium">{section.content}</div>
              </div>
            );
          case 'EXAMPLE':
            return (
              <div key={idx} className={cn("rounded-2xl border-l-4 border-primary/60 bg-primary/5 p-4 text-xs", animationClass)}>
                <h4 className="flex items-center gap-2 font-black text-primary/80 mb-2 uppercase tracking-widest text-[10px]">
                  <Quote className="h-3.5 w-3.5" /> Contextual Scenario
                </h4>
                <div className="text-foreground italic font-medium leading-relaxed">{section.content}</div>
              </div>
            );
          case 'FINAL_ANSWER':
            return (
              <div key={idx} className={cn("rounded-2xl border-l-4 border-primary bg-primary/10 p-5 text-xs", animationClass)}>
                <h4 className="flex items-center gap-2 font-black text-primary mb-2 uppercase tracking-widest text-[10px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Synthesis Conclusion
                </h4>
                <div className="text-foreground font-bold text-sm leading-relaxed">{section.content}</div>
              </div>
            );
          default:
            return <div key={idx} className={cn("whitespace-pre-wrap text-foreground text-xs font-medium leading-relaxed px-2", animationClass)}>{section.content}</div>;
        }
      })}
    </div>
  );
}

export function ZenoraChat() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userData } = useDoc(userDocRef);

  const chatMessagesRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/chat_messages`) : null),
    [user, firestore]
  );

  const chatQuery = useMemoFirebase(
    () => {
      if (!chatMessagesRef) return null;
      return query(chatMessagesRef, orderBy('timestamp', 'asc'), limit(50));
    },
    [chatMessagesRef]
  );

  const { data: messages } = useCollection(chatQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !user || !chatMessagesRef || isTyping) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      await addDoc(chatMessagesRef, {
        userId: user.uid,
        role: 'user',
        content: userMessage,
        timestamp: serverTimestamp(),
      });

      const history = (messages || []).map(m => ({
        role: m.role as 'user' | 'model',
        content: m.content,
      }));

      const result = await zenoraChat({
        message: userMessage,
        history,
        userData: {
          collegeName: userData?.collegeName,
          course: userData?.course,
          semester: userData?.semester,
        },
      });

      await addDoc(chatMessagesRef, {
        userId: user.uid,
        role: 'model',
        content: result.response,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Chat AI Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!user || !chatMessagesRef) return;
    if (!confirm('Permanently wipe neural memory history?')) return;
    const snapshot = await getDocs(chatMessagesRef);
    const batch = writeBatch(firestore);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6">
      {isOpen && (
        <Card className="flex h-[700px] w-[380px] flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-700 sm:w-[460px] border-border bg-card rounded-[40px]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card/80 p-6 text-foreground backdrop-blur-3xl">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-[20px] bg-primary vibrant-ocean-glow flex items-center justify-center">
                <Bot className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-black tracking-tight text-foreground">Zenora AI</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Oceanic Link Active</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-[18px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all" onClick={handleClearChat} title="Clear Neural History">
                <Trash2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-[18px] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all" onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0 bg-card">
            <ScrollArea className="h-full px-6">
              <div className="flex flex-col gap-8 py-10">
                {messages?.length === 0 && !isTyping && (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in fade-in duration-1000">
                    <div className="h-20 w-20 rounded-[32px] bg-primary/5 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-foreground text-xl font-black uppercase tracking-tight">System Initialized</h3>
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] max-w-[240px] mt-3 leading-relaxed">Awaiting complex oceanic queries or academic planning.</p>
                    </div>
                  </div>
                )}
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-2 max-w-[88%] group",
                      msg.role === 'user' ? "ml-auto" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-[24px] px-6 py-4 text-sm transition-all duration-500",
                        msg.role === 'user'
                          ? "bg-primary vibrant-ocean-glow text-primary-foreground rounded-tr-none"
                          : "bg-secondary text-foreground border-none rounded-tl-none shadow-sm"
                      )}
                    >
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap font-bold">{msg.content}</div>
                      ) : (
                        <ChatColoredResponse text={msg.content} />
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                    </span>
                  </div>
                ))}
                {isTyping && (
                  <div className="mr-auto flex items-center gap-4 bg-secondary rounded-[24px] px-6 py-4 text-xs animate-in slide-in-from-left-4">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                    <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Synthesizing logic</span>
                  </div>
                )}
                <div ref={scrollRef} className="h-4" />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="border-t border-border bg-card p-6">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-4">
              <Input
                placeholder="Query brand network..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isTyping}
                className="rounded-[24px] h-14 bg-secondary border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary transition-all font-bold px-6 shadow-inner"
              />
              <Button type="submit" size="icon" disabled={isTyping || !inputMessage.trim()} className="h-14 w-14 rounded-[24px] bg-primary vibrant-ocean-glow hover:bg-primary/90 transition-all flex-shrink-0 text-primary-foreground">
                <Send className="h-6 w-6" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-20 w-20 rounded-[32px] shadow-2xl transition-all duration-700 bg-primary vibrant-ocean-glow hover:scale-110 active:scale-90 group relative border border-white/10 text-primary-foreground",
          isOpen ? "rotate-[360deg]" : "rotate-0"
        )}
      >
        <div className="absolute -inset-2 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        {isOpen ? <X className="h-9 w-9 relative z-10" /> : <MessageCircle className="h-9 w-9 relative z-10" />}
      </Button>
    </div>
  );
}