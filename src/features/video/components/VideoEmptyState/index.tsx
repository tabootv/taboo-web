import { Film } from 'lucide-react';

export function VideoEmptyState() {
  return (
    <div className="text-center py-20">
      <Film className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/50">No videos found</p>
    </div>
  );
}
