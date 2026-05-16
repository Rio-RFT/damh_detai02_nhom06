"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, Minus, Plus, X, ShoppingCart, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTables } from '@/lib/floor-plan-actions';
import { type FloorObject } from '@/lib/floor-plan-data';

import { getProducts, getCategories } from '@/lib/menu-actions';
import { createOrder } from '@/lib/order-actions';

interface ProductDB {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: {
    name: string;
  } | null;
}

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId');
  
  const [table, setTable] = useState<FloorObject | null>(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (tableId) {
        const tables = await getTables();
        const found = tables.find(t => t.id === Number(tableId));
        if (found) setTable(found);
      }

      const [dbProducts, dbCategories] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setCategories(["Tất cả", ...dbCategories.map(c => c.name)]);
      setProducts(dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || "Khác",
        price: p.price,
        image: p.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=400&fit=crop"
      })));
    }
    loadData();
  }, [tableId]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToOrder = (product: any) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setOrderItems(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleOrder = async () => {
    if (orderItems.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const res = await createOrder({
        tableId: Number(tableId),
        totalPrice: subtotal,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (res.success) {
        router.push('/dashboard');
      } else {
        alert("Lỗi khi đặt món: " + res.error);
      }
    } catch (error) {
      alert("Đã xảy ra lỗi không xác định.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="space-y-6 shrink-0 pb-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard')}
            className="rounded-2xl bg-white border border-zinc-100 shadow-sm hover:bg-zinc-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Thực đơn gọi món</h2>
            {table && (
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                Phục vụ cho {table.name} • {table.area}
              </p>
            )}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Tìm món..." 
              className="pl-11 h-12 bg-white border-zinc-100 rounded-2xl shadow-sm focus-visible:ring-zinc-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                  : "bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => addToOrder(product)}
              className="group bg-white border border-zinc-100 rounded-[2rem] p-4 cursor-pointer hover:shadow-2xl hover:shadow-zinc-200 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-zinc-100 mb-4 relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {product.category}
                </div>
              </div>
              <h3 className="text-xs font-bold text-zinc-900 line-clamp-1 mb-1">{product.name}</h3>
              <p className="text-sm font-black text-zinc-900">{new Intl.NumberFormat('vi-VN').format(product.price)} ₫</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="w-[400px] flex flex-col shrink-0 bg-white border border-zinc-100 rounded-[2.5rem] shadow-2xl shadow-zinc-100 overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter italic">Hóa đơn bàn</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{table?.name || "Chọn bàn"}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-5 h-5 text-zinc-900" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-zinc-200" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">Chưa có món nào</p>
            </div>
          ) : (
            orderItems.map(item => (
              <div key={item.productId} className="flex gap-4 group animate-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-50 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900 line-clamp-2">{item.name}</span>
                    <span className="text-xs font-black text-zinc-900 whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)} ₫</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-zinc-50 rounded-xl p-1 gap-3">
                      <button 
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-zinc-900 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <span>Tạm tính</span>
              <span>{new Intl.NumberFormat('vi-VN').format(subtotal)} ₫</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <span>Phí dịch vụ</span>
              <span>0 ₫</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-zinc-100">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900">Tổng cộng</span>
              <span className="text-3xl font-black tracking-tighter text-zinc-900">{new Intl.NumberFormat('vi-VN').format(subtotal)} ₫</span>
            </div>
          </div>

          <Button 
            className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={orderItems.length === 0 || isSubmitting}
            onClick={handleOrder}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi thông tin đặt món"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-zinc-200" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
