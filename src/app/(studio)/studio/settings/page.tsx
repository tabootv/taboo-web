'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Settings, User, Bell, Shield, Palette, Globe, Camera } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { Button } from '@/components/ui';
import { toast } from 'sonner';

export default function StudioSettingsPage() {
  const { user } = useAuthStore();
  const channel = user?.channel;

  const [channelName, setChannelName] = useState(channel?.name || '');
  const [channelDescription, setChannelDescription] = useState(channel?.description || '');

  const handleSave = () => {
    toast.success('Settings saved (demo)');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-text-secondary">Manage your channel settings</p>
      </div>

      <div className="space-y-6">
        {/* Channel Profile */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-red-primary" />
            Channel Profile
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10">
              {channel?.dp ? (
                <Image src={channel.dp} alt={channel.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-primary to-red-dark flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {channel?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2">
                <Camera className="w-4 h-4 mr-2" />
                Change Avatar
              </Button>
              <p className="text-xs text-text-secondary">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Channel Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">Channel Name</label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-colors"
            />
          </div>

          {/* Channel Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">Channel Description</label>
            <textarea
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-red-primary transition-colors resize-none"
              placeholder="Tell viewers about your channel"
            />
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-primary" />
            Notifications
          </h2>

          <div className="space-y-4">
            <ToggleSetting
              title="New subscriber notifications"
              description="Get notified when someone subscribes to your channel"
              defaultChecked={true}
            />
            <ToggleSetting
              title="Comment notifications"
              description="Get notified when someone comments on your videos"
              defaultChecked={true}
            />
            <ToggleSetting
              title="Like notifications"
              description="Get notified when someone likes your videos"
              defaultChecked={false}
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-primary" />
            Privacy
          </h2>

          <div className="space-y-4">
            <ToggleSetting
              title="Show subscriber count"
              description="Display your subscriber count publicly"
              defaultChecked={true}
            />
            <ToggleSetting
              title="Show liked videos"
              description="Allow others to see videos you've liked"
              defaultChecked={false}
            />
          </div>
        </div>

        {/* Advanced */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-primary" />
            Advanced
          </h2>

          <div className="space-y-4">
            <ToggleSetting
              title="Default video visibility"
              description="Set new videos to public by default"
              defaultChecked={true}
            />
            <ToggleSetting
              title="Allow comments on new videos"
              description="Enable comments on new uploads by default"
              defaultChecked={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-red-primary' : 'bg-white/20'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </label>
  );
}
