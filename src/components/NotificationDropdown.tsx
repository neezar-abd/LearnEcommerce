'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notification';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationDropdown({ profileId }: { profileId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchNotifs = async () => {
      const { notifications: initialData, unreadCount: initialUnread } = await getNotifications(profileId);
      setNotifications(initialData);
      setUnreadCount(initialUnread);
    };
    fetchNotifs();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `profileId=eq.${profileId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Trigger bump animation
          setIsBumping(true);
          setTimeout(() => setIsBumping(false), 300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, supabase]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await markAsRead(notif.id);
    }
    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllAsRead(profileId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 hover:text-[#7C3AED] transition-all duration-200 active:scale-95 hidden md:block"
      >
        <Bell className={`w-6 h-6 ${isBumping ? 'animate-bounce text-[#7C3AED]' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right z-50 ${
          isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">Notifikasi</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Tandai dibaca
            </button>
          )}
        </div>

        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Belum ada notifikasi.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                    !notif.isRead ? 'bg-purple-50/30' : ''
                  }`}
                >
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED]"></div>
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatDate(notif.createdAt)}
                        </span>
                        {notif.link && (
                          <span className="text-[10px] text-[#7C3AED] font-semibold flex items-center gap-1">
                            Lihat <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
