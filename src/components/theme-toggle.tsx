'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function ThemeToggle() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  React.useEffect(() => {
    // Initial load from localStorage for speed
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // Sync with Firestore choice if available (cross-device consistency)
  React.useEffect(() => {
    if (userDoc?.themePreference && userDoc.themePreference !== theme) {
      const newTheme = userDoc.themePreference;
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, [userDoc?.themePreference]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // Persist to Firebase if logged in
    if (user && userDocRef) {
      try {
        await updateDoc(userDocRef, {
          themePreference: newTheme
        });
      } catch (e) {
        console.error('Failed to persist theme preference:', e);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-all"
      aria-label="Toggle Theme"
    >
      <Sun className={cn(
        "h-5 w-5 transition-all absolute",
        theme === 'dark' ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100 text-amber-500"
      )} />
      <Moon className={cn(
        "h-5 w-5 transition-all absolute",
        theme === 'light' ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100 text-primary"
      )} />
    </Button>
  );
}