"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, Minus, Plus, X } from 'lucide-react';

const MOCK_MENU = [
  { id: 1, name: 'Cà phê Đen Đá', price: 25000, category: 'Cà phê', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a2ce7beea8dd?q=80&w=400&auto=format&fit=crop' },
  { id: 2, name: 'Bạc Xỉu Sữa Tươi', price: 30000, category: 'Cà phê', imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=400&auto=format&fit=crop' },
  { id: 3, name: 'Trà Đào Cam Sả', price: 45000, category: 'Trà', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop' },
  { id: 4, name: 'Trà Matcha Latte', price: 55000, category: 'Trà', imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=400&auto=format&fit=crop' },
  { id: 5, name: 'Bánh Sừng Bò', price: 35000, category: 'Đồ ăn', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&auto=format&fit=crop' },
];

interface OrderItem {
  id: number;
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.tableId as string;
  
  const [search, setSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  const filteredMenu = MOCK_MENU.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToOrder = (menuItem: typeof MOCK_MENU[0]) => {
    if (isPaid) return;
    const existing = orderItems.find(item => item.menuId === menuItem.id);
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1);
    } else {
      setOrderItems([...orderItems, {
        id: Date.now(),
        menuId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        imageUrl: menuItem.imageUrl
      }]);
    }
  };

  const updateQuantity = (id: number, newQty: number) => {
    if (isPaid || newQty < 1) return;
    setOrderItems(orderItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const removeItem = (id: number) => {
    if (isPaid) return;
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setIsPaid(true);
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  const subTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subTotal * 0.1;
  const total = subTotal + vat;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-8">
      {/* Menu Area with Images */}
      <div className="flex-1 flex flex-col h-full bg-zinc-50/50 p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full bg-white border border-border">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm món ăn, đồ uống..." 
              className="pl-11 bg-white border border-border rounded-full h-11 focus-visible:ring-1 text-sm shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 pr-2 custom-scrollbar">
          {filteredMenu.map(item => (
            <div 
              key={item.id}
              onClick={() => addToOrder(item)}
              className={`group flex flex-col bg-white border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:border-zinc-300 transition-all ${isPaid ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="aspect-square bg-zinc-100 overflow-hidden relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <span className="font-medium text-sm leading-tight mb-2">{item.name}</span>
                <span className="text-sm font-semibold text-zinc-900">{item.price.toLocaleString()} ₫</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Area */}
      <div className="w-[400px] bg-white border border-border flex flex-col h-full rounded-2xl shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
          <h3 className="text-lg font-medium tracking-tight">Hóa đơn bàn {tableId}</h3>
          {isPaid && <span className="text-[10px] px-2 py-1 bg-zinc-900 text-white uppercase tracking-wider font-semibold rounded-sm">Đã thanh toán</span>}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {orderItems.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center mt-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-300" />
              </div>
              Chưa có món nào được gọi
            </div>
          ) : (
            orderItems.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-border">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 justify-between py-0.5">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm leading-tight line-clamp-2 pr-2">{item.name}</span>
                    <span className="text-sm font-semibold whitespace-nowrap">{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-zinc-50 border border-border rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={isPaid} className="hover:text-foreground text-muted-foreground p-1">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold text-foreground w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={isPaid} className="hover:text-foreground text-muted-foreground p-1">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} disabled={isPaid} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-zinc-50/50 border-t border-border rounded-b-2xl space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{subTotal.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (10%)</span>
              <span>{vat.toLocaleString()} ₫</span>
            </div>
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-border">
            <span className="text-sm font-medium uppercase tracking-wider">Tổng cộng</span>
            <span className="text-2xl font-semibold tracking-tight text-zinc-900">{total.toLocaleString()} ₫</span>
          </div>
          
          <div className="pt-4">
            {!isPaid ? (
              <Button 
                className="w-full h-14 uppercase tracking-widest text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800" 
                onClick={handleCheckout}
                disabled={orderItems.length === 0}
              >
                Thanh toán hóa đơn
              </Button>
            ) : (
              <Button 
                className="w-full h-14 uppercase tracking-widest text-xs font-semibold rounded-xl" 
                variant="outline"
                onClick={handleFinish}
              >
                Dọn bàn & Hoàn tất
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
