"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';

export default function TablesManagementPage() {
  const [tables, setTables] = useState([
    { id: 1, name: 'Bàn 01', capacity: 2, status: 'Trống' },
    { id: 2, name: 'Bàn 02', capacity: 4, status: 'Đang phục vụ' },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lý Bàn</h2>
          <p className="text-sm text-muted-foreground mt-1">Thiết lập cấu hình bàn trong quán</p>
        </div>
        <Button variant="outline" className="text-xs tracking-wider uppercase h-9">
          <Plus className="w-3 h-3 mr-2" /> Thêm Bàn
        </Button>
      </div>

      <div className="bg-white border border-border">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Số bàn</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Số ghế</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Trạng thái</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tables.map(table => (
              <tr key={table.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 font-medium">{table.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{table.capacity}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center text-xs font-medium ${
                    table.status === 'Trống' ? 'text-muted-foreground' : 'text-primary'
                  }`}>
                    {table.status}
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
