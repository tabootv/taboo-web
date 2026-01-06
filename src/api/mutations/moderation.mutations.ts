/**
 * Moderation Mutation Hooks
 *
 * TanStack Query mutation hooks for moderation actions
 */

import type { BlockData, ReportData } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { moderationClient } from '../client/moderation.client';

/**
 * Hook to report content
 */
export function useReport() {
  return useMutation({
    mutationFn: (reportData: ReportData) => moderationClient.report(reportData),
  });
}

/**
 * Hook to block content
 */
export function useBlockContent() {
  return useMutation({
    mutationFn: (blockData: BlockData) => moderationClient.blockContent(blockData),
  });
}

/**
 * Hook to block a user
 */
export function useBlockUser() {
  return useMutation({
    mutationFn: (uuid: string) => moderationClient.blockUser(uuid),
  });
}
