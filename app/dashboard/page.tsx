"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Save, Edit3, RotateCw, Trash2, Plus, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  INITIAL_FLOOR_OBJECTS,
  loadFloorObjects,
  persistFloorObjects,
  TABLE_AREAS,
  type FloorObject,
  type FloorObjectType,
  type FloorOrientation,
  type FloorTableStatus,
} from '@/lib/floor-plan-data';

const areas = [...TABLE_AREAS];

export default function FloorPlanPage() {
  const [tables, setTables] = useState<FloorObject[]>(INITIAL_FLOOR_OBJECTS);
  const [currentArea, setCurrentArea] = useState<string>(areas[0]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<FloorObject | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    customerName: "",
    phone: "",
    datetime: "",
  });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    type: FloorObjectType;
    name: string;
    capacity: 2 | 4 | 6;
    area: string;
  }>({ type: 'table', name: '', capacity: 4, area: areas[0] });
  const [addFormError, setAddFormError] = useState<string | null>(null);
  
  const [draggingTableId, setDraggingTableId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tablesRef = useRef<FloorObject[]>(INITIAL_FLOOR_OBJECTS);
  const router = useRouter();

  useEffect(() => {
    setTables(loadFloorObjects());
  }, []);

  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDraggingTableId(id);
    setSelectedTable(tablesRef.current.find(t => t.id === id) || null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || draggingTableId === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const draggedTable = tablesRef.current.find(t => t.id === draggingTableId);
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
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* capture có thể đã được nhả */
      }
      setDraggingTableId(null);
      queueMicrotask(() => persistFloorObjects(tablesRef.current));
    }
  };

  const toggleOrientation = () => {
    if (!selectedTable) return;
    setTables(prev => {
      const next: FloorObject[] = prev.map(t =>
        t.id === selectedTable.id
          ? {
              ...t,
              orientation: (t.orientation === 'horizontal' ? 'vertical' : 'horizontal') as FloorOrientation,
            }
          : t
      );
      persistFloorObjects(next);
      return next;
    });
    setSelectedTable({
      ...selectedTable,
      orientation: (selectedTable.orientation === 'horizontal' ? 'vertical' : 'horizontal') as FloorOrientation,
    });
  };

  const handleDeleteObject = (obj: FloorObject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Xóa "${obj.name}" khỏi sơ đồ? Thao tác không thể hoàn tác.`)) return;
    setTables(prev => {
      const next = prev.filter(t => t.id !== obj.id);
      persistFloorObjects(next);
      return next;
    });
    setSelectedTable(s => (s?.id === obj.id ? null : s));
  };

  const openAddDialog = () => {
    setAddFormError(null);
    setAddForm({
      type: 'table',
      name: '',
      capacity: 4,
      area: currentArea,
    });
    setAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);
    const name = addForm.name.trim();
    if (!name) {
      setAddFormError('Vui lòng nhập tên hiển thị (ví dụ: Bàn 06, Quầy phụ).');
      return;
    }
    const nextId = tables.length === 0 ? 1 : Math.max(...tables.map(t => t.id)) + 1;
    const newObj: FloorObject = {
      id: nextId,
      name,
      type: addForm.type,
      status: 'Trống',
      capacity: addForm.type === 'bar' ? 0 : addForm.capacity,
      area: addForm.area,
      posX: 50,
      posY: 50,
      orientation: 'horizontal',
    };
    setTables(prev => {
      const next = [...prev, newObj];
      persistFloorObjects(next);
      return next;
    });
    setAddOpen(false);
    setIsEditMode(true);
    setSelectedTable(newObj);
    setCurrentArea(addForm.area);
  };

  const closeModals = () => {
    if (!isEditMode) setSelectedTable(null);
    setIsReserveModalOpen(false);
  };

  const getStatusColor = (status: FloorTableStatus) => {
    switch(status) {
      case 'Trống': return 'bg-zinc-200 border-zinc-300';
      case 'Đang có khách': return 'bg-zinc-800 border-zinc-900 text-white';
      case 'Đã đặt': return 'bg-zinc-400 border-zinc-500 text-white';
      default: return 'bg-zinc-200 border-zinc-300';
    }
  };

  const renderObject = (table: FloorObject) => {
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
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleOrientation(); }} className="hover:text-zinc-300" title="Xoay">
                <RotateCw className="w-3 h-3" />
              </button>
              <div className="w-px h-3 bg-zinc-700" />
              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteObject(table, e); }} className="hover:text-red-400" title="Xóa quầy">
                <Trash2 className="w-3 h-3" />
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
            <button type="button" onClick={(e) => { e.stopPropagation(); toggleOrientation(); }} className="hover:text-zinc-300" title="Xoay">
              <RotateCw className="w-3 h-3" />
            </button>
            <div className="w-px h-3 bg-zinc-700" />
            <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteObject(table, e); }} className="hover:text-red-400" title="Xóa bàn">
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
              if (isEditMode) {
                persistFloorObjects(tablesRef.current);
                setIsEditMode(false);
                setSelectedTable(null);
              } else {
                setIsEditMode(true);
              }
            }}
          >
            {isEditMode ? <><Save className="w-3 h-3 mr-2"/> Lưu cấu hình</> : <><Edit3 className="w-3 h-3 mr-2"/> Cấu hình sơ đồ</>}
          </Button>
          {isEditMode && (
            <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider" type="button" onClick={openAddDialog}>
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

      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddFormError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm đối tượng</DialogTitle>
            <DialogDescription>
              Thêm bàn hoặc quầy vào khu vực đang xem. Sau khi tạo, kéo thả trong chế độ cấu hình để đặt vị trí.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-type">Loại</Label>
              <select
                id="fp-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={addForm.type}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    type: e.target.value as FloorObjectType,
                  }))
                }
              >
                <option value="table">Bàn</option>
                <option value="bar">Quầy / Bar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-name">Tên hiển thị</Label>
              <Input
                id="fp-name"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={addForm.type === 'bar' ? 'Quầy pha chế 2' : 'Bàn 06'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-area">Khu vực</Label>
              <select
                id="fp-area"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={addForm.area}
                onChange={(e) => setAddForm((f) => ({ ...f, area: e.target.value }))}
              >
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            {addForm.type === 'table' && (
              <div className="space-y-2">
                <Label htmlFor="fp-cap">Số ghế</Label>
                <select
                  id="fp-cap"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={addForm.capacity}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      capacity: Number(e.target.value) as 2 | 4 | 6,
                    }))
                  }
                >
                  <option value={2}>2 ghế</option>
                  <option value={4}>4 ghế</option>
                  <option value={6}>6 ghế</option>
                </select>
              </div>
            )}
            {addFormError ? (
              <p className="text-sm text-destructive">{addFormError}</p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Tạo đối tượng</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                       setTables(prev => {
                         const next = prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Đang có khách' as const, reservation: undefined } : t);
                         persistFloorObjects(next);
                         return next;
                       });
                       router.push(`/dashboard/order/${selectedTable.id}`);
                       closeModals();
                    }}>Mở bàn mới</Button>
                    <Button variant="outline" className="h-14 text-sm font-bold uppercase tracking-widest border-zinc-200 hover:bg-zinc-50" onClick={() => {
                      setReserveForm({
                        customerName: selectedTable.reservation?.customerName ?? "",
                        phone: selectedTable.reservation?.phone ?? "",
                        datetime: selectedTable.reservation?.datetime ?? "",
                      });
                      setIsReserveModalOpen(true);
                    }}>Đặt chỗ trước</Button>
                  </>
                )}
                
                {selectedTable.status === 'Đang có khách' && (
                  <Button className="h-14 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800" onClick={() => router.push(`/dashboard/order/${selectedTable.id}`)}>
                    Vào Order / Thanh toán
                  </Button>
                )}

                {selectedTable.status === 'Đã đặt' && (
                  <>
                    {selectedTable.reservation && (
                      <div className="rounded-lg border border-border bg-zinc-50 p-4 text-sm space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Đặt chỗ</p>
                        <p><span className="text-muted-foreground">Khách:</span> {selectedTable.reservation.customerName}</p>
                        <p><span className="text-muted-foreground">SĐT:</span> {selectedTable.reservation.phone}</p>
                        <p><span className="text-muted-foreground">Giờ:</span> {selectedTable.reservation.datetime.replace('T', ' ')}</p>
                      </div>
                    )}
                    <Button className="h-14 text-sm font-bold uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800" onClick={() => {
                       setTables(prev => {
                         const next = prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Đang có khách' as const, reservation: undefined } : t);
                         persistFloorObjects(next);
                         return next;
                       });
                       closeModals();
                    }}>Khách đã đến (Mở bàn)</Button>
                    <Button variant="ghost" className="h-14 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50" onClick={() => {
                      setTables(prev => {
                        const next = prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Trống' as const, reservation: undefined } : t);
                        persistFloorObjects(next);
                        return next;
                      });
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
              const customerName = reserveForm.customerName.trim();
              const phone = reserveForm.phone.trim();
              const datetime = reserveForm.datetime.trim();
              if (!customerName || !phone || !datetime) return;
              setTables(prev => {
                const next = prev.map(t =>
                  t.id === selectedTable.id
                    ? {
                        ...t,
                        status: "Đã đặt" as const,
                        reservation: { customerName, phone, datetime },
                      }
                    : t
                );
                persistFloorObjects(next);
                return next;
              });
              setIsReserveModalOpen(false);
              closeModals();
            }} className="space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Reservation</h3>
                <h2 className="text-2xl font-semibold tracking-tight">{selectedTable.name}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="res-name" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Khách hàng</Label>
                  <Input
                    id="res-name"
                    required
                    value={reserveForm.customerName}
                    onChange={(e) => setReserveForm((f) => ({ ...f, customerName: e.target.value }))}
                    className="h-10 border-t-0 border-x-0 border-b border-zinc-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="res-phone" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Điện thoại</Label>
                  <Input
                    id="res-phone"
                    type="tel"
                    required
                    value={reserveForm.phone}
                    onChange={(e) => setReserveForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-10 border-t-0 border-x-0 border-b border-zinc-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="res-time" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Thời gian</Label>
                  <Input
                    id="res-time"
                    type="datetime-local"
                    required
                    value={reserveForm.datetime}
                    onChange={(e) => setReserveForm((f) => ({ ...f, datetime: e.target.value }))}
                    className="h-10 border-t-0 border-x-0 border-b border-zinc-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-zinc-900"
                  />
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
