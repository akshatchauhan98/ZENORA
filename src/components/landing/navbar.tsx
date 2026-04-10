
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogIn, LogOut, ChevronRight, Mail, MessageSquare, Bug, ShieldCheck, Cookie, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { ThemeToggle } from '@/components/theme-toggle';

function NavDropdown({ label, items }: { label: string; items: { label: string; href: string; icon: any }[] }) {
  return (
    <div className="group relative py-1">
      <button className="text-sm font-semibold transition-all text-white opacity-80 group-hover:opacity-100 flex items-center gap-1">
        {label}
        <ChevronRight className="h-3 w-3 rotate-90 transition-transform group-hover:rotate-[270deg]" />
      </button>
      
      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
        <div className="w-48 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl p-2 shadow-2xl overflow-hidden">
          {items.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/90 hover:bg-primary/10 hover:text-white transition-all group/item"
            >
              <item.icon className="h-4 w-4 text-primary/80 group-hover/item:text-primary transition-colors" />
              {item.label}
              <ChevronRight className="ml-auto h-3 w-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const contactItems = [
    { label: 'Email Support', href: 'mailto:zenoraa.app@gmail.com', icon: Mail },
    { label: 'Student Discord', href: '#', icon: MessageSquare },
    { label: 'Report a Bug', href: '#', icon: Bug },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-4 sm:px-6",
      "bg-black/20 backdrop-blur-[15px] border-b border-white/10",
      isScrolled ? "py-3 shadow-sm" : "py-4"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <div className="text-white">
            <AppLogo />
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={cn(
              "text-sm font-semibold transition-all relative py-1 text-white hover:text-white/80",
              pathname === '/' ? "opacity-100" : "opacity-80"
            )}
          >
            Home
            {pathname === '/' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FFD500] rounded-full" />
            )}
          </Link>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-semibold transition-all opacity-80 text-white hover:text-white/80"
          >
            Features
          </button>
          
          <NavDropdown label="Contact" items={contactItems} />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="rounded-xl text-white/80 hover:text-white transition-all">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild className="rounded-xl font-bold bg-gradient-to-r from-[#FF8A8A] to-[#F472B6] text-white hover:opacity-90 shadow-lg shadow-pink-500/20 border-none transition-all">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Register
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
