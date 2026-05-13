"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';

export default function AccountsManagementPage() {
  const [accounts] = useState([
    { id: 1, name: 'Nguyễn Văn A', username: 'admin', role: 'Quản lý' },
    { id: 2, name: 'Trần Thị B', username: 'staff1', role: 'Nhân viên' },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tài khoản</h2>
          <p className="text-sm text-muted-foreground mt-1">Phân quyền và quản lý nhân viên</p>
        </div>
        <Button variant="outline" className="text-xs tracking-wider uppercase h-9">
          <Plus className="w-3 h-3 mr-2" /> Tạo mới
        </Button>
      </div>

      <div className="bg-white border border-border">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Tên nhân viên</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Tài khoản</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Vai trò</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accounts.map(acc => (
              <tr key={acc.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 font-medium">{acc.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{acc.username}</td>
                <td className="px-6 py-4">
                  {acc.role}
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
