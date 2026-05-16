"use client";

import { Coffee, ArrowLeft, Star, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/menu-actions';

export default function PublicMenuPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="h-20 border-b border-zinc-100 flex items-center justify-between px-6 md:px-12 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">Minimal<span className="font-light">Cafe</span></span>
        </Link>
        <Link href="/booking">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-none px-6 text-xs font-bold uppercase tracking-widest">Đặt bàn ngay</Button>
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto w-full py-20 px-6">
        <div className="text-center mb-20 space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Thực đơn đặc sắc</h1>
          <p className="text-zinc-500 font-light max-w-lg mx-auto">Khám phá những hương vị tinh túy nhất được chúng tôi tuyển chọn và chế biến thủ công mỗi ngày.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mt-4">Đang tải thực đơn...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {products.map((item, index) => (
              <div key={item.id} className="group flex flex-col gap-6">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100 relative shadow-sm">
                   {item.imageUrl ? (
                     <img 
                       src={item.imageUrl} 
                       alt={item.name} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-zinc-300">
                       <Coffee className="w-12 h-12" />
                     </div>
                   )}
                   <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-900 shadow-sm border border-white/20">
                       {item.category?.name || 'Đồ uống'}
                     </span>
                   </div>
                </div>
                <div className="space-y-2 px-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight text-zinc-900">{item.name}</h3>
                    <span className="text-lg font-bold text-zinc-900">{item.price.toLocaleString()}đ</span>
                  </div>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-32 p-12 md:p-20 bg-zinc-900 rounded-[2.5rem] text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">Bạn đã sẵn sàng <br /> thưởng thức?</h2>
            <p className="text-zinc-400 text-lg font-light max-w-md mx-auto">Đặt bàn trước để có vị trí đẹp nhất và không phải chờ đợi.</p>
            <Link href="/booking" className="inline-block pt-4">
              <Button className="h-16 px-12 bg-white text-zinc-900 rounded-none text-sm font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all hover:translate-y-[-2px]">
                Đặt bàn ngay <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

