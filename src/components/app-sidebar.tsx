
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Briefcase,
  HeartPulse,
  Building2,
  BrainCircuit,
  FileQuestion,
  Home,
  Rocket,
} from 'lucide-react';
import { AppLogo } from './app-logo';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/career-intelligence', label: 'Career AI', icon: Rocket },
  { href: '/dashboard/academic-help', label: 'Academic Help', icon: BrainCircuit },
  { href: '/dashboard/mock-tests', label: 'Mock Tests', icon: FileQuestion },
  { href: '/dashboard/notes', label: 'Notes Repository', icon: BookOpen },
  { href: '/dashboard/planner', label: 'Planner', icon: ClipboardList },
  { href: '/dashboard/career-guidance', label: 'Guidance', icon: Briefcase },
  { href: '/dashboard/mental-health', label: 'Wellbeing', icon: HeartPulse },
  { href: '/dashboard/campus-life', label: 'Campus Life', icon: Building2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-60 border-r border-sidebar-border bg-sidebar shrink-0">
      <SidebarHeader className="p-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <AppLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-4 pt-4 gap-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "h-11 rounded-lg transition-all duration-200 font-semibold",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Link href={item.href}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    pathname === item.href ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  <span className="tracking-tight text-sm">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
