"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Coffee, UtensilsCrossed, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    { label: "Sơ đồ", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Bàn", icon: Coffee, href: "/dashboard/tables" },
    { label: "Thực đơn", icon: UtensilsCrossed, href: "/dashboard/menu" },
    { label: "Tài khoản", icon: Users, href: "/dashboard/accounts" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-border text-foreground">
      <div className="px-6 py-8 flex-1">
        <Link href="/dashboard" className="flex items-center mb-12">
          <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm mr-3">
            <Coffee className="w-5 h-5" strokeWidth={2} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Minimal<span className="font-light">Cafe</span>
          </h1>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                pathname === route.href 
                  ? "bg-secondary text-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
              )}
            >
              <route.icon className="h-4 w-4 mr-3" strokeWidth={2} />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground" 
          onClick={() => router.push('/login')}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
