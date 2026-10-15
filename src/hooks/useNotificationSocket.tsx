// src/hooks/useNotificationSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { AppNotification } from '@/src/types/notification';

export const useNotificationSocket = () => {
  const { token, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Add state for real-time post updates
  const [liveLikes, setLiveLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [liveComments, setLiveComments] = useState<Record<string, any[]>>({});
  const [liveViews, setLiveViews] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!token || !userId) return;

    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}`, { // Connect to main namespace
      auth: { token, userId },
      transports: ['websocket'],
      path: '/socket.io', // Adjust if needed
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to socket server');
      setIsConnected(true);
    });

  
    socketInstance.on('like-updated', (data: { 
      postId: string; 
      liked: boolean; 
      likes: number; 
      userId: string;
      postTitle?: string;
    }) => {
      console.log('❤️ Live like update:', data);
      setLiveLikes(prev => ({
        ...prev,
        [data.postId]: { count: data.likes, isLiked: data.liked }
      }));

      // Optionally create a notification for post author
      if (data.userId !== userId) {
        // You could also show a toast here
      }
    });

    // Comment updates
    socketInstance.on('comment-added', (data: {
      postId: string;
      comment: any;
      commentCount?: number;
    }) => {
      console.log(' New live comment:', data);
      setLiveComments(prev => ({
        ...prev,
        [data.postId]: [...(prev[data.postId] || []), data.comment]
      }));
    });

    // View count updates
    socketInstance.on('view-updated', (data: {
      postId: string;
      views: number;
    }) => {
      console.log(' Live view update:', data);
      setLiveViews(prev => ({
        ...prev,
        [data.postId]: data.views
      }));
    });

    // Your existing notification listener
    socketInstance.on('new-notification', (notification: AppNotification) => {
      console.log(' New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);

      if (typeof window !== 'undefined' && window.Notification?.permission === 'granted') {
        new window.Notification('New Blog Activity', {
          body: notification.content,
          icon: notification.actorId?.profilePicture,
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    if (typeof window !== 'undefined' && window.Notification?.permission === 'default') {
      window.Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [token, userId]);

  // Helper functions to join/leave post rooms
  const joinPostRoom = (postId: string) => {
    if (socket && isConnected) {
      socket.emit('join-post', postId);
      console.log(`Joined post room: ${postId}`);
    }
  };

  const leavePostRoom = (postId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-post', postId);
      console.log(`Left post room: ${postId}`);
    }
  };

  // Emit like event
  const emitLike = (postId: string, liked: boolean, likes: number) => {
    if (socket && isConnected) {
      socket.emit('post-liked', { postId, liked, likes });
    }
  };

  return { 
    socket, 
    notifications, 
    setNotifications, 
    isConnected,
    // New state and functions
    liveLikes,
    liveComments,
    liveViews,
    joinPostRoom,
    leavePostRoom,
    emitLike
  };
};