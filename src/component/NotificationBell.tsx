import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Reply, 
  Circle,
  MoreHorizontal
} from 'lucide-react'; 
import { useNotifications } from '@/src/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead([notification._id]);
    }
    if (notification.postId) {
      window.location.href = `/posts/${notification.postId.slug}`;
    }
  };

  // Helper to get styled icons
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': 
        return <Heart size={18} className="fill-red-500 text-red-500" />;
      case 'comment': 
        return <MessageCircle size={18} className="text-blue-500" />;
      case 'subscribe': 
        return <UserPlus size={18} className="text-green-500" />;
      case 'reply': 
        return <Reply size={18} className="text-purple-500" />;
      default: 
        return <Bell size={18} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white">
            <h3 className="font-bold text-lg text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 flex items-start gap-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="mt-1 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="font-bold text-gray-900">
                        {notification.actorId?.username || 'Someone'}
                      </span>{' '}
                      {notification.content}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 font-medium">
                      {notification.createdAt ?
                        formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) :
                        'Just now'
                      }                      
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="mt-2 shrink-0">
                      <Circle size={8} className="fill-indigo-600 text-indigo-600" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => window.location.href = '/notifications'}
              className="w-full py-2 text-center text-sm font-bold text-indigo-600 hover:bg-white rounded-lg transition-all"
            >
              See all activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};