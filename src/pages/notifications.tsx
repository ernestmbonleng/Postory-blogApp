import { useEffect, useState } from 'react';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Reply, 
  Bell,
  Circle 
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAsRead, isLoading } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead([notification._id]);
    }
  };


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': 
        return <Heart size={20} className="fill-red-500 text-red-500" />;
      case 'comment': 
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'subscribe': 
        return <UserPlus size={20} className="text-green-500" />;
      case 'reply': 
        return <Reply size={20} className="text-purple-500" />;
      default: 
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'reply': return 'replied to your comment';
      case 'subscribe': return 'subscribed to your blog';
      default: return notification.content;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
        <span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
          {notifications.length} total
        </span>
      </div>
      
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No activity yet!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification._id}
             
              href={notification.postId ? `/posts/${notification.postId.slug || notification.postId._id}` : '#'}
              onClick={() => handleNotificationClick(notification)}
              className={`block p-5 rounded-2xl border transition-all duration-200 ${
                !notification.isRead 
                  ? 'bg-indigo-50/40 border-indigo-100 hover:border-indigo-200' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="mt-1 p-2 bg-white rounded-xl shadow-sm border border-gray-50">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-900 leading-snug">
                    <span className="font-bold text-indigo-600 hover:underline">
                      {notification.actorId?.username}
                    </span>
                    {' '}{getNotificationText(notification)}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 font-medium">
                      {notification.createdAt ? 
                        formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 
                        'Just now'
                      }
                    </p>
                    {notification.postId && (
                      <>
                        <span className="text-gray-300 text-[10px]">•</span>
                        <p className="text-xs text-indigo-500 font-bold line-clamp-1">
                          {notification.postId.title}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {!notification.isRead && (
                  <div className="flex items-center justify-center h-full pt-2">
                    <Circle size={10} className="fill-indigo-600 text-indigo-600" />
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}