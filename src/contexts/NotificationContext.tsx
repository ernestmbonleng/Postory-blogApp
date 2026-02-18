import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotificationSocket } from '@/src/hooks/useNotificationSocket';
import { notificationService } from '@/src/services/notification.service';
import { AppNotification } from '@/src/types/notification';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { notifications: socketNotifications, setNotifications: setSocketNotifications } = 
    useNotificationSocket();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [notifData, countData] = await Promise.all([
        notificationService.getNotifications(1, 20),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifData.notifications);
      setUnreadCount(countData.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time notifications
  useEffect(() => {
    if (socketNotifications.length > 0) {
      setNotifications(prev => [...socketNotifications, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, [socketNotifications]);

  // Mark as read
  const markAsRead = async (ids: string[]) => {
    try {
      await notificationService.markAsRead(ids);
      setNotifications(prev =>
        prev.map(n => (ids.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};