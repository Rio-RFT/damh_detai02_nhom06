"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal } from 'lucide-react';

// MOCK DATA: Chờ thay thế bằng dữ liệu từ Prisma (db.product.findMany())
const mockMenu = [
  { 
    id: 1, 
    name: 'Cà phê Đen Đá', 
    category: 'Cà phê truyền thống', 
    price: 25000, 
    status: 'Sẵn sàng',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a2ce7beea8dd?q=80&w=600&auto=format&fit=crop',
    description: 'Cà phê rang xay đậm vị truyền thống, đánh thức năng lượng ngày mới.'
  },
  { 
    id: 2, 
    name: 'Bạc Xỉu Sữa Tươi', 
    category: 'Cà phê truyền thống', 
    price: 30000, 
    status: 'Sẵn sàng',
    imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=600&auto=format&fit=crop',
    description: 'Sự hòa quyện giữa vị đắng nhẹ của cà phê và vị béo ngọt của sữa đặc.'
  },
  { 
    id: 3, 
    name: 'Trà Đào Cam Sả', 
    category: 'Trà trái cây', 
    price: 45000, 
    status: 'Sẵn sàng',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop',
    description: 'Trà đen hảo hạng kết hợp cùng đào tươi và sả thơm mát lạnh.'
  },
  { 
    id: 4, 
    name: 'Trà Matcha Latte', 
    category: 'Đồ uống đá xay', 
    price: 55000, 
    status: 'Hết hàng',
    imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop',
    description: 'Bột trà xanh nguyên chất từ Nhật Bản hòa quyện cùng sữa tươi mịn màng.'
  },
  { 
    id: 5, 
    name: 'Bánh Sừng Bò (Croissant)', 
    category: 'Đồ ăn', 
    price: 35000, 
    status: 'Sẵn sàng',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
    description: 'Bánh nướng bơ Pháp giòn rụm, lớp vỏ nhiều lớp béo ngậy.'
  },
];

export default function MenuManagementPage() {
  const [menuItems] = useState(mockMenu);
  const [search, setSearch] = useState('');

  const filtered = menuItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Thực đơn</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý chi tiết danh sách món và hình ảnh</p>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            placeholder="Tìm món..." 
            className="w-64 h-9 border-t-0 border-x-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-b-primary bg-transparent px-0"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline" className="text-xs tracking-wider uppercase h-9">
            <Plus className="w-3 h-3 mr-2" /> Thêm món
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-zinc-50">
            <tr>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Hình ảnh</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Thông tin món</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Danh mục</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Giá bán</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Trạng thái</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-zinc-100 border border-border">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-base text-foreground mb-1">{item.name}</div>
                  <div className="text-xs text-muted-foreground max-w-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                <td className="px-6 py-4 font-medium">{item.price.toLocaleString()} ₫</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-sm text-[11px] font-semibold tracking-wider uppercase ${item.status === 'Sẵn sàng' ? 'bg-zinc-100 text-zinc-900' : 'bg-red-50 text-red-600'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
