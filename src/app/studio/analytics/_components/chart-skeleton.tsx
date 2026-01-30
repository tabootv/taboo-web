export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return <div className="animate-pulse bg-white/5 rounded-xl" style={{ height }} />;
}
