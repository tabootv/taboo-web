import Image from 'next/image';

interface Channel {
  dp?: string;
  name: string;
}

interface WelcomeHeaderProps {
  channel: Channel;
}

export function WelcomeHeader({ channel }: WelcomeHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#ab0013]/60 shadow-[0_0_40px_rgba(171,0,19,0.4)]">
        {channel.dp ? (
          <Image src={channel.dp} alt={channel.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#ab0013] to-[#7a000e] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {channel.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">Creator Studio</p>
        <h1 className="text-3xl font-bold text-white leading-tight">
          Welcome back, {channel.name}
        </h1>
        <p className="text-white/60 text-sm">
          Here&apos;s what&apos;s happening with your content.
        </p>
      </div>
    </div>
  );
}
