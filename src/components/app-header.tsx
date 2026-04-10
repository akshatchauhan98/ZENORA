'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export function AppHeader() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const getInitials = (email?: string | null) => {
    return email ? email.charAt(0).toUpperCase() : 'S';
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-8">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {isUserLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border hover:border-primary/40 transition-all p-0 overflow-hidden hover:scale-110 active:scale-95">
                <Avatar className="h-full w-full">
                  {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                  <AvatarFallback className="bg-accent text-primary text-xs font-bold uppercase">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-card border-border text-foreground rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-bold leading-none text-foreground">
                    {user?.displayName || 'Student'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground font-medium">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-accent rounded-lg mx-1 my-1 transition-colors">
                <Link href="/" className="w-full flex items-center text-sm font-medium">
                  <Home className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Home Page</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-3 cursor-pointer focus:bg-accent rounded-lg mx-1 my-1 transition-colors">
                <Link href="/dashboard" className="w-full flex items-center text-sm font-medium">
                  <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>My Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="p-3 cursor-pointer text-destructive focus:bg-destructive/10 rounded-lg mx-1 my-1 transition-colors text-sm font-medium">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Log out session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}