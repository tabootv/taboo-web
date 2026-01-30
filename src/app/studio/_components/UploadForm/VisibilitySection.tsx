import { Globe, Lock } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import type { UploadConfig, UploadFormInput } from './types';

interface VisibilitySectionProps {
  config: UploadConfig;
  control: Control<UploadFormInput>;
}

export function VisibilitySection({ config, control }: VisibilitySectionProps) {
  const accentClass = config.type === 'video' ? 'accent-[#ab0013]' : 'accent-purple-500';
  const toggleBgClass = config.type === 'video' ? 'bg-[#ab0013]' : 'bg-purple-500';

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold text-white mb-4">Visibility</h2>
        <FormField
          control={control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {config.type === 'video' ? (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        checked={field.value === 'public'}
                        onChange={() => field.onChange('public')}
                        className={`w-4 h-4 ${accentClass}`}
                      />
                      <Globe className="w-5 h-5 text-white/40" />
                      <div>
                        <p className="text-white font-medium">Public</p>
                        <p className="text-sm text-white/40">Everyone can watch this video</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        checked={field.value === 'private'}
                        onChange={() => field.onChange('private')}
                        className={`w-4 h-4 ${accentClass}`}
                      />
                      <Lock className="w-5 h-5 text-white/40" />
                      <div>
                        <p className="text-white font-medium">Private</p>
                        <p className="text-sm text-white/40">Only you can watch this video</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        checked={field.value === 'public'}
                        onChange={() => field.onChange('public')}
                        className={`w-4 h-4 ${accentClass}`}
                      />
                      <Globe className="w-5 h-5 text-white/40" />
                      <span className="text-white font-medium">Public</span>
                    </label>
                    <label className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        checked={field.value === 'private'}
                        onChange={() => field.onChange('private')}
                        className={`w-4 h-4 ${accentClass}`}
                      />
                      <Lock className="w-5 h-5 text-white/40" />
                      <span className="text-white font-medium">Private</span>
                    </label>
                  </div>
                )}
              </FormControl>
            </FormItem>
          )}
        />

        <div className="mt-6 pt-6 border-t border-white/10">
          <FormField
            control={control}
            name="isNsfw"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-white font-medium">
                        {config.type === 'video'
                          ? 'Age-restricted content (18+)'
                          : 'Age-restricted (18+)'}
                      </p>
                      <p className="text-sm text-white/40">
                        {config.type === 'video'
                          ? 'Mark this video as not suitable for younger audiences'
                          : 'Not suitable for younger audiences'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${field.value ? toggleBgClass : 'bg-white/20'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'left-7' : 'left-1'}`}
                      />
                    </button>
                  </label>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
