import api from './api';
import {  NotificationResponse } from '@/src/types/notification';

export const notificationService = {

  async getNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },


  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },


  async markAsRead(notificationIds: string[]): Promise<{ success: boolean }> {
    const response = await api.patch('/notifications/read', { notificationIds });
    return response.data;
  },


  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.post('/notifications/read-all', {});
    return response.data;
  },


};