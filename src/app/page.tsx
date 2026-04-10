
'use client';

import { useUser } from '@/firebase';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { LandingFeatures } from '@/components/landing/features';
import { AIHighlight } from '@/components/landing/ai-highlight';
import { WhyChooseUs } from '@/components/landing/why-choose-us';
import { ContactFeedback } from '@/components/landing/contact-feedback';
import { Footer } from '@/components/landing/footer';
import { LiveBackground } from '@/components/live-background';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LiveBackground />
      <Navbar />
      <main>
        <Hero />
        <section id="features">
          <LandingFeatures />
        </section>
        <AIHighlight />
        <WhyChooseUs />
        <section id="contact">
          <ContactFeedback />
        </section>
      </main>
      <Footer />
    </div>
  );
}
