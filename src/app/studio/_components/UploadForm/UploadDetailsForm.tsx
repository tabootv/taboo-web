import { Tag } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import type { UploadConfig, UploadFormInput } from './types';

interface UploadDetailsFormProps {
  config: UploadConfig;
  control: Control<UploadFormInput>;
}

export function UploadDetailsForm({ config, control }: UploadDetailsFormProps) {
  const focusBorderClass =
    config.type === 'video' ? 'focus:border-[#ab0013]' : 'focus:border-purple-500';

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold text-white mb-4">Details</h2>
        <div className="space-y-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title <span className="text-[#ab0013]">*</span>
                </FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    placeholder={`Enter ${config.type} title`}
                    className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none ${focusBorderClass} transition-colors`}
                    maxLength={100}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <p className="text-xs text-white/40">{field.value?.length || 0}/100</p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder={
                      config.type === 'video'
                        ? 'Tell viewers about your video'
                        : 'Add a description'
                    }
                    rows={config.type === 'video' ? 4 : 3}
                    className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none ${focusBorderClass} transition-colors resize-none`}
                    maxLength={config.descriptionMaxLength}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <p className="text-xs text-white/40">
                    {field.value?.length || 0}/{config.descriptionMaxLength}
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Tags
                </FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    placeholder={
                      config.type === 'video'
                        ? 'Add tags separated by commas'
                        : 'Add tags (comma separated)'
                    }
                    className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none ${focusBorderClass} transition-colors`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
