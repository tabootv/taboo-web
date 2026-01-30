import { BarChart3, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';
type GroupBy = 'day' | 'week' | 'month';

interface AnalyticsHeaderProps {
  promoterName?: string | null | undefined;
  dateRange: DateRange;
  groupBy: GroupBy;
  onDateRangeChange: (value: DateRange) => void;
  onGroupByChange: (value: GroupBy) => void;
  onRefetch: () => void;
  isRefetching: boolean;
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '365d', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

const GROUP_BY_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

export function AnalyticsHeader({
  promoterName,
  dateRange,
  groupBy,
  onDateRangeChange,
  onGroupByChange,
  onRefetch,
  isRefetching,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-red-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#ab0013]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>
        <p className="text-white/60 text-sm italic">
          JARVIS, run performance analytics{promoterName && ` for ${promoterName}`}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={dateRange} onValueChange={(value) => onDateRangeChange(value as DateRange)}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={groupBy} onValueChange={(value) => onGroupByChange(value as GroupBy)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onRefetch} variant="outline" size="sm" disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}

export { DATE_RANGE_OPTIONS };
