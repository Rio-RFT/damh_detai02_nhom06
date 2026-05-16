"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, ChevronLeft, Calendar, User, Phone, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FloorObject, 
  FloorConfig, 
  DEFAULT_FLOOR_CONFIG,
  loadFloorAreas,
  DEFAULT_TABLE_AREAS
} from '@/lib/floor-plan-data';
import { getTables } from '@/lib/floor-plan-actions';
import { createBooking, holdTable, releaseTable } from '@/lib/booking-actions';

export default function BookingPage() {
  const [tables, setTables] = useState<FloorObject[]>([]);
  const [areas, setAreas] = useState<string[]>(DEFAULT_TABLE_AREAS);
  const [currentArea, setCurrentArea] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<FloorObject | null>(null);
  const [config] = useState<FloorConfig>(DEFAULT_FLOOR_CONFIG);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [isBooked, setIsBooked] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    // Default booking time is now
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setBookingTime(`${hours}:${minutes}`);

    async function init() {
      const dbTables = await getTables();
      setTables(dbTables);
      
      const savedName = localStorage.getItem('customer-name');
      if (savedName) setCustomerName(savedName);
      
      const savedAreas = loadFloorAreas();
      setAreas(savedAreas);
      setCurrentArea(savedAreas[0]);
    }
    init();
  }, [config.containerWidth]);

  const handleBookTable = async () => {
    if (!selectedTable) return;
    
    const result = await createBooking(selectedTable.id, customerName, customerPhone, bookingTime);
    
    if (result.success) {
      setIsBooked(true);
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Đã đặt' } : t));
    } else {
      alert("Đặt bàn thất bại, vui lòng thử lại!");
    }
  };

  const renderObject = (table: FloorObject) => {
    const isVert = table.orientation === 'vertical';
    const isSelected = selectedTable?.id === table.id;
    const isOccupied = table.status !== 'Trống' || table.type === 'bar';
    
    const w = table.width || (table.type === 'bar' ? (isVert ? 80 : 250) : (isVert ? 60 : (table.capacity > 2 ? 100 : 60)));
    const h = table.height || (table.type === 'bar' ? (isVert ? 250 : 80) : (isVert ? (table.capacity > 2 ? 100 : 60) : 60));
    const clampX = w / 2 + 10;
    const clampY = h / 2 + 10;

    return (
      <div 
        key={table.id}
        className={cn(
          "absolute transition-all duration-300",
          isOccupied ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-105"
        )}
        style={{
          left: `clamp(${clampX}px, ${table.posX}%, calc(100% - ${clampX}px))`,
          top: `clamp(${clampY}px, ${table.posY}%, calc(100% - ${clampY}px))`,
          width: w,
          height: h,
          transform: `translate(-50%, -50%)`,
          zIndex: isSelected ? 20 : 10,
        }}
        onClick={() => { 
          if (!isOccupied && table.type === 'table') {
            if (selectedTable && selectedTable.id !== table.id) {
              releaseTable(selectedTable.id);
            }
            setSelectedTable(table);
            holdTable(table.id, table.name, customerName || "Khách");
          }
        }}
      >
        <div className={cn(
          "absolute inset-0 border-2 transition-all shadow-sm rounded-xl overflow-hidden flex flex-col items-center justify-center p-2 text-center",
          isOccupied ? "bg-zinc-100 border-zinc-200" : (isSelected ? "bg-primary/5 border-primary ring-2 ring-primary/20" : "bg-white border-zinc-200")
        )}>
           <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">{table.name}</span>
           <span className="text-[9px] font-medium text-zinc-500">{table.type === 'bar' ? 'Quầy' : `${table.capacity} ghế`}</span>
           {isOccupied && table.type === 'table' && <span className="text-[8px] mt-1 text-zinc-400 uppercase font-bold">Hết chỗ</span>}
           {table.type === 'bar' && <span className="text-[8px] mt-1 text-zinc-400 uppercase font-bold text-primary">Khu vực pha chế</span>}
        </div>
      </div>
    );
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Đặt bàn thành công!</h1>
        <p className="text-zinc-500 max-w-md mx-auto mb-8">
          Cảm ơn <strong>{customerName}</strong> đã lựa chọn MinimalCafe. Chúng tôi đã giữ chỗ cho bạn tại <strong>{selectedTable?.name}</strong>.
        </p>
        <Button onClick={() => router.push('/')} variant="outline" className="h-12 px-8 rounded-none uppercase tracking-widest font-bold">Quay về trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold tracking-tight">Đặt bàn</span>
          </div>
        </div>
        {customerName && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-zinc-900">{customerName}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Khách hàng</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs">
              {customerName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-6 md:p-12 max-w-[1600px] mx-auto w-full">
        {/* Left: Floor Plan */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar -mx-2 px-2">
              {areas.map(area => (
                <button
                  key={area}
                  onClick={() => setCurrentArea(area)}
                  className={cn(
                    "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap rounded-full border-2 shrink-0",
                    currentArea === area ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" : "bg-white text-zinc-400 hover:text-zinc-600 border-zinc-100 hover:border-zinc-200"
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
            <div className="flex gap-4 text-[9px] uppercase tracking-widest font-black text-zinc-400 ml-1 sm:ml-0">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-zinc-100" /> Trống</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-zinc-200" /> Đã đặt</div>
            </div>
          </div>

          <div className="flex-1 bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-inner flex flex-col min-h-[500px]">
            {/* Scroll Hint for Mobile */}
            <div className="lg:hidden flex items-center justify-center gap-2 py-3 bg-zinc-50/50 text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
              <RefreshCw className="w-3 h-3 animate-spin-slow" /> Vuốt để xem toàn bộ sơ đồ
            </div>
            
            <div className="flex-1 overflow-auto p-4 md:p-12 cursor-grab active:cursor-grabbing">
              <div 
                ref={containerRef}
                className="relative select-none mx-auto"
                style={{
                  width: `${config.containerWidth}px`,
                  height: `${config.containerHeight}px`,
                }}
              >
                 {tables.filter(t => t.area === currentArea).map(renderObject)}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-2xl p-8 md:p-10 sticky top-32">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-8">Chi tiết đặt bàn</h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Thông tin liên hệ</p>
                <div className="space-y-3">
                  <div className="group relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Họ và tên khách hàng"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-14 pl-12 pr-6 bg-zinc-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-zinc-900 transition-all outline-none"
                    />
                  </div>
                  <div className="group relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                      type="tel" 
                      placeholder="Số điện thoại"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full h-14 pl-12 pr-6 bg-zinc-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-zinc-900 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Vị trí đã chọn</p>
                <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-3xl border-2 border-transparent">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-zinc-200">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={cn("text-base font-black uppercase tracking-tight", !selectedTable && "text-zinc-300 italic")}>
                      {selectedTable ? selectedTable.name : "Chưa chọn bàn"}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                      {selectedTable ? `${selectedTable.capacity} ghế • ${selectedTable.area}` : "Vui lòng chọn trên sơ đồ"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-5 pt-6 border-t border-zinc-50">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Giờ đến dự kiến</p>
                  <input 
                    type="time" 
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full h-12 bg-zinc-50 border-none rounded-2xl text-lg font-black focus:ring-0 px-4"
                  />
                  <p className="text-[9px] text-amber-600 font-bold mt-2 uppercase tracking-tight bg-amber-50 inline-block px-2 py-1 rounded-md">
                    * Giữ chỗ tối đa 15 phút
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button 
                disabled={!selectedTable || !customerName || !customerPhone}
                onClick={handleBookTable}
                className="w-full h-20 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-300 transition-all shadow-2xl shadow-zinc-200 hover:scale-[1.02] active:scale-95"
              >
                Xác nhận đặt bàn
              </Button>
              <p className="text-[9px] text-center text-zinc-400 mt-6 leading-relaxed font-medium uppercase tracking-widest">
                Đảm bảo thông tin chính xác trước khi xác nhận
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
