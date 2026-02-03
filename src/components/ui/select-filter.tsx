/**
 * SelectFilter Component
 * Glassmorphic filter pill with dropdown select
 */

import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

interface SelectFilterProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

export function SelectFilter({ label, value, options, onChange }: SelectFilterProps) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
      <span className="text-[11px] uppercase tracking-wide text-white/50">{label}</span>
      <NativeSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs md:text-sm text-white font-semibold border-none shadow-none pr-7 h-8"
        size="sm"
      >
        {options.map((opt) => (
          <NativeSelectOption key={opt.value} value={opt.value}>
            {opt.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
