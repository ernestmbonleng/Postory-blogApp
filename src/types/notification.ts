export interface AppNotification {
    _id: string;
    recipientId: string;
    actorId: {
      _id: string;
      username: string;
      profilePicture?: string;
      displayName?: string;
    };
    type: 'like' | 'comment' | 'post' | 'subscribe' | 'reply';
    postId?: {
      _id: string;
      title: string;
      slug: string;
    };
    commentId?: string;
    content: string;
    isRead: boolean;
    isClicked: boolean;
    count: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface NotificationResponse {
    notifications: AppNotification[];
    total: number;
    page: number;
    totalPages: number;
    unreadCount: number;
  }