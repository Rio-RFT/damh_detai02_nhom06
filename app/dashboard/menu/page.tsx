"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  INITIAL_MENU_PRODUCTS,
  loadMenuProducts,
  persistMenuProducts,
  PLACEHOLDER_IMAGE,
  type MenuProduct,
} from "@/lib/menu-data";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  status: "Sẵn sàng" as MenuProduct["status"],
  imageUrl: "",
  description: "",
};

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] =
    useState<MenuProduct[]>(INITIAL_MENU_PRODUCTS);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setMenuItems(loadMenuProducts());
  }, []);

  const categorySuggestions = useMemo(() => {
    const set = new Set(menuItems.map((i) => i.category.trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [menuItems]);

  const filtered = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm(emptyForm);
    setFormError(null);
  };

  const handleAddOpenChange = (open: boolean) => {
    setAddOpen(open);
    if (!open) resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    const category = form.category.trim();
    const description = form.description.trim();
    const imageUrl = form.imageUrl.trim();

    if (!name) {
      setFormError("Vui lòng nhập tên món.");
      return;
    }
    if (!category) {
      setFormError("Vui lòng nhập danh mục.");
      return;
    }

    const priceNum = Number(form.price.replace(/\s/g, "").replace(/,/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFormError("Giá phải là số dương (ví dụ: 35000).");
      return;
    }

    const nextId =
      menuItems.length === 0
        ? 1
        : Math.max(...menuItems.map((i) => i.id)) + 1;

    const newItem: MenuProduct = {
      id: nextId,
      name,
      category,
      price: Math.round(priceNum),
      status: form.status,
      imageUrl: imageUrl || PLACEHOLDER_IMAGE,
      description: description || "—",
    };

    const next = [...menuItems, newItem];
    setMenuItems(next);
    persistMenuProducts(next);
    setAddOpen(false);
    resetForm();
  };

  const handleDelete = (item: MenuProduct) => {
    if (
      !window.confirm(
        `Xóa món "${item.name}"? Thao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }
    const next = menuItems.filter((i) => i.id !== item.id);
    setMenuItems(next);
    persistMenuProducts(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Thực đơn</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý chi tiết danh sách món và hình ảnh
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Tìm món..."
            className="w-64 h-9 border-t-0 border-x-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-b-primary bg-transparent px-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="text-xs tracking-wider uppercase h-9"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-3 h-3 mr-2" /> Thêm món
          </Button>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={handleAddOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm món mới</DialogTitle>
            <DialogDescription>
              Điền đủ thông tin như các món hiện có: tên, danh mục, giá, trạng
              thái, link ảnh và mô tả.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Tên món</Label>
              <Input
                id="menu-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ví dụ: Latte nóng"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-category">Danh mục</Label>
              <Input
                id="menu-category"
                list="menu-category-list"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="Ví dụ: Cà phê hiện đại"
                required
              />
              <datalist id="menu-category-list">
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-price">Giá bán (₫)</Label>
              <Input
                id="menu-price"
                inputMode="numeric"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="35000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-status">Trạng thái</Label>
              <select
                id="menu-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as MenuProduct["status"],
                  }))
                }
              >
                <option value="Sẵn sàng">Sẵn sàng</option>
                <option value="Hết hàng">Hết hàng</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-image">Link ảnh</Label>
              <Input
                id="menu-image"
                type="text"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Để trống sẽ dùng ảnh mặc định.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-desc">Mô tả</Label>
              <Textarea
                id="menu-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Mô tả ngắn về món..."
                rows={3}
              />
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu món</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white border border-border">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-zinc-50">
            <tr>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Hình ảnh
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Thông tin món
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Danh mục
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Giá bán
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-zinc-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-zinc-100 border border-border">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-base text-foreground mb-1">
                    {item.name}
                  </div>
                  <div className="text-xs text-muted-foreground max-w-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {item.category}
                </td>
                <td className="px-6 py-4 font-medium">
                  {item.price.toLocaleString()} ₫
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-sm text-[11px] font-semibold tracking-wider uppercase ${
                      item.status === "Sẵn sàng"
                        ? "bg-zinc-100 text-zinc-900"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Xóa món
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
