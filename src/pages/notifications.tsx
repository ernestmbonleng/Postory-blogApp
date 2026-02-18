import { useEffect, useState } from 'react';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, markAsRead, isLoading, refreshNotifications } = useNotifications();
  const [page, setPage] = useState(1);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead([notification._id]);
    }
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment';
      case 'subscribe':
        return 'subscribed to your blog';
      default:
        return notification.content;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Link
            key={notification._id}
            href={notification.postId ? `/post/${notification.postId.slug}` : '#'}
            onClick={() => handleNotificationClick(notification)}
            className={`block p-4 rounded-lg border ${
              !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
            } hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">
                {notification.type === 'like' && '❤️'}
                {notification.type === 'comment' && '💬'}
                {notification.type === 'reply' && '↩️'}
                {notification.type === 'subscribe' && '🔔'}
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-semibold">{notification.actorId?.username}</span>
                  {' '}{getNotificationText(notification)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
                {notification.postId && (
                  <p className="text-sm text-gray-600 mt-1">
                    on: "{notification.postId.title}"
                  </p>
                )}
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}