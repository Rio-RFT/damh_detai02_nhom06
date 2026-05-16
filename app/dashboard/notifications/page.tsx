"use client";

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Trash2, ChevronLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/notification-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-zinc-500" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Tất cả thông báo</h1>
          </div>
          <p className="text-zinc-500 text-sm pl-10">Theo dõi lịch sử đặt bàn và các hoạt động của quán</p>
        </div>
        
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-6 border-zinc-200"
            onClick={handleMarkAllRead}
            disabled={!notifications.some(n => !n.isRead)}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden min-h-[600px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[600px] gap-4">
            <div className="w-12 h-12 border-4 border-zinc-100 border-t-primary rounded-full animate-spin" />
            <p className="text-zinc-400 font-medium animate-pulse uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-zinc-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-6 md:p-8 flex items-start gap-6 transition-all hover:bg-zinc-50/50 group",
                  !n.isRead ? "bg-primary/[0.02]" : "opacity-75"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                  n.type === 'success' ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
                )}>
                  {n.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-base leading-tight",
                      !n.isRead ? "font-bold text-zinc-900" : "font-medium text-zinc-500"
                    )}>
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </div>
                    {n.customerName && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        Giờ đến: {n.bookingTime}
                      </div>
                    )}
                  </div>
                </div>

                {!n.isRead && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] text-center p-12">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 text-zinc-200">
              <Bell className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Chưa có thông báo nào</h3>
            <p className="text-zinc-500 max-w-xs mx-auto text-sm">Khi khách hàng đặt bàn hoặc có hoạt động mới, thông báo sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
