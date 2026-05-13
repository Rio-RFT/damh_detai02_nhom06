"use client";

import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, text: "Bàn 5 sắp đến giờ đặt (18:30)", read: false },
    { id: 2, text: "Bàn 2 đã thanh toán thành công", read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-border shrink-0">
      <div className="font-medium text-sm tracking-wide text-muted-foreground">
        Hệ thống quản lý
      </div>
      
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground hover:text-foreground rounded-full"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </Button>
        
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-sm border border-border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông báo ({unreadCount})
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`px-4 py-3 border-b border-border last:border-b-0 text-sm ${!n.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                >
                  {n.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
