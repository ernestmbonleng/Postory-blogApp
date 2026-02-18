import api from './api';
import { Notification, NotificationResponse } from '@/src/types/notification';

export const notificationService = {
  // Get user notifications with pagination
  async getNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark specific notifications as read
  async markAsRead(notificationIds: string[]): Promise<{ success: boolean }> {
    const response = await api.patch('/notifications/read', { notificationIds });
    return response.data;
  },

  // Mark all as read
  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  // Real-time connection will be handled by WebSocket
};