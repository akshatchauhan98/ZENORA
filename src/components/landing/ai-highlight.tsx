'use client';

import { Bot, Sparkles, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AIHighlight() {
  const [typedText, setTypedText] = useState('');
  const fullText = "Zenora, solve the integral: integral of x^2 dx";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 px-4 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
            <Bot className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
            Ask anything. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Get instant answers.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
            Our AI is trained on university-level curricula across disciplines. From solving complex calculus to generating mock tests, Zenora understands the context of your academic life.
          </p>
          <ul className="space-y-4">
            {['Step-by-step math solutions', 'Concept simplification', 'Exam preparation strategies', 'Resume & internship guidance'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-foreground font-bold">
                <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="h-3 w-3" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl rounded-[60px]" />
          <div className="relative rounded-[48px] bg-card shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-400/50" />
                <div className="h-3 w-3 rounded-full bg-amber-400/50" />
                <div className="h-3 w-3 rounded-full bg-blue-400/50" />
              </div>
              <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Demo Interface</div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-6 py-3 text-sm font-bold shadow-lg">
                  {typedText}
                  <span className="inline-block w-1.5 h-4 bg-current/50 animate-pulse ml-1" />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center shrink-0 border border-border">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="bg-accent/50 text-foreground rounded-2xl rounded-tl-none px-6 py-4 text-sm font-medium border border-border">
                  <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-tighter mb-2">
                    <Sparkles className="h-3 w-3" /> Specialist Response
                  </div>
                  The solution is x³/3 + C. Let me know if you'd like a step-by-step breakdown!
                </div>
              </div>
            </div>

            <div className="p-6 bg-accent/20 border-t border-border flex items-center gap-4">
              <div className="flex-1 h-12 bg-background/50 rounded-full border border-border" />
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg border border-white/10">
                <Send className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}