
import { GraduationCap } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="h-9 w-9 rounded-lg bg-[#0B2E33] flex items-center justify-center transition-all group-hover:scale-105 shadow-md">
        <GraduationCap className="h-5 w-5 text-[#B8E3E9]" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-inherit group-hover:text-primary transition-colors">
        Zenora
      </h1>
    </div>
  );
}
