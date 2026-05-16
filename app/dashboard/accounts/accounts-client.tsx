"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccount, updateAccount, deleteAccount } from "@/lib/account-actions";

interface Account {
  id: number;
  username: string;
  name: string;
  role: string;
}

export default function AccountsClient({ initialAccounts }: { initialAccounts: Account[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isOpen, setIsOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setError(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
      } else {
        await createAccount(formData);
      }
      setIsOpen(false);
      // In a real app, you might want to refresh the page or use optimistic updates
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await deleteAccount(id);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Không thể xóa tài khoản");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="text-xs tracking-wider uppercase h-9" onClick={handleOpenAdd}>
          <Plus className="w-3 h-3 mr-2" /> Tạo mới
        </Button>
      </div>

      <div className="bg-white border border-border overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead className="border-b border-border bg-zinc-50">
            <tr>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Tên nhân viên</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Tài khoản</th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Vai trò</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  Chưa có tài khoản nào
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{acc.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{acc.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      acc.role === 'Quản lý' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {acc.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEdit(acc)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(acc.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "Cập nhật thông tin nhân viên." : "Nhập thông tin để tạo tài khoản truy cập hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhân viên</Label>
              <Input id="name" name="name" defaultValue={editingAccount?.name} required placeholder="VD: Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input 
                id="username" 
                name="username" 
                defaultValue={editingAccount?.username} 
                required 
                disabled={!!editingAccount}
                placeholder="VD: nv_an" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{editingAccount ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}</Label>
              <Input id="password" name="password" type="password" required={!editingAccount} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <select
                id="role"
                name="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={editingAccount?.role || "Nhân viên"}
              >
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản lý">Quản lý</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit">{editingAccount ? "Cập nhật" : "Tạo tài khoản"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
