/**
 * Notifications API Client
 *
 * API Endpoints:
 * - GET /notifications/list → Notification[]
 * - POST /notifications/read-all → void
 * - DELETE /notifications/delete-all → void
 * - DELETE /notifications/{id} → void
 * - GET /notifications/contacts → ContactPreferences
 */

import type { Notification } from '../types';
import { apiClient } from './base-client';

export type ContactPreferences = Record<string, boolean>;

export const notificationsClient = {
  /**
   * Get list of notifications
   */
  list: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get('/notifications/list');
    return data.notifications || data.data || [];
  },

  /**
   * Mark all notifications as read
   */
  readAll: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Delete all notifications
   */
  deleteAll: async (): Promise<void> => {
    await apiClient.delete('/notifications/delete-all');
  },

  /**
   * Delete a single notification
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Get contact preferences
   */
  getContactPreferences: async (): Promise<ContactPreferences> => {
    const { data } = await apiClient.get('/notifications/contacts');
    return data.contacts || data.data || {};
  },
};

