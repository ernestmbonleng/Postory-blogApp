import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface LikeUpdate {
  postId: string;
  liked: boolean;
  likes: number;
  userId: string;
}

interface CommentUpdate {
  postId: string;
  comment: any;
  commentCount?: number;
}

interface ViewUpdate {
  postId: string;
  views: number;
}

export const usePostSocket = (postId?: string) => {
  const { token, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Real-time state
  const [liveLikes, setLiveLikes] = useState<{ count: number; isLiked: boolean }>({ count: 0, isLiked: false });
  const [liveComments, setLiveComments] = useState<any[]>([]);
  const [liveViews, setLiveViews] = useState(0);

  useEffect(() => {
    if (!token || !userId) return;

    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token, userId },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to post socket');
      setIsConnected(true);
      
      // Join post room if postId provided
      if (postId) {
        socketInstance.emit('join-post', postId);
      }
    });

    // Like updates
    socketInstance.on('like-updated', (data: LikeUpdate) => {
      console.log('❤️ Like update:', data);
      if (data.postId === postId) {
        setLiveLikes({ count: data.likes, isLiked: data.liked });
      }
    });

    // Comment updates
    socketInstance.on('comment-added', (data: CommentUpdate) => {
      console.log('💬 Comment update:', data);
      if (data.postId === postId) {
        setLiveComments(prev => [...prev, data.comment]);
      }
    });

    // View updates
    socketInstance.on('view-updated', (data: ViewUpdate) => {
      console.log('👁️ View update:', data);
      if (data.postId === postId) {
        setLiveViews(data.views);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from post socket');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      if (postId) {
        socketInstance.emit('leave-post', postId);
      }
      socketInstance.disconnect();
    };
  }, [token, userId, postId]);

  
  const emitLike = (liked: boolean, likes: number) => {
    if (socket && isConnected && postId) {
      socket.emit('post-liked', { postId, liked, likes });
    }
  };

  return {
    isConnected,
    liveLikes,
    liveComments,
    liveViews,
    emitLike
  };
};