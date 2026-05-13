"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock Authentication
    if (username && password) {
      router.push('/dashboard');
    } else {
      setError('Vui lòng nhập thông tin hợp lệ.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Coffee className="h-10 w-10 text-primary mb-2" strokeWidth={1.5} />
          <h1 className="text-2xl font-medium tracking-tight">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">
            Sử dụng tài khoản hệ thống của bạn
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">Tên đăng nhập</Label>
              <Input 
                id="username" 
                className="h-12 bg-transparent border-t-0 border-x-0 border-b-2 border-b-muted rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 text-base transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 pt-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 bg-transparent border-t-0 border-x-0 border-b-2 border-b-muted rounded-none focus-visible:ring-0 focus-visible:border-b-primary px-0 text-base transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 text-sm font-medium tracking-wide uppercase mt-4">
            Vào hệ thống
          </Button>
        </form>
      </div>
    </div>
  );
}
