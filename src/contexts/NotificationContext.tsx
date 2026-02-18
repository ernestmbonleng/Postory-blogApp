import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNotificationSocket } from '@/src/hooks/useNotificationSocket';
import { notificationService } from '@/src/services/notification.service';
import { AppNotification } from '@/src/types/notification';
import { useAuth } from '@/src/hooks/useAuth'; 

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
  
    const { token } = useAuth();
    const isAuthenticated = !!token; 

  // ✅ Use useCallback to memoize the function
  const loadNotifications = useCallback(async () => {
    // If not authenticated, clear notifications and return
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [notifData, countData] = await Promise.all([
        notificationService.getNotifications(1, 20),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifData.notifications || []);
      setUnreadCount(countData.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Don't throw - just set empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]); // ✅ Dependencies

  // ✅ Load notifications when auth state changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]); // ✅ Run when loadNotifications changes

  // Handle real-time notifications
  useEffect(() => {
    if (socketNotifications.length > 0 && isAuthenticated) {
      setNotifications(prev => {
        // Avoid duplicates
        const newNotifs = socketNotifications.filter(
          newNotif => !prev.some(existing => existing._id === newNotif._id)
        );
        return [...newNotifs, ...prev];
      });
      setUnreadCount(prev => prev + socketNotifications.length);
    }
  }, [socketNotifications, isAuthenticated]);

  // Mark as read
  const markAsRead = async (ids: string[]) => {
    if (!isAuthenticated || !token) return;
    
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
    if (!isAuthenticated || !token) return;
    
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // ✅ Clear notifications on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

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