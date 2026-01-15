/**
 * Notifications API Client
 *
 * API Endpoints:
 * - GET /notifications/list → Notification[]
 * - POST /notifications/read-all → void
 * - POST /notifications/{id}/read → void
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
    const data = await apiClient.get<
      { notifications?: Notification[]; data?: Notification[] } | Notification[]
    >('/notifications/list');
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if ('notifications' in data && Array.isArray(data.notifications)) return data.notifications;
      if ('data' in data && Array.isArray(data.data)) return data.data;
    }
    return [];
  },

  /**
   * Mark all notifications as read
   */
  readAll: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },

  /**
   * Mark a single notification as read
   */
  read: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
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
    const data = await apiClient.get<
      { contacts?: ContactPreferences; data?: ContactPreferences } | ContactPreferences
    >('/notifications/contacts');
    if (data && typeof data === 'object') {
      if ('contacts' in data && typeof data.contacts === 'object') return data.contacts;
      if ('data' in data && typeof data.data === 'object') return data.data;
      if (!Array.isArray(data) && !('contacts' in data) && !('data' in data))
        return data as ContactPreferences;
    }
    return {};
  },
};
