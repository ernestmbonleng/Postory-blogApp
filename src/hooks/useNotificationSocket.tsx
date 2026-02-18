import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { AppNotification } from '@/src/types/notification';

export const useNotificationSocket = () => {
  const { token, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !userId) return;

    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to notification server');
      setIsConnected(true);
    });

    // FIX: Ensure the parameter uses your AppNotification type
    socketInstance.on('new-notification', (notification: AppNotification) => {
      console.log('📨 New notification received:', notification);
      
      // Update local state list
      setNotifications(prev => [notification, ...prev]);
      
      // FIX: Use window.Notification to prevent collision with your variable name
      if (typeof window !== 'undefined' && window.Notification?.permission === 'granted') {
        new window.Notification('New Blog Activity', {
          body: notification.content,
          icon: notification.actorId?.profilePicture,
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Request browser permission for popups
    if (typeof window !== 'undefined' && window.Notification?.permission === 'default') {
      window.Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [token, userId]);

  return { socket, notifications, setNotifications, isConnected };
};