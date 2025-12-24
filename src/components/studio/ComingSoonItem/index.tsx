interface ComingSoonItemProps {
  title: string;
  description: string;
}

export function ComingSoonItem({ title, description }: ComingSoonItemProps) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10">
      <h4 className="font-medium text-white/60 mb-1">{title}</h4>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}

