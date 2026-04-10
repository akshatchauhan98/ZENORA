'use client';

import { ShieldCheck, Zap, UserCheck, LayoutGrid } from 'lucide-react';

const reasons = [
  {
    title: 'Personalized Learning',
    description: 'The platform adapts to your degree, semester, and individual pace for maximum efficiency.',
    icon: UserCheck
  },
  {
    title: 'Smart AI Assistant',
    description: 'Specialized tutors that understand complex academic requirements, not just general chat.',
    icon: Zap
  },
  {
    title: 'All-in-One Platform',
    description: 'No more switching tabs. Notes, math, planning, and wellbeing are integrated seamlessly.',
    icon: LayoutGrid
  },
  {
    title: 'Student-Focused Design',
    description: 'Built by specialists who understand the unique pressures and goals of university life.',
    icon: ShieldCheck
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-32 bg-secondary/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-20 tracking-tight">Why Students Trust <span className="text-primary">Zenora</span></h2>
        
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div key={reason.title} className="space-y-6 flex flex-col items-center group">
              <div className="h-20 w-20 rounded-[32px] bg-card backdrop-blur-xl border border-border flex items-center justify-center shadow-2xl group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                <reason.icon className="h-10 w-10 text-primary group-hover:text-primary-foreground transition-all" />
              </div>
              <h3 className="text-xl font-black text-foreground">{reason.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed opacity-80">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}