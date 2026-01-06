/**
 * LiveChat Mutation Hooks
 *
 * TanStack Query mutation hooks for live chat actions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { livechatClient } from '../client/livechat.client';

/**
 * Hook to send a message to live chat
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => livechatClient.sendMessage(content),
    onSuccess: () => {
      // Invalidate messages list to show new message
      queryClient.invalidateQueries({ queryKey: ['livechat', 'messages'] });
    },
  });
}
