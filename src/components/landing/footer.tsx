
'use client';

import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { Mail, Github, Instagram, Linkedin, ChevronRight, ShieldCheck, Cookie, FileText, MessageSquare, Bug, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

function FooterDropdown({ label, items }: { label: string; items: { label: string; href: string; icon: any }[] }) {
  return (
    <div className="group relative">
      <button className="text-muted-foreground font-bold hover:text-primary transition-all flex items-center gap-1 group-hover:text-primary">
        {label}
        <ChevronRight className="h-3 w-3 rotate-90 transition-transform group-hover:rotate-[270deg]" />
      </button>
      
      <div className="absolute bottom-full left-0 mb-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
        <div className="w-56 rounded-[24px] border border-border bg-card/80 backdrop-blur-xl p-2 shadow-2xl overflow-hidden">
          {items.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group/item"
            >
              <item.icon className="h-4 w-4 text-primary/60 group-hover/item:text-primary transition-colors" />
              {item.label}
              <ChevronRight className="ml-auto h-3 w-3 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ayushi-singh-792969343',
      icon: Linkedin,
      label: 'View LinkedIn Profile'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/ayushisingh7819',
      icon: Github,
      label: 'View GitHub Profile'
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/aayyushiii.s',
      icon: Instagram,
      label: 'Follow on Instagram'
    }
  ];

  const privacyItems = [
    { label: 'Data Usage', href: '#', icon: ShieldCheck },
    { label: 'Cookie Policy', href: '#', icon: Cookie },
    { label: 'Terms of Service', href: '#', icon: FileText },
  ];

  const contactItems = [
    { label: 'Email Support', href: 'mailto:zenoraa.app@gmail.com', icon: Send },
    { label: 'Student Discord', href: '#', icon: MessageSquare },
    { label: 'Report a Bug', href: '#', icon: Bug },
  ];

  return (
    <footer className="bg-card pt-20 pb-10 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 grid gap-12 md:grid-cols-4">
        <div className="space-y-6 md:col-span-2">
          <AppLogo />
          <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
            Zenora is a modern academic operating system designed to streamline the student experience through intelligent AI tools and personalized productivity workflows.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                className={cn(
                  "h-12 w-12 rounded-xl bg-background flex items-center justify-center text-foreground border border-border",
                  "transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110 shadow-lg"
                )}
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-primary">Quick Links</h4>
          <ul className="space-y-4">
            <li><Link href="/" className="text-muted-foreground font-bold hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/dashboard" className="text-muted-foreground font-bold hover:text-primary transition-colors">Dashboard</Link></li>
            <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground font-bold hover:text-primary transition-colors">Features</button></li>
            <li><FooterDropdown label="Contact" items={contactItems} /></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-primary">Support</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span className="text-muted-foreground font-medium break-all">zenoraa.app@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary shrink-0" />
              <span className="text-muted-foreground font-medium">Global Community</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm font-medium">© 2024 Zenora. All rights reserved.</p>
        <div className="flex gap-8 text-sm font-bold text-muted-foreground items-center">
          <FooterDropdown label="Privacy" items={privacyItems} />
          <Link href="#" className="hover:text-foreground transition-colors">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
