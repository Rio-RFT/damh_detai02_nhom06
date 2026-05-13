"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Edit3, RotateCw, Trash2, Plus, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type TableStatus = 'Trống' | 'Đang có khách' | 'Đã đặt';
type Orientation = 'horizontal' | 'vertical';
type ObjectType = 'table' | 'bar';

interface Table {
  id: number;
  name: string;
  type: ObjectType;
  status: TableStatus;
  capacity: number; 
  area: string;
  posX: number; // Percentage 0-100
  posY: number; // Percentage 0-100
  orientation: Orientation;
}

const initialTables: Table[] = [
  { id: 999, name: 'Quầy Pha Chế', type: 'bar', status: 'Trống', capacity: 0, area: 'Bên trong', posX: 50, posY: 20, orientation: 'horizontal' },
  { id: 1, name: 'Bàn 01', type: 'table', status: 'Trống', capacity: 2, area: 'Bên trong', posX: 20, posY: 30, orientation: 'horizontal' },
  { id: 2, name: 'Bàn 02', type: 'table', status: 'Đang có khách', capacity: 4, area: 'Bên trong', posX: 50, posY: 45, orientation: 'horizontal' },
  { id: 3, name: 'Bàn 03', type: 'table', status: 'Đã đặt', capacity: 4, area: 'Bên trong', posX: 80, posY: 30, orientation: 'vertical' },
  { id: 4, name: 'Bàn 04', type: 'table', status: 'Trống', capacity: 6, area: 'Bên trong', posX: 35, posY: 70, orientation: 'horizontal' },
  { id: 5, name: 'Sân 01', type: 'table', status: 'Trống', capacity: 2, area: 'Sân vườn', posX: 30, posY: 40, orientation: 'horizontal' },
];

const areas = ['Bên trong', 'Sân vườn', 'Lầu 1'];

export default function FloorPlanPage() {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [currentArea, setCurrentArea] = useState(areas[0]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  
  // Drag state
  const [draggingTableId, setDraggingTableId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDraggingTableId(id);
    setSelectedTable(tables.find(t => t.id === id) || null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || draggingTableId === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const draggedTable = tables.find(t => t.id === draggingTableId);
    if (!draggedTable) return;

    // Calculate dimensions of the object to establish boundaries
    const isVert = draggedTable.orientation === 'vertical';
    let w = 0;
    let h = 0;
    if (draggedTable.type === 'bar') {
      w = isVert ? 80 : 250;
      h = isVert ? 250 : 80;
    } else {
      w = isVert ? 60 : (draggedTable.capacity > 2 ? 100 : 60);
      h = isVert ? (draggedTable.capacity > 2 ? 100 : 60) : 60;
    }
    
    // Add extra padding for chairs
    const padding = 20;

    let px = e.clientX - rect.left;
    let py = e.clientY - rect.top;
    
    // Clamp coordinates so the object never leaves the container
    px = Math.max(w / 2 + padding, Math.min(rect.width - w / 2 - padding, px));
    py = Math.max(h / 2 + padding, Math.min(rect.height - h / 2 - padding, py));

    const x = (px / rect.width) * 100;
    const y = (py / rect.height) * 100;

    setTables(prev => prev.map(t => t.id === draggingTableId ? { ...t, posX: x, posY: y } : t));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTableId !== null) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingTableId(null);
    }
  };

  const toggleOrientation = () => {
    if (!selectedTable) return;
    setTables(prev => prev.map(t => 
      t.id === selectedTable.id 
        ? { ...t, orientation: t.orientation === 'horizontal' ? 'vertical' : 'horizontal' } 
        : t
    ));
    setSelectedTable({ ...selectedTable, orientation: selectedTable.orientation === 'horizontal' ? 'vertical' : 'horizontal' });
  };

  const closeModals = () => {
    if (!isEditMode) setSelectedTable(null);
    setIsReserveModalOpen(false);
  };

  const getStatusColor = (status: TableStatus) => {
    switch(status) {
      case 'Trống': return 'bg-zinc-200 border-zinc-300';
      case 'Đang có khách': return 'bg-zinc-800 border-zinc-900 text-white';
      case 'Đã đặt': return 'bg-zinc-400 border-zinc-500 text-white';
      default: return 'bg-zinc-200 border-zinc-300';
    }
  };

  const renderObject = (table: Table) => {
    const isVert = table.orientation === 'vertical';
    const isSelected = selectedTable?.id === table.id;
    const isDragging = draggingTableId === table.id;
    
    // Dynamic Edit Badge position (so it never clips out of the container)
    // If the object is too close to the top edge (Y < 15%), display the badge below it
    const badgePositionClass = table.posY < 15 ? "bottom-[-40px]" : "top-[-40px]";
    
    if (table.type === 'bar') {
      const w = isVert ? 80 : 250;
      const h = isVert ? 250 : 80;
      const clampX = w / 2 + 10;
      const clampY = h / 2 + 10;
      
      return (
        <div 
          key={table.id}
          className="absolute"
          style={{
            left: `clamp(${clampX}px, ${table.posX}%, calc(100% - ${clampX}px))`,
            top: `clamp(${clampY}px, ${table.posY}%, calc(100% - ${clampY}px))`,
            width: w,
            height: h,
            transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.02)' : ''}`,
            zIndex: isSelected ? 20 : 5,
            cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
            transition: isDragging ? 'none' : 'transform 0.2s',
          }}
          onPointerDown={(e) => handlePointerDown(e, table.id)}
          onClick={(e) => { e.stopPropagation(); if (isEditMode) setSelectedTable(table); }}
        >
          <div className={cn(
            "absolute inset-0 bg-zinc-800 text-white flex flex-col justify-center items-center rounded-xl shadow-lg border-b-4 border-zinc-950 transition-all",
            isSelected && isEditMode && "ring-4 ring-primary border-primary"
          )}>
            <Coffee className={cn("text-zinc-300", isVert ? "mb-4 rotate-90" : "mb-1 w-6 h-6")} />
            <span className={cn(
              "font-bold uppercase tracking-[0.2em]",
              isVert ? "text-[10px] [writing-mode:vertical-rl]" : "text-xs"
            )}>
              {table.name}
            </span>
          </div>
          
          {isEditMode && isSelected && (
            <div className={cn("absolute left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap z-30 flex items-center gap-2", badgePositionClass)}>
              <button onClick={(e) => { e.stopPropagation(); toggleOrientation(); }} className="hover:text-zinc-300" title="Xoay">
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      );
    }
    
    const w = isVert ? 60 : (table.capacity > 2 ? 100 : 60);
    const h = isVert ? (table.capacity > 2 ? 100 : 60) : 60;
    const chairs = [];
    const chairSize = 16;
    const offset = -6;

    if (table.capacity === 2) {
      if (isVert) {
        chairs.push({ left: -chairSize - offset, top: '50%', transform: 'translateY(-50%)' });
        chairs.push({ right: -chairSize - offset, top: '50%', transform: 'translateY(-50%)' });
      } else {
        chairs.push({ top: -chairSize - offset, left: '50%', transform: 'translateX(-50%)' });
        chairs.push({ bottom: -chairSize - offset, left: '50%', transform: 'translateX(-50%)' });
      }
    } else if (table.capacity === 4) {
      if (isVert) {
        chairs.push({ left: -chairSize - offset, top: '25%', transform: 'translateY(-50%)' });
        chairs.push({ left: -chairSize - offset, top: '75%', transform: 'translateY(-50%)' });
        chairs.push({ right: -chairSize - offset, top: '25%', transform: 'translateY(-50%)' });
        chairs.push({ right: -chairSize - offset, top: '75%', transform: 'translateY(-50%)' });
      } else {
        chairs.push({ top: -chairSize - offset, left: '25%', transform: 'translateX(-50%)' });
        chairs.push({ top: -chairSize - offset, left: '75%', transform: 'translateX(-50%)' });
        chairs.push({ bottom: -chairSize - offset, left: '25%', transform: 'translateX(-50%)' });
        chairs.push({ bottom: -chairSize - offset, left: '75%', transform: 'translateX(-50%)' });
      }
    } else if (table.capacity === 6) {
      if (isVert) {
        chairs.push({ top: -chairSize - offset, left: '50%', transform: 'translateX(-50%)' });
        chairs.push({ bottom: -chairSize - offset, left: '50%', transform: 'translateX(-50%)' });
        chairs.push({ left: -chairSize - offset, top: '25%', transform: 'translateY(-50%)' });
        chairs.push({ left: -chairSize - offset, top: '75%', transform: 'translateY(-50%)' });
        chairs.push({ right: -chairSize - offset, top: '25%', transform: 'translateY(-50%)' });
        chairs.push({ right: -chairSize - offset, top: '75%', transform: 'translateY(-50%)' });
      } else {
        chairs.push({ left: -chairSize - offset, top: '50%', transform: 'translateY(-50%)' });
        chairs.push({ right: -chairSize - offset, top: '50%', transform: 'translateY(-50%)' });
        chairs.push({ top: -chairSize - offset, left: '25%', transform: 'translateX(-50%)' });
        chairs.push({ top: -chairSize - offset, left: '75%', transform: 'translateX(-50%)' });
        chairs.push({ bottom: -chairSize - offset, left: '25%', transform: 'translateX(-50%)' });
        chairs.push({ bottom: -chairSize - offset, left: '75%', transform: 'translateX(-50%)' });
      }
    }

    const clampX = w / 2 + 20;
    const clampY = h / 2 + 20;

    return (
      <div 
        key={table.id}
        className="absolute"
        style={{
          left: `clamp(${clampX}px, ${table.posX}%, calc(100% - ${clampX}px))`,
          top: `clamp(${clampY}px, ${table.posY}%, calc(100% - ${clampY}px))`,
          width: w,
          height: h,
          transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.05)' : ''}`,
          zIndex: isSelected ? 20 : 10,
          cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
          transition: isDragging ? 'none' : 'transform 0.2s',
        }}
        onPointerDown={(e) => handlePointerDown(e, table.id)}
        onClick={(e) => { e.stopPropagation(); if (!isEditMode) setSelectedTable(table); else setSelectedTable(table); }}
      >
        <div className={cn(
          "absolute inset-0 rounded-lg border-2 flex items-center justify-center transition-colors shadow-sm",
          getStatusColor(table.status),
          isSelected && isEditMode && "ring-4 ring-primary border-primary",
          isSelected && !isEditMode && "ring-2 ring-zinc-900 border-zinc-900"
        )}>
          <span className="text-xs font-bold whitespace-nowrap">{table.name.replace('Bàn ', '')}</span>
        </div>

        {chairs.map((style, i) => (
          <div 
            key={i} 
            className="absolute rounded-full border border-zinc-300 bg-zinc-100 shadow-sm"
            style={{ width: chairSize, height: chairSize, ...style }}
          />
        ))}

        {isEditMode && isSelected && (
          <div className={cn("absolute left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap z-30 flex items-center gap-2", badgePositionClass)}>
            <button onClick={(e) => { e.stopPropagation(); toggleOrientation(); }} className="hover:text-zinc-300" title="Xoay">
              <RotateCw className="w-3 h-3" />
            </button>
            <div className="w-px h-3 bg-zinc-700" />
            <button onClick={(e) => { e.stopPropagation(); /* delete logic */ }} className="hover:text-red-400" title="Xóa">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col max-h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-end border-b border-border pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sơ đồ mặt bằng</h2>
          <p className="text-sm text-muted-foreground mt-1">Sắp xếp bàn và quản lý thực tế (Kéo thả để di chuyển)</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isEditMode ? "default" : "outline"}
            size="sm" 
            className={cn("text-xs uppercase tracking-wider", isEditMode && "bg-zinc-900")}
            onClick={() => {
              setIsEditMode(!isEditMode);
              setSelectedTable(null);
            }}
          >
            {isEditMode ? <><Save className="w-3 h-3 mr-2"/> Lưu cấu hình</> : <><Edit3 className="w-3 h-3 mr-2"/> Cấu hình sơ đồ</>}
          </Button>
          {isEditMode && (
            <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider">
              <Plus className="w-3 h-3 mr-2"/> Thêm đối tượng
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 shrink-0">
        {areas.map(area => (
          <button
            key={area}
            onClick={() => setCurrentArea(area)}
            className={cn(
              "text-xs font-semibold uppercase tracking-widest pb-2 border-b-2 transition-all",
              currentArea === area ? "border-zinc-900 text-zinc-900" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {area}
          </button>
        ))}
      </div>

      <div 
        ref={containerRef}
        className={cn(
          "flex-1 relative bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden min-h-[500px]",
          isEditMode ? "cursor-crosshair" : "cursor-default"
        )}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => { if (isEditMode) setSelectedTable(null); }}
      >
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {tables.filter(t => t.area === currentArea).map(renderObject)}
      </div>

      <div className="flex justify-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 shrink-0">
        <div className="flex items-center"><div className="w-2 h-2 rounded-sm bg-zinc-200 border border-zinc-300 mr-2"></div> Available</div>
        <div className="flex items-center"><div className="w-2 h-2 rounded-sm bg-zinc-800 mr-2"></div> Occupied</div>
        <div className="flex items-center"><div className="w-2 h-2 rounded-sm bg-zinc-400 mr-2"></div> Reserved</div>
      </div>

      {selectedTable && !isEditMode && !isReserveModalOpen && selectedTable.type === 'table' && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 shadow-2xl relative rounded-xl">
            <button onClick={closeModals} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground bg-zinc-100 p-1.5 rounded-full">
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Quản lý bàn</h3>
                <h2 className="text-3xl font-semibold tracking-tight">{selectedTable.name}</h2>
                <div className="flex items-center mt-3 gap-2">
                  <span className={cn("px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm", getStatusColor(selectedTable.status))}>
                    {selectedTable.status}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-zinc-100 rounded-sm">
                    {selectedTable.capacity} Ghế
                  </span>
                </div>
              </div>
              
              <div className="grid gap-3">
                {selectedTable.status === 'Trống' && (
                  <>
                    <Button className="h-14 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800" onClick={() => {
                       setTables(tables.map(t => t.id === selectedTable.id ? { ...t, status: 'Đang có khách' } : t));
                       router.push(`/dashboard/order/${selectedTable.id}`);
                       closeModals();
                    }}>Mở bàn mới</Button>
                    <Button variant="outline" className="h-14 text-sm font-bold uppercase tracking-widest border-zinc-200 hover:bg-zinc-50" onClick={() => setIsReserveModalOpen(true)}>Đặt chỗ trước</Button>
                  </>
                )}
                
                {selectedTable.status === 'Đang có khách' && (
                  <Button className="h-14 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800" onClick={() => router.push(`/dashboard/order/${selectedTable.id}`)}>
                    Vào Order / Thanh toán
                  </Button>
                )}

                {selectedTable.status === 'Đã đặt' && (
                  <>
                    <Button className="h-14 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800" onClick={() => {
                       setTables(tables.map(t => t.id === selectedTable.id ? { ...t, status: 'Đang có khách' } : t));
                       closeModals();
                    }}>Khách đã đến (Mở bàn)</Button>
                    <Button variant="ghost" className="h-14 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50" onClick={() => {
                      setTables(tables.map(t => t.id === selectedTable.id ? { ...t, status: 'Trống' } : t));
                      closeModals();
                    }}>Hủy đặt chỗ</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isReserveModalOpen && selectedTable && selectedTable.type === 'table' && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white border border-zinc-200 p-8 shadow-xl relative rounded-xl">
            <button onClick={() => setIsReserveModalOpen(false)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground bg-zinc-100 p-1.5 rounded-full">
              <X className="w-4 h-4" />
            </button>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setTables(tables.map(t => t.id === selectedTable.id ? { ...t, status: 'Đã đặt' } : t));
              closeModals();
            }} className="space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Reservation</h3>
                <h2 className="text-2xl font-semibold tracking-tight">{selectedTable.name}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Khách hàng</Label>
                  <Input required className="h-10 border-t-0 border-x-0 border-b border-zinc-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-zinc-900" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Điện thoại</Label>
                  <Input type="tel" required className="h-10 border-t-0 border-x-0 border-b border-zinc-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-zinc-900" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Thời gian</Label>
                  <Input type="datetime-local" required className="h-10 border-t-0 border-x-0 border-b border-zinc-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-zinc-900" />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-xs font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800">Xác nhận đặt bàn</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
