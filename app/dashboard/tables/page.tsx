"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  displayTableStatus,
  FLOOR_UPDATED_EVENT,
  getFloorTables,
  loadFloorObjects,
  type FloorObject,
} from "@/lib/floor-plan-data";

function formatReservationTime(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TablesManagementPage() {
  const [floorObjects, setFloorObjects] = useState<FloorObject[]>([]);

  const syncFromStorage = () => {
    setFloorObjects(loadFloorObjects());
  };

  useEffect(() => {
    syncFromStorage();
    window.addEventListener(FLOOR_UPDATED_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(FLOOR_UPDATED_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const tables = useMemo(
    () =>
      getFloorTables(floorObjects).sort((a, b) => {
        const na = parseInt(a.name.replace(/\D/g, ""), 10);
        const nb = parseInt(b.name.replace(/\D/g, ""), 10);
        if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
        return a.name.localeCompare(b.name, "vi");
      }),
    [floorObjects]
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lý Bàn</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách đồng bộ từ sơ đồ mặt bằng. Thêm / xóa / kéo bàn tại mục{" "}
            <span className="text-foreground font-medium">Sơ đồ</span>. Thông tin
            đặt chỗ hiển thị khi đặt bàn từ sơ đồ.
          </p>
        </div>
        <Button variant="outline" className="text-xs tracking-wider uppercase h-9" asChild>
          <Link href="/dashboard">
            <Plus className="w-3 h-3 mr-2" />
            Sơ đồ — thêm bàn
          </Link>
        </Button>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[720px]">
          <thead className="border-b border-border bg-zinc-50">
            <tr>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Số bàn
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Khu vực
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Số ghế
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Khách đặt
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Điện thoại
              </th>
              <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                Giờ đặt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tables.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-muted-foreground text-sm"
                >
                  Chưa có bàn nào. Mở{" "}
                  <Link href="/dashboard" className="underline text-foreground font-medium">
                    Sơ đồ mặt bằng
                  </Link>{" "}
                  để thêm bàn và bấm <strong>Lưu cấu hình</strong>.
                </td>
              </tr>
            ) : (
              tables.map((table) => {
                const r = table.reservation;
                return (
                  <tr key={table.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{table.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{table.area}</td>
                    <td className="px-6 py-4 text-muted-foreground">{table.capacity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium ${
                          table.status === "Trống"
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {displayTableStatus(table.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[160px]">
                      {r?.customerName ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {r?.phone ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {r ? formatReservationTime(r.datetime) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
