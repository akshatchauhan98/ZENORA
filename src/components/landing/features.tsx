'use client';

import { 
  BrainCircuit, 
  BookOpen, 
  ClipboardList, 
  Briefcase, 
  HeartPulse, 
  Building2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const features = [
  {
    title: 'Academic Help',
    description: 'Expert AI tutor for structured LaTeX math solutions and complex doubt solving.',
    details: 'Get step-by-step visualizations for calculus, algorithms, and more. Our specialist models understand the nuance of higher education.',
    icon: BrainCircuit,
    color: 'bg-blue-500/10 text-blue-500',
    glow: 'group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  {
    title: 'Notes Repository',
    description: 'Centralized document storage with powerful AI summarization capabilities.',
    details: 'Synthesize hours of lectures into concise study guides. Share artifacts with your community and build collective knowledge.',
    icon: BookOpen,
    color: 'bg-purple-500/10 text-purple-500',
    glow: 'group-hover:border-purple-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  },
  {
    title: 'AI Study Planner',
    description: 'Intelligent schedules that adapt to your assignments, exams, and deadlines.',
    details: 'Automatically prioritize tasks based on complexity and upcoming due dates. Sync your neural grid across all devices.',
    icon: ClipboardList,
    color: 'bg-indigo-500/10 text-indigo-500',
    glow: 'group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
  },
  {
    title: 'Career Guidance',
    description: 'Personalized internship suggestions and resume optimization via AI.',
    details: 'Land your dream roles with AI-driven interview prep and professional networking strategies tailored to your degree track.',
    icon: Briefcase,
    color: 'bg-sky-500/10 text-sky-500',
    glow: 'group-hover:border-sky-500 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]',
  },
  {
    title: 'Wellbeing Tracker',
    description: 'Mental health monitoring with mindfulness resources for student success.',
    details: 'Academic success requires balance. Track your mood, access breathing exercises, and maintain peak mental performance.',
    icon: HeartPulse,
    color: 'bg-rose-500/10 text-rose-500',
    glow: 'group-hover:border-rose-500 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  },
  {
    title: 'Campus Life',
    description: 'Insights into university events, workshops, and vibrant student communities.',
    details: 'Stay connected with what matters on campus. From tech fests to mentorship meetups, never miss a beat of campus culture.',
    icon: Building2,
    color: 'bg-emerald-500/10 text-emerald-500',
    glow: 'group-hover:border-emerald-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
      className={cn(
        "group relative p-8 rounded-[24px] bg-card border border-border shadow-sm transition-all duration-400",
        "cursor-default overflow-hidden",
        feature.glow
      )}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          "mb-6 p-4 rounded-xl w-fit transition-transform duration-300 group-hover:scale-110",
          feature.color
        )}>
          <feature.icon className="h-7 w-7" />
        </div>
        
        <motion.h3 layout="position" className="text-xl font-bold text-foreground mb-3">
          {feature.title}
        </motion.h3>
        
        <motion.p layout="position" className="text-muted-foreground font-medium leading-relaxed text-sm mb-4">
          {feature.description}
        </motion.p>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-muted-foreground text-xs leading-relaxed mb-6 pt-2 border-t border-border">
                {feature.details}
              </p>
              <div className="flex items-center text-primary font-bold text-xs uppercase tracking-widest group cursor-pointer">
                LEARN MORE 
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function LandingFeatures() {
  return (
    <section className="py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-4 mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight"
          >
            Everything you need for <br />
            <span className="text-primary">Academic Excellence</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium max-w-xl mx-auto text-lg leading-relaxed"
          >
            A high-performance workspace designed to streamline the student experience through approachable AI.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}