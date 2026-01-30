import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UploadConfig } from './types';

interface UploadProgressProps {
  config: UploadConfig;
  progress: number;
}

export function UploadProgress({ config, progress }: UploadProgressProps) {
  const progressBgClass = config.type === 'video' ? 'bg-[#ab0013]' : 'bg-purple-500';
  const spinnerColorClass = config.type === 'video' ? 'text-[#ab0013]' : 'text-purple-400';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className={`w-5 h-5 ${spinnerColorClass} animate-spin`} />
          <span className="text-white font-medium">
            Uploading {config.type === 'video' ? 'video' : 'short'}...
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressBgClass} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-white/40">{progress}% complete</p>
      </CardContent>
    </Card>
  );
}
