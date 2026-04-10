'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * IntroLoader - A high-fidelity full-screen intro animation for Zenora.
 * Plays once per session and transitions to the main dashboard.
 */
export function IntroLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro in this session
    const hasSeenIntro = sessionStorage.getItem('zenora_intro_seen');
    if (hasSeenIntro) {
      setIsVisible(false);
      return;
    }

    // Play animation for 2.5 seconds, then trigger exit transition
    const timer = setTimeout(() => {
      setIsAnimatingOut(true);
      
      // Allow transition to finish before removing from DOM
      const cleanup = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('zenora_intro_seen', 'true');
      }, 1000); // 1s transition duration
      
      return () => clearTimeout(cleanup);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)",
      isAnimatingOut ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
    )}>
      {/* 3D Minimalist Book Animation */}
      <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#3B82F6]">
          {/* Spine & Static Pages */}
          <rect x="48" y="25" width="4" height="50" rx="2" fill="currentColor" opacity="0.1" />
          <path d="M50 25 C30 25 20 30 20 30 L20 75 C20 75 30 70 50 70 Z" fill="currentColor" opacity="0.05" />
          <path d="M50 25 C70 25 80 30 80 30 L80 75 C80 75 70 70 50 70 Z" fill="currentColor" opacity="0.05" />
          
          {/* Flipping Page Animation */}
          <g className="animate-book-flip" style={{ transformOrigin: '50% 50%' }}>
            <path d="M50 25 C70 25 80 30 80 30 L80 75 C80 75 70 70 50 70 Z" fill="currentColor" />
          </g>

          {/* Glowing Data Point Particles */}
          <circle cx="75" cy="35" r="1.5" className="animate-data-point fill-[#20BEFF]" />
          <circle cx="85" cy="50" r="1" className="animate-data-point fill-[#3B82F6]" style={{ animationDelay: '0.5s' }} />
          <circle cx="70" cy="65" r="1.2" className="animate-data-point fill-[#20BEFF]" style={{ animationDelay: '1s' }} />
          <circle cx="25" cy="40" r="1" className="animate-data-point fill-[#3B82F6]" style={{ animationDelay: '1.5s' }} />
        </svg>
      </div>

      <div className="text-center animate-fade-in-up">
        <h1 className="text-4xl font-black text-[#111827] tracking-tight mb-2">Zenora</h1>
        <p className="text-[#6B7280] text-base font-medium tracking-wide">
          Your intelligent academic second brain.
        </p>
      </div>
    </div>
  );
}