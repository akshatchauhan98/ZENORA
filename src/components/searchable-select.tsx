'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value.toLowerCase() === value?.toString().toLowerCase()),
    [options, value]
  );

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
    setSearch('');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-bold h-14 rounded-2xl bg-slate-900/50 border-white/5 text-[#F1F5F9] hover:bg-slate-900 transition-all"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl bg-slate-900 border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="p-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl bg-slate-800/50 border-white/5 text-white placeholder:text-slate-500"
            aria-label="Search"
          />
        </div>
        <ScrollArea className="h-60">
          <div role="listbox" className="p-2 pt-0">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Button
                  variant="ghost"
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full justify-start font-medium h-auto py-3 px-4 rounded-xl mb-1 text-slate-300 hover:text-white hover:bg-white/5',
                    value === option.value && 'bg-blue-600 text-white hover:bg-blue-500'
                  )}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </Button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 font-medium">
                No results found.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}