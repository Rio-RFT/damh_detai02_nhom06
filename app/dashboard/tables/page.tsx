"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingCart, LogOut as LogOutIcon, Trash2, User, Phone, Clock, MoreHorizontal, X } from "lucide-react";
import {
  displayTableStatus,
  type FloorObject,
} from "@/lib/floor-plan-data";
import { getTables } from "@/lib/floor-plan-actions";
import { confirmCustomerArrival, checkoutTable, cancelBooking } from "@/lib/table-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function TablesManagementPage() {
  const [tablesList, setTablesList] = useState<FloorObject[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTables = async () => {
    setLoading(true);
    const dbTables = await getTables();
    setTablesList(dbTables);
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const tables = useMemo(
    () =>
      getFloorTables(tablesList).sort((a, b) => {
        const na = parseInt(a.name.replace(/\D/g, ""), 10);
        const nb = parseInt(b.name.replace(/\D/g, ""), 10);
        if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
        return a.name.localeCompare(b.name, "vi");
      }),
    [tablesList]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Quản lý Bàn</h2>
          <p className="text-xs font-medium text-zinc-400 mt-2 uppercase tracking-widest">
            Danh sách chi tiết và trạng thái phục vụ thời gian thực
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="border-b border-zinc-50 bg-zinc-50/50">
              <tr>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Số bàn</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Khu vực</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-center">Ghế</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Trạng thái</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Khách hàng</th>
                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400">Thời gian</th>
                <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-zinc-400 font-medium italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : tables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-zinc-400 text-sm">
                    Chưa có bàn nào. Mở{" "}
                    <Link href="/dashboard" className="underline text-zinc-900 font-bold uppercase tracking-widest text-[10px]">
                      Sơ đồ mặt bằng
                    </Link>{" "}
                    để thêm bàn.
                  </td>
                </tr>
              ) : (
                tables.map((table) => {
                  return (
                    <tr key={table.id} className="group hover:bg-zinc-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <span className="text-sm font-black uppercase tracking-tighter text-zinc-900">{table.name}</span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{table.area}</span>
                      </td>
                      <td className="px-6 py-6 text-center font-bold text-zinc-500">{table.capacity}</td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          table.status === 'Trống' ? "bg-zinc-100 text-zinc-400" :
                          table.status === 'Đã đặt' ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {displayTableStatus(table.status)}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        {table.customerName ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-900">{table.customerName}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{table.customerPhone || "Không có SĐT"}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-300 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                         {table.bookingTime ? (
                           <div className="flex items-center gap-1.5 text-zinc-500">
                             <Clock className="w-3 h-3" />
                             <span className="text-xs font-bold">{table.bookingTime}</span>
                           </div>
                         ) : <span className="text-zinc-300 italic text-xs">—</span>}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {table.status === 'Đã đặt' && (
                            <>
                              <Button 
                                size="sm"
                                className="h-9 px-4 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] flex gap-2"
                                onClick={async () => {
                                  const res = await confirmCustomerArrival(table.id);
                                  if (res.success) fetchTables();
                                }}
                              >
                                <CheckCircle2 className="w-3 h-3" /> Đến
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold uppercase tracking-widest text-[9px] flex gap-2"
                                onClick={async () => {
                                  if (confirm(`Hủy đặt bàn ${table.name}?`)) {
                                    const res = await cancelBooking(table.id);
                                    if (res.success) fetchTables();
                                  }
                                }}
                              >
                                <X className="w-3 h-3" /> Hủy
                              </Button>
                            </>
                          )}
                          
                          {table.status === 'Đang dùng' && (
                            <>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 border-zinc-200 text-zinc-900 hover:bg-zinc-50 rounded-xl font-bold uppercase tracking-widest text-[9px] flex gap-2"
                                onClick={() => router.push(`/dashboard/orders?tableId=${table.id}`)}
                              >
                                <ShoppingCart className="w-3.5 h-3.5" /> Order
                              </Button>
                              <Button 
                                size="sm"
                                variant="destructive"
                                className="h-9 px-4 bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-xl font-bold uppercase tracking-widest text-[9px] flex gap-2"
                                onClick={async () => {
                                  if (confirm(`Xác nhận checkout bàn ${table.name}?`)) {
                                    const res = await checkoutTable(table.id);
                                    if (res.success) fetchTables();
                                  }
                                }}
                              >
                                <LogOutIcon className="w-3 h-3" /> Trả
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getFloorTables(objects: FloorObject[]): FloorObject[] {
  return objects.filter((o) => o.type === "table");
}

