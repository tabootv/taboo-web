import { useState } from 'react';
import { Lightbulb, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface JarvisInsightsCardProps {
  insights: string[];
}

export function JarvisInsightsCard({ insights }: JarvisInsightsCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (insights.length === 0) return null;

  return (
    <Card className="bg-[#131315] border-white/6 mb-8">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#ab0013]" />
            <h2 className="text-sm font-semibold text-white">Jarvis Insights</h2>
          </div>
          {insights.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  {insights.length - 1} more <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {(expanded ? insights : insights.slice(0, 1)).map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/5 border border-white/6 rounded-lg px-4 py-3"
            >
              <Sparkles className="w-4 h-4 text-[#ab0013] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/60 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
