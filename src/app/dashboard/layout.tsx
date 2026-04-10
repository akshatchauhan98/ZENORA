
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';
import { Loader2 } from 'lucide-react';
import { ZenoraChat } from '@/components/zenora-chat';
import { IntroLoader } from '@/components/intro-loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userDoc, isLoading: isDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    if (!isUserLoading && !isDocLoading && user && userDoc && !userDoc.isProfileComplete && pathname !== '/welcome') {
      router.push('/welcome');
    }
  }, [user, isUserLoading, userDoc, isDocLoading, router, pathname]);

  if (isUserLoading || isDocLoading || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <IntroLoader />
      <AppSidebar />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden relative">
          {children}
        </main>
        <ZenoraChat />
      </SidebarInset>
    </SidebarProvider>
  );
}
