'use client';

import { BarChart3, TrendingUp, Eye, Users, Clock, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <p className="text-white/40">Track your channel performance</p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ab0013]/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-[#ab0013]" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h2>
          <p className="text-white/40 max-w-md mx-auto">
            We're building powerful analytics tools to help you understand your audience and grow your channel.
          </p>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <h3 className="text-lg font-semibold text-white mb-4">What's Coming</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PreviewCard
          icon={Eye}
          title="View Analytics"
          description="Track views over time, see which videos perform best"
        />
        <PreviewCard
          icon={Users}
          title="Audience Insights"
          description="Understand your audience demographics and behavior"
        />
        <PreviewCard
          icon={TrendingUp}
          title="Growth Trends"
          description="Monitor subscriber growth and engagement rates"
        />
        <PreviewCard
          icon={Clock}
          title="Watch Time"
          description="See how long viewers watch your content"
        />
        <PreviewCard
          icon={ThumbsUp}
          title="Engagement"
          description="Track likes, comments, and shares"
        />
        <PreviewCard
          icon={BarChart3}
          title="Revenue"
          description="Monitor your earnings and payouts"
        />
      </div>
    </div>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition-all hover:scale-[1.02]">
      <CardContent className="p-5">
        <div className="p-2 rounded-xl bg-[#ab0013]/20 w-fit mb-3">
          <Icon className="w-5 h-5 text-[#ab0013]" />
        </div>
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-sm text-white/40">{description}</p>
      </CardContent>
    </Card>
  );
}
