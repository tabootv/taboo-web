interface ComingSoonItemProps {
  title: string;
  description: string;
}

export function ComingSoonItem({ title, description }: ComingSoonItemProps) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 hover:bg-white/[0.07] transition-colors">
      <h4 className="font-medium text-white/50 mb-1">{title}</h4>
      <p className="text-sm text-white/30">{description}</p>
    </div>
  );
}
