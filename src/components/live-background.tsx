'use client';
import React, { useEffect, useState } from 'react';

export function LiveBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background" aria-hidden="true">
      {/* Unified Oceanic Blurred Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Floating Interactive Orbs - Teal tinted */}
      <div className="absolute top-[15%] left-[25%] w-32 h-32 bg-[#4F7C82]/5 rounded-full blur-[60px] animate-bounce" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[20%] right-[30%] w-48 h-48 bg-[#93B1B5]/5 rounded-full blur-[80px] animate-bounce" style={{ animationDuration: '12s' }} />

      {/* Tiny Particles */}
      <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 bg-[#B8E3E9]/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-[#B8E3E9]/20 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[40%] left-[50%] w-1 h-1 bg-white/10 rounded-full animate-pulse" style={{ animationDuration: '3s' }} />

      {/* Modern Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{backgroundImage: `radial-gradient(circle at 2px 2px, rgba(79,124,130,0.15) 1px, transparent 0)`, backgroundSize: '40px 40px'}} />
    </div>
  );
}