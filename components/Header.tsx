"use client";

import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) { // NEW_BOOKING
          setNotifications(prev => {
            const isDuplicate = prev.some(n => n.timestamp === data.timestamp);
            if (isDuplicate) return prev;
            return [{ ...data, id: Date.now(), read: false }, ...prev].slice(0, 10);
          });
        }
      } catch (e) {}
    };

    return () => eventSource.close();
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-border shrink-0">
      <div className="font-medium text-sm tracking-wide text-muted-foreground">
        Hệ thống quản lý
      </div>
      
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground hover:text-foreground rounded-full transition-all"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse" />
          )}
        </Button>
        
        {showNotifications && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Thông báo</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "px-5 py-4 border-b border-zinc-50 last:border-b-0 cursor-pointer transition-colors hover:bg-zinc-50",
                        !n.read ? "bg-zinc-50/30" : ""
                      )}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                      }}
                    >
                      <div className="flex gap-3">
                        <div className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", !n.read ? "bg-primary" : "bg-transparent")} />
                        <div className="space-y-1">
                          <p className={cn("text-[13px] leading-relaxed", !n.read ? "text-zinc-900 font-medium" : "text-zinc-500")}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-zinc-400">
                    <p className="text-sm italic">Không có thông báo mới</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/30 text-center">
                <Link 
                  href="/dashboard/notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-widest transition-colors block w-full"
                >
                  Xem tất cả thông báo
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
