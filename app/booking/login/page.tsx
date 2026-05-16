"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coffee, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CustomerLogin() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      if (res.ok) {
        localStorage.setItem('customer-name', name);
        router.push('/booking');
      } else {
        alert('Đăng nhập thất bại, vui lòng thử lại.');
      }
    } catch (error) {
      alert('Có lỗi xảy ra.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-zinc-500 hover:text-zinc-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </Link>

      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-zinc-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center rounded-xl mb-4">
            <Coffee className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Đặt bàn trực tuyến</h1>
          <p className="text-sm text-zinc-500 mt-2">Vui lòng nhập thông tin để tiếp tục</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Họ và tên</label>
            <Input 
              required
              placeholder="Nguyễn Văn A" 
              className="h-12 rounded-none border-zinc-200 focus:ring-zinc-900" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Số điện thoại</label>
            <Input 
              required
              type="tel"
              placeholder="090xxxxxxx" 
              className="h-12 rounded-none border-zinc-200 focus:ring-zinc-900" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-14 bg-zinc-900 text-white rounded-none font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
            Tiếp tục đặt bàn
          </Button>
        </form>
      </div>
    </div>
  );
}
