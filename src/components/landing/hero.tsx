
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-48 pb-32 px-4 bg-gradient-to-br from-[#3B82F6] via-[#6366F1] to-[#8B5CF6]">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles className="h-3.5 w-3.5" />
          The Future of Learning
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[0.95]"
        >
          Academic Success, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Redefined.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-xl text-white/80 font-medium leading-relaxed"
        >
          Manage your academic journey with precision. Zenora integrates AI intelligence with student-focused productivity tools in one approachable workspace.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Button asChild size="lg" className="h-14 px-10 rounded-xl bg-white text-primary hover:bg-white/90 text-sm font-bold shadow-2xl transition-all active:scale-95 group">
            <Link href="/login">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-10 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all text-sm font-bold">
            Explore Features
          </Button>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full leading-[0]">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-background fill-current">
          <path d="M0 120L60 110C120 100 240 80 360 73.3C480 66.7 600 73.3 720 83.3C840 93.3 960 106.7 1080 103.3C1200 100 1320 80 1380 70L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" />
        </svg>
      </div>
    </section>
  );
}
