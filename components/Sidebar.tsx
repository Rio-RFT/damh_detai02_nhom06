"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Coffee, UtensilsCrossed, LogOut, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const allRoutes = [
    { label: "Sơ đồ", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Bàn", icon: Coffee, href: "/dashboard/tables" },
    { label: "Thực đơn", icon: UtensilsCrossed, href: "/dashboard/menu" },
    { label: "Tài khoản", icon: Users, href: "/dashboard/accounts", adminOnly: true },
  ];

  // Filter routes based on role
  const routes = allRoutes.filter(route => !route.adminOnly || user?.role === 'Quản lý');

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-border text-foreground">
      <div className="px-6 py-8 flex-1">
        <Link href="/dashboard" className="flex items-center mb-12">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain mr-3" />
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

      <div className="p-4 border-t border-border space-y-4">
        {loading ? (
          <div className="px-3 py-2 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
          </div>
        ) : user && (
          <div className="px-3 py-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-zinc-900">{user.name}</span>
              <span className={cn(
                "text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm w-fit",
                user.role === 'Quản lý' ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              )}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all font-medium" 
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
          }}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
