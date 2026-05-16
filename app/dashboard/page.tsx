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
import { X, Save, Edit3, RotateCw, Trash2, Plus, Coffee, Copy, Settings, RefreshCw, Bell, CheckCircle2, Phone, User, ShoppingCart, LogOut as LogOutIcon, ArrowRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DEFAULT_FLOOR_CONFIG,
  loadFloorConfig,
  persistFloorConfig,
  loadFloorAreas,
  persistFloorAreas,
  type FloorConfig,
  type FloorObject,
  type FloorObjectType,
  type FloorOrientation,
  type FloorTableStatus,
} from '@/lib/floor-plan-data';
import { getTables, saveTables, deleteTable } from '@/lib/floor-plan-actions';
import { confirmCustomerArrival, checkoutTable, cancelBooking } from '@/lib/table-actions';
import { getActiveOrder } from '@/lib/order-actions';

export default function FloorPlanPage() {
  const [tables, setTables] = useState<FloorObject[]>([]);
  const [config, setConfig] = useState<FloorConfig>(DEFAULT_FLOOR_CONFIG);
  const [areas, setAreas] = useState<string[]>([]);
  const [currentArea, setCurrentArea] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [editForm, setEditForm] = useState<FloorObject | null>(null);
  const [selectedTable, setSelectedTable] = useState<FloorObject | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Partial<FloorObject>>({});
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [holdingTables, setHoldingTables] = useState<Record<number, string>>({});
  
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isTableManageModalOpen, setIsTableManageModalOpen] = useState(false);
  const [managedTable, setManagedTable] = useState<FloorObject | null>(null);
  const [reserveForm, setReserveForm] = useState({
    customerName: "",
    phone: "",
    datetime: "",
  });
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const [draggingTableId, setDraggingTableId] = useState<number | null>(null);
  const [resizingTableId, setResizingTableId] = useState<number | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, table: FloorObject | null }>({
    visible: false, x: 0, y: 0, table: null
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const tablesRef = useRef<FloorObject[]>([]);
  const configRef = useRef<FloorConfig>(DEFAULT_FLOOR_CONFIG);
  const router = useRouter();

  useEffect(() => {
    let eventSource: EventSource | null = null;

    async function init() {
      const dbTables = await getTables();
      setTables(dbTables);
      tablesRef.current = dbTables;
      
      const savedConfig = loadFloorConfig();
      setConfig(savedConfig);
      configRef.current = savedConfig;
      
      const savedAreas = loadFloorAreas();
      setAreas(savedAreas);
      if (savedAreas.length > 0) setCurrentArea(savedAreas[0]);

      // Load user role
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load user info:", error);
      }

      // Setup SSE for Real-time Notifications
      eventSource = new EventSource('/api/notifications');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.tableId) {
            // Handle different event types if we want, but for now we look at the data structure
            if (data.message) { // NEW_BOOKING
              setTables(prev => prev.map(t => t.id === data.tableId ? { 
                ...t, 
                status: 'Đã đặt',
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                bookingTime: data.bookingTime
              } : t));
              
              // Also update managedTable if it's currently open
              setManagedTable(prev => {
                if (prev && prev.id === data.tableId) {
                  return {
                    ...prev,
                    status: 'Đã đặt',
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    bookingTime: data.bookingTime
                  };
                }
                return prev;
              });

              setNotifications(prev => {
                const isDuplicate = prev.some(n => n.timestamp === data.timestamp && n.tableId === data.tableId);
                if (isDuplicate) return prev;
                return [data, ...prev].slice(0, 3);
              });
              setHoldingTables(prev => {
                const next = { ...prev };
                delete next[data.tableId];
                return next;
              });
            } else if (data.customerName) { // TABLE_HOLD
              setHoldingTables(prev => ({ ...prev, [data.tableId]: data.customerName }));
            } else { // TABLE_RELEASE
              setHoldingTables(prev => {
                const next = { ...prev };
                delete next[data.tableId];
                return next;
              });
            }
          }
        } catch (e) {}
      };
    }

    init();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  useEffect(() => {
    async function fetchOrder() {
      if (isTableManageModalOpen && managedTable) {
        setIsLoadingOrder(true);
        const order = await getActiveOrder(managedTable.id);
        setActiveOrder(order);
        setIsLoadingOrder(false);
      } else {
        setActiveOrder(null);
      }
    }
    fetchOrder();
  }, [isTableManageModalOpen, managedTable]);

  const isManager = user?.role === 'Quản lý';
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const checkOverlap = (id: number, x: number, y: number, w: number, h: number, area: string) => {
    const containerW = configRef.current.containerWidth;
    const containerH = configRef.current.containerHeight;
    const px1 = (x * containerW) / 100;
    const py1 = (y * containerH) / 100;
    
    for (const t of tablesRef.current) {
      if (t.id === id || t.area !== area) continue;
      const isVert = t.orientation === 'vertical';
      let tw = t.width || (t.type === 'bar' ? (isVert ? 80 : 250) : (isVert ? 60 : (t.capacity > 2 ? 100 : 60)));
      let th = t.height || (t.type === 'bar' ? (isVert ? 250 : 80) : (isVert ? (t.capacity > 2 ? 100 : 60) : 60));
      const px2 = (t.posX * containerW) / 100;
      const py2 = (t.posY * containerH) / 100;
      if (Math.abs(px1 - px2) < (w + tw) / 2 && Math.abs(py1 - py2) < (h + th) / 2) return true;
    }
    return false;
  };

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    if (!isEditMode || !isManager) return;
    e.stopPropagation();
    setDraggingTableId(id);
    setSelectedTable(tablesRef.current.find(t => t.id === id) || null);
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handleResizeDown = (e: React.PointerEvent, table: FloorObject) => {
    if (!isEditMode || !isManager) return;
    e.stopPropagation();
    const isVert = table.orientation === 'vertical';
    const w = table.width || (table.type === 'bar' ? (isVert ? 80 : 250) : (isVert ? 60 : (table.capacity > 2 ? 100 : 60)));
    const h = table.height || (table.type === 'bar' ? (isVert ? 250 : 80) : (isVert ? (table.capacity > 2 ? 100 : 60) : 60));
    setResizingTableId(table.id);
    setResizeStart({ x: e.clientX, y: e.clientY, w, h });
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !containerRef.current || !isManager) return;
    if (resizingTableId !== null && resizeStart) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      let newW = Math.max(40, resizeStart.w + dx * 2);
      let newH = Math.max(40, resizeStart.h + dy * 2);
      if (configRef.current.snapToGrid) {
        newW = Math.round(newW / configRef.current.gridSize) * configRef.current.gridSize;
        newH = Math.round(newH / configRef.current.gridSize) * configRef.current.gridSize;
      }
      const t = tablesRef.current.find(o => o.id === resizingTableId);
      if (t && !checkOverlap(t.id, t.posX, t.posY, newW, newH, t.area)) {
        setTables(prev => prev.map(o => o.id === resizingTableId ? { ...o, width: newW, height: newH } : o));
      }
      return;
    }
    if (draggingTableId !== null) {
      const rect = containerRef.current.getBoundingClientRect();
      const draggedTable = tablesRef.current.find(t => t.id === draggingTableId);
      if (!draggedTable) return;
      const isVert = draggedTable.orientation === 'vertical';
      const w = draggedTable.width || (draggedTable.type === 'bar' ? (isVert ? 80 : 250) : (isVert ? 60 : (draggedTable.capacity > 2 ? 100 : 60)));
      const h = draggedTable.height || (draggedTable.type === 'bar' ? (isVert ? 250 : 80) : (isVert ? (draggedTable.capacity > 2 ? 100 : 60) : 60));
      let px = e.clientX - rect.left;
      let py = e.clientY - rect.top;
      if (configRef.current.snapToGrid) {
        px = Math.round(px / configRef.current.gridSize) * configRef.current.gridSize;
        py = Math.round(py / configRef.current.gridSize) * configRef.current.gridSize;
      }
      px = Math.max(w / 2 + 20, Math.min(rect.width - w / 2 - 20, px));
      py = Math.max(h / 2 + 20, Math.min(rect.height - h / 2 - 20, py));
      const x = (px / rect.width) * 100;
      const y = (py / rect.height) * 100;
      if (!checkOverlap(draggedTable.id, x, y, w, h, draggedTable.area)) {
        setTables(prev => prev.map(t => t.id === draggingTableId ? { ...t, posX: x, posY: y } : t));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTableId !== null || resizingTableId !== null) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      setDraggingTableId(null);
      setResizingTableId(null);
      setResizeStart(null);
    }
  };

  const duplicateTable = (obj: FloorObject) => {
    if (!isManager) return;
    const nextId = tables.length === 0 ? 1 : Math.max(...tables.map(t => t.id)) + 1;
    let newName = obj.name;
    const match = obj.name.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStrLength = match[2].length;
      const existingNumbers = tablesRef.current
        .map(t => {
          const m = t.name.match(new RegExp(`^${prefix}(\\d+)$`));
          return m ? parseInt(m[1]) : null;
        }).filter((n): n is number => n !== null);
      const nextNum = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
      newName = `${prefix}${nextNum.toString().padStart(numStrLength, '0')}`;
    } else {
      newName = `${obj.name} (Copy)`;
    }
    const newObj: FloorObject = { ...obj, id: nextId, name: newName, posX: obj.posX + 2, posY: obj.posY + 2, status: 'Trống', customerName: null, customerPhone: null, bookingTime: null };
    setTables(prev => [...prev, newObj]);
    setSelectedTable(newObj);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !isManager) return;
    setTables(prev => prev.map(t => t.id === editForm.id ? editForm : t));
    setIsEditDetailsOpen(false);
    setSelectedTable(editForm);
  };

  const toggleOrientation = () => {
    if (!selectedTable || !isManager) return;
    const newOrientation = selectedTable.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, orientation: newOrientation as any } : t));
    setSelectedTable({ ...selectedTable, orientation: newOrientation as any });
  };

  const handleDeleteObject = (obj: FloorObject, e?: React.MouseEvent) => {
    if (!isManager) return;
    e?.stopPropagation();
    if (!window.confirm(`Xóa "${obj.name}" khỏi sơ đồ? Thao tác không thể hoàn tác.`)) return;
    setTables(prev => prev.filter(t => t.id !== obj.id));
    deleteTable(obj.name);
    setSelectedTable(s => (s?.id === obj.id ? null : s));
  };

  const openAddDialog = () => {
    if (!isManager) return;
    setAddFormError(null);
    setAddForm({ type: 'table', name: '', capacity: 4, area: currentArea || (areas.length > 0 ? areas[0] : "") });
    setAddOpen(true);
  };

  const handleAreaAdd = () => {
    if (!isManager) return;
    const name = prompt("Nhập tên khu vực mới:");
    if (!name || areas.includes(name)) return;
    const next = [...areas, name];
    setAreas(next);
    persistFloorAreas(next);
    if (!currentArea) setCurrentArea(name);
  };

  const handleAreaDelete = (area: string) => {
    if (!isManager || areas.length <= 1) return;
    if (!confirm(`Xóa khu vực "${area}"? Tất cả bàn trong khu vực này sẽ bị xóa.`)) return;
    const next = areas.filter(a => a !== area);
    setAreas(next);
    persistFloorAreas(next);
    setTables(prev => prev.filter(t => t.area !== area));
    if (currentArea === area) setCurrentArea(next[0]);
  };

  const handleAreaRename = (oldName: string) => {
    if (!isManager) return;
    const newName = prompt(`Đổi tên khu vực "${oldName}" thành:`, oldName);
    if (!newName || newName === oldName || areas.includes(newName)) return;
    const nextAreas = areas.map(a => a === oldName ? newName : a);
    setAreas(nextAreas);
    persistFloorAreas(nextAreas);
    setTables(prev => prev.map(t => t.area === oldName ? { ...t, area: newName } : t));
    if (currentArea === oldName) setCurrentArea(newName);
  };

  const resetSize = (id: number) => {
    if (!isManager) return;
    setTables(prev => prev.map(t => t.id === id ? { ...t, width: undefined, height: undefined } : t));
  };

  const openEditDetails = (table: FloorObject) => {
    if (!isManager) return;
    setEditForm(table);
    setIsEditDetailsOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, table: FloorObject) => {
    if (!isEditMode || !isManager) return;
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, table });
    setSelectedTable(table);
  };

  const closeContextMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    const name = addForm.name?.trim();
    if (!name) { setAddFormError('Vui lòng nhập tên.'); return; }
    const nextId = tables.length === 0 ? 1 : Math.max(...tables.map(t => t.id)) + 1;
    const newObj: FloorObject = { id: nextId, name, type: addForm.type as any, status: 'Trống', capacity: addForm.type === 'bar' ? 0 : addForm.capacity!, area: addForm.area!, posX: 50, posY: 50, orientation: 'horizontal' };
    setTables(prev => [...prev, newObj]);
    setAddOpen(false);
    setIsEditMode(true);
    setSelectedTable(newObj);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Trống': return 'bg-white border-zinc-200 text-zinc-400';
      case 'Đang dùng': return 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-100 shadow-lg';
      case 'Đang phục vụ': return 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-100 shadow-lg';
      case 'Đã đặt': return 'bg-amber-400 border-amber-500 text-white shadow-amber-100 shadow-lg';
      default: return 'bg-white border-zinc-200 text-zinc-400';
    }
  };

  const closeModals = () => { if (!isEditMode) setSelectedTable(null); setIsReserveModalOpen(false); };

  const renderObject = (table: FloorObject) => {
    const isVert = table.orientation === 'vertical';
    const isSelected = selectedTable?.id === table.id;
    const isDragging = draggingTableId === table.id;
    const isHolding = holdingTables[table.id];
    
    if (table.type === 'bar') {
      const w = table.width || (isVert ? 80 : 250);
      const h = table.height || (isVert ? 250 : 80);
      const clampX = w / 2 + 10;
      const clampY = h / 2 + 10;
      
      return (
        <div 
          key={table.id}
          className={cn("absolute", isHolding && "animate-pulse")}
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
          onContextMenu={(e) => handleContextMenu(e, table)}
          onClick={(e) => { 
            e.stopPropagation(); 
            if (isEditMode) { 
              setSelectedTable(table); 
              closeContextMenu(); 
            } else {
              setManagedTable(table);
              setIsTableManageModalOpen(true);
            }
          }}
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
          
          {isEditMode && isSelected && isManager && (
            <div 
              className="absolute bottom-[-6px] right-[-6px] w-4 h-4 bg-primary rounded-full cursor-se-resize shadow-md flex items-center justify-center z-40 border-2 border-white"
              onPointerDown={(e) => handleResizeDown(e, table)}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
            </div>
          )}
        </div>
      );
    }
    
    const w = table.width || (isVert ? 60 : (table.capacity > 2 ? 100 : 60));
    const h = table.height || (isVert ? (table.capacity > 2 ? 100 : 60) : 60);
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
    }

    const clampX = w / 2 + 20;
    const clampY = h / 2 + 20;

    return (
      <div 
        key={table.id}
        className={cn(
          "absolute",
          !isEditMode && "cursor-pointer"
        )}
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
        onContextMenu={(e) => handleContextMenu(e, table)}
        onClick={(e) => { 
          e.stopPropagation(); 
          if (isEditMode) { 
            setSelectedTable(table); 
            closeContextMenu(); 
          } else {
            setManagedTable(table);
            setIsTableManageModalOpen(true);
          }
        }}
      >
        <div className={cn(
          "absolute inset-0 border-2 border-zinc-200 transition-all shadow-sm overflow-hidden",
          table.status === 'Trống' ? (isHolding ? "bg-amber-50 border-amber-200" : "bg-white") : getStatusColor(table.status),
          isSelected && isEditMode ? "ring-4 ring-primary border-primary" : "rounded-xl",
          isHolding && !isSelected && "ring-2 ring-amber-400 border-amber-400"
        )}>
          {chairs.map((chair, i) => (
            <div 
              key={i} 
              className={cn(
                "absolute border rounded-sm",
                isHolding ? "bg-amber-200 border-amber-300" : 
                table.status === 'Đang dùng' ? "bg-emerald-400 border-emerald-600" :
                table.status === 'Đã đặt' ? "bg-amber-300 border-amber-500" :
                "bg-zinc-300 border-zinc-400"
              )}
              style={{ width: chairSize, height: chairSize, ...chair }}
            />
          ))}
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider mb-0.5",
              isHolding ? "text-amber-600" : "text-zinc-400"
            )}>{table.name}</span>
            <span className={cn(
              "text-[9px] font-medium",
              isHolding ? "text-amber-500" : "text-zinc-500"
            )}>
              {isHolding ? `Đang chọn...` : `${table.capacity} ghế`}
            </span>
          </div>
        </div>

        {isEditMode && isSelected && isManager && (
          <div 
            className="absolute bottom-[-6px] right-[-6px] w-4 h-4 bg-primary rounded-full cursor-se-resize shadow-md flex items-center justify-center z-40 border-2 border-white"
            onPointerDown={(e) => handleResizeDown(e, table)}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col max-h-[calc(100vh-2rem)]">
      {notifications.length > 0 && (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 animate-in fade-in slide-in-from-right-4">
          {notifications.map((n, i) => (
            <div key={i} className="bg-zinc-900 text-white p-5 rounded-2xl shadow-2xl flex flex-col gap-3 border border-white/10 overflow-hidden relative group">
              {/* Progress bar for auto-close feel (visual only) */}
              <div className="absolute bottom-0 left-0 h-1 bg-primary/40 w-full" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Thông báo mới</span>
                </div>
                <button 
                  onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white leading-tight">
                  Khách đặt {n.tableName || "bàn"}
                </h3>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Họ tên: <span className="text-zinc-100">{n.customerName}</span>
                </p>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Thời gian: <span className="text-zinc-100">{n.bookingTime}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
                <span className="text-[9px] text-zinc-500 font-medium italic">
                  {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <button 
                  onClick={() => {
                    if (n.tableId) {
                      // Logic to "go to" table could be here
                    }
                    setNotifications(prev => prev.filter((_, idx) => idx !== i));
                  }}
                  className="text-[9px] uppercase font-black tracking-widest text-primary hover:text-white transition-colors"
                >
                  Xem sơ đồ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-end border-b border-border pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Sơ đồ mặt bằng</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditMode ? "Sắp xếp bàn và quản lý thực tế (Kéo thả để di chuyển)" : "Theo dõi trạng thái bàn thời gian thực"}
          </p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <Button 
              variant={isEditMode ? "default" : "outline"}
              size="sm" 
              className={cn("text-xs uppercase tracking-wider", isEditMode && "bg-zinc-900")}
              onClick={async () => {
                if (isEditMode) {
                  const result = await saveTables(tablesRef.current);
                  if (result.success && result.tables) {
                    setTables(result.tables);
                  }
                  setIsEditMode(false);
                  setSelectedTable(null);
                } else {
                  setIsEditMode(true);
                }
              }}
            >
              {isEditMode ? <><Save className="w-3 h-3 mr-2"/> Lưu cấu hình</> : <><Edit3 className="w-3 h-3 mr-2"/> Cấu hình sơ đồ</>}
            </Button>
          )}
          {isEditMode && isManager && (
            <>
              <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider" type="button" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-3 h-3 mr-2"/> Cài đặt sơ đồ
              </Button>
              <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider" type="button" onClick={openAddDialog}>
                <Plus className="w-3 h-3 mr-2"/> Thêm đối tượng
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center shrink-0">
        <div className="flex gap-4">
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
        {isEditMode && isManager && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider" onClick={handleAreaAdd}>
              <Plus className="w-3 h-3 mr-1" /> Thêm khu vực
            </Button>
            {currentArea && (
              <>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider" onClick={() => handleAreaRename(currentArea)}>
                  <Edit3 className="w-3 h-3 mr-1" /> Đổi tên
                </Button>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider text-red-500 hover:text-red-600" onClick={() => handleAreaDelete(currentArea)}>
                  <Trash2 className="w-3 h-3 mr-1" /> Xóa khu vực
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className={cn(
          "relative bg-zinc-50 border border-zinc-200 rounded-lg overflow-auto mx-auto shadow-inner select-none",
          isEditMode ? "cursor-crosshair" : "cursor-default"
        )}
        style={{
          width: `${config.containerWidth}px`,
          height: `${config.containerHeight}px`,
          maxWidth: '100%',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => { if (isEditMode) setSelectedTable(null); }}
      >
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
            backgroundSize: `${config.gridSize}px ${config.gridSize}px` 
          }}
        />

        {tables.filter(t => t.area === currentArea).map(renderObject)}
      </div>

      {contextMenu.visible && contextMenu.table && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={closeContextMenu} />
          <div 
            className="fixed bg-zinc-900 text-white rounded-lg shadow-2xl py-1 min-w-[160px] z-[70] border border-zinc-800 animate-in fade-in zoom-in duration-100"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onContextMenu={e => e.preventDefault()}
          >
            <div className="px-3 py-1.5 border-b border-zinc-800 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{contextMenu.table.name}</p>
            </div>
            <button 
              className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              onClick={() => { toggleOrientation(); closeContextMenu(); }}
            >
              <RotateCw className="w-3.5 h-3.5" /> Xoay đối tượng
            </button>
            <button 
              className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              onClick={() => { if (contextMenu.table) duplicateTable(contextMenu.table); closeContextMenu(); }}
            >
              <Copy className="w-3.5 h-3.5" /> Nhân bản
            </button>
            <button 
              className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              onClick={() => { if (contextMenu.table) resetSize(contextMenu.table.id); closeContextMenu(); }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Đặt lại kích thước
            </button>
            <button 
              className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              onClick={() => { if (contextMenu.table) openEditDetails(contextMenu.table); closeContextMenu(); }}
            >
              <Edit3 className="w-3.5 h-3.5" /> Sửa chi tiết
            </button>
            <div className="h-px bg-zinc-800 my-1" />
            <button 
              className="w-full px-3 py-2 text-left text-xs hover:bg-red-950 text-red-400 flex items-center gap-2 transition-colors"
              onClick={(e) => { if (contextMenu.table) handleDeleteObject(contextMenu.table, e as any); closeContextMenu(); }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa đối tượng
            </button>
          </div>
        </>
      )}

      <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border border-zinc-200" />
          Trống
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
          Đang dùng
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-200" />
          Đã đặt
        </div>
      </div>

      {/* Add Object Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Tạo đối tượng mới</h2>
              <p className="text-zinc-400 text-sm font-medium">Thêm bàn hoặc quầy pha chế vào sơ đồ hiện tại</p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Chọn loại đối tượng</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, type: 'table' })}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3",
                      addForm.type === 'table' ? "border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-200" : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
                    )}
                  >
                    <Coffee className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-widest">Bàn cafe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, type: 'bar' })}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3",
                      addForm.type === 'bar' ? "border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-200" : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200"
                    )}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-widest">Quầy bar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fp-name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Tên hiển thị</Label>
                  <Input
                    id="fp-name"
                    required
                    className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 focus:ring-zinc-900 px-6"
                    value={addForm.name || ""}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fp-area" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Khu vực</Label>
                  <select
                    id="fp-area"
                    className="flex h-14 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all appearance-none"
                    value={addForm.area}
                    onChange={(e) => setAddForm({ ...addForm, area: e.target.value })}
                  >
                    {areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {addForm.type === 'table' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Số ghế</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 4, 6, 8].map(cap => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => setAddForm({ ...addForm, capacity: cap })}
                          className={cn(
                            "h-12 rounded-xl border-2 font-bold transition-all text-xs",
                            addForm.capacity === cap ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 bg-white text-zinc-400"
                          )}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {addFormError && <p className="text-xs text-red-500 font-bold ml-1">{addFormError}</p>}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Hủy</Button>
                <Button type="submit" className="flex-[2] h-16 bg-zinc-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]">Tạo ngay</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reserve Modal */}
      <Dialog open={isReserveModalOpen} onOpenChange={setIsReserveModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          {selectedTable && (
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Đặt chỗ trước</h2>
                <p className="text-zinc-400 text-sm font-medium">Giữ chỗ cho bàn {selectedTable.name}</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const res = await createBooking({
                  tableId: selectedTable.id,
                  customerName: reserveForm.customerName,
                  customerPhone: reserveForm.phone,
                  bookingTime: reserveForm.datetime,
                });
                if (res.success) {
                  setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Đã đặt', customerName: reserveForm.customerName, customerPhone: reserveForm.phone, bookingTime: reserveForm.datetime } : t));
                  setIsReserveModalOpen(false);
                }
              }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Tên khách hàng</Label>
                    <Input
                      required
                      className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 focus:ring-zinc-900 px-6"
                      value={reserveForm.customerName}
                      onChange={(e) => setReserveForm({ ...reserveForm, customerName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Số điện thoại</Label>
                    <Input
                      required
                      type="tel"
                      className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 focus:ring-zinc-900 px-6"
                      value={reserveForm.phone}
                      onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Thời gian đến</Label>
                    <Input
                      required
                      type="datetime-local"
                      className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 focus:ring-zinc-900 px-6"
                      value={reserveForm.datetime}
                      onChange={(e) => setReserveForm({ ...reserveForm, datetime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsReserveModalOpen(false)} className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Hủy</Button>
                  <Button type="submit" className="flex-[2] h-16 bg-zinc-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]">Xác nhận đặt</Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDetailsOpen} onOpenChange={setIsEditDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chi tiết</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên hiển thị</Label>
                  <Input id="edit-name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-area">Khu vực</Label>
                  <select
                    id="edit-area"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.area}
                    onChange={e => setEditForm({...editForm, area: e.target.value})}
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-width">Chiều rộng (px)</Label>
                  <Input id="edit-width" type="number" value={editForm.width || 0} onChange={e => setEditForm({...editForm, width: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-height">Chiều cao (px)</Label>
                  <Input id="edit-height" type="number" value={editForm.height || 0} onChange={e => setEditForm({...editForm, height: parseInt(e.target.value)})} />
                </div>
              </div>

              {editForm.type === 'table' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-cap">Số ghế</Label>
                  <select
                    id="edit-cap"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.capacity}
                    onChange={e => setEditForm({...editForm, capacity: parseInt(e.target.value) as any})}
                  >
                    <option value={2}>2 ghế</option>
                    <option value={4}>4 ghế</option>
                    <option value={6}>6 ghế</option>
                  </select>
                </div>
              )}

              <DialogFooter>
                <Button type="submit">Lưu thay đổi</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cấu hình sơ đồ</DialogTitle>
            <DialogDescription>Điều chỉnh kích thước quán và lưới tọa độ.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rộng quán (px)</Label>
                <Input type="number" value={config.containerWidth} onChange={e => setConfig({...config, containerWidth: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Dài quán (px)</Label>
                <Input type="number" value={config.containerHeight} onChange={e => setConfig({...config, containerHeight: parseInt(e.target.value)})} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Snap to grid (Hút vào lưới)</Label>
                <p className="text-[10px] text-muted-foreground">Giúp căn chỉnh các bàn thẳng hàng</p>
              </div>
              <input 
                type="checkbox" 
                className="w-4 h-4"
                checked={config.snapToGrid} 
                onChange={e => setConfig({...config, snapToGrid: e.target.checked})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Kích thước lưới (px)</Label>
              <Input type="number" value={config.gridSize} onChange={e => setConfig({...config, gridSize: parseInt(e.target.value)})} />
            </div>

            <DialogFooter>
              <Button onClick={() => { persistFloorConfig(config); setIsSettingsOpen(false); }}>Lưu cấu hình</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* Table Management Modal */}
      <Dialog open={isTableManageModalOpen} onOpenChange={setIsTableManageModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
          {managedTable && (
            <>
              {/* Header with status color - Fixed at top */}
              <div className={cn(
                "p-6 text-white flex flex-col gap-1 shrink-0",
                managedTable.status === 'Đã đặt' ? "bg-zinc-500" : 
                managedTable.status === 'Đang dùng' ? "bg-zinc-900" : "bg-zinc-100 text-zinc-900"
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{managedTable.name}</h2>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70 mt-1">
                      {managedTable.area} • {managedTable.capacity} khách
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20">
                    {managedTable.status}
                  </div>
                </div>
              </div>

              {/* Content Area - Scrollable if needed */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Customer Info & General Actions */}
                <div className="flex-1 p-8 border-r border-zinc-50 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Thông tin chi tiết</p>
                    {(managedTable.customerName || managedTable.bookingTime) ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-[1.5rem]">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-tight leading-none mb-1">Tên khách hàng</p>
                            <p className="text-sm font-black text-zinc-900">{managedTable.customerName || "Khách lẻ"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-[1.5rem]">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-tight leading-none mb-1">Số điện thoại</p>
                            <p className="text-sm font-black text-zinc-900">{managedTable.customerPhone || "Chưa cập nhật"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-[1.5rem]">
                          <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-tight leading-none mb-1">Giờ hẹn đặt bàn</p>
                            <p className="text-sm font-black text-zinc-900">{managedTable.bookingTime || "---"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed border-zinc-100 rounded-[2rem] bg-zinc-50/30">
                        <ShoppingCart className="w-6 h-6 text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest italic">Bàn trống</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Thao tác vận hành</p>
                    <div className="grid grid-cols-1 gap-2">
                      {managedTable.status === 'Đã đặt' && (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex gap-2 shadow-lg shadow-zinc-200"
                            onClick={async () => {
                              const res = await confirmCustomerArrival(managedTable.id);
                              if (res.success) {
                                setTables(prev => prev.map(t => t.id === managedTable.id ? { ...t, status: 'Đang dùng' } : t));
                                setIsTableManageModalOpen(false);
                              }
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Khách đến
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-14 px-5 border-red-100 text-red-500 hover:bg-red-50 rounded-2xl"
                            onClick={async () => {
                              if (confirm("Hủy đặt bàn?")) {
                                const res = await cancelBooking(managedTable.id);
                                if (res.success) {
                                  setTables(prev => prev.map(t => t.id === managedTable.id ? { ...t, status: 'Trống', customerName: null, customerPhone: null, bookingTime: null } : t));
                                  setIsTableManageModalOpen(false);
                                }
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {managedTable.status === 'Đang dùng' && (
                        <Button 
                          variant="outline"
                          className="h-14 border-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] flex gap-2"
                          onClick={() => {
                            router.push(`/dashboard/orders?tableId=${managedTable.id}`);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" /> Order món
                        </Button>
                      )}
                      
                      {managedTable.status === 'Trống' && (
                        <Button 
                          className="h-14 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex gap-2"
                          onClick={() => {
                            setSelectedTable(managedTable);
                            setIsReserveModalOpen(true);
                            setIsTableManageModalOpen(false);
                          }}
                        >
                          <Plus className="w-4 h-4" /> Đặt bàn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Order Details */}
                <div className="flex-1 bg-zinc-50/50 p-8 flex flex-col overflow-hidden">
                  {activeOrder ? (
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Đơn hàng</p>
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {activeOrder.items.map((item: any) => (
                          <div key={item.id} className="flex gap-3 items-center bg-white p-3 rounded-[1.25rem] border border-zinc-100/50 shadow-sm">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100">
                              <img src={item.product.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&h=100&fit=crop"} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-zinc-900 truncate">{item.product.name}</p>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase">{item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)} ₫</p>
                            </div>
                            <span className="text-xs font-black text-zinc-900">
                              {new Intl.NumberFormat('vi-VN').format(item.quantity * item.price)} ₫
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 mt-4 border-t border-zinc-200/50 space-y-4 shrink-0">
                        <div className="flex justify-between items-end">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Tổng thanh toán</span>
                            <div className="text-2xl font-black tracking-tighter text-zinc-900 leading-none">
                              {new Intl.NumberFormat('vi-VN').format(activeOrder.totalPrice)} ₫
                            </div>
                          </div>
                        </div>

                        <Button 
                          variant="destructive"
                          className="w-full h-14 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex gap-2 shadow-xl shadow-red-100 hover:bg-red-700"
                          onClick={async () => {
                            if (confirm("Xác nhận thanh toán?")) {
                              const res = await checkoutTable(managedTable.id);
                              if (res.success) {
                                setTables(prev => prev.map(t => t.id === managedTable.id ? { ...t, status: 'Trống', customerName: null, customerPhone: null, bookingTime: null } : t));
                                setIsTableManageModalOpen(false);
                              }
                            }
                          }}
                        >
                          <LogOutIcon className="w-4 h-4" /> Thanh toán
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                      <div className="w-16 h-16 rounded-[2rem] bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-200">
                        <ShoppingCart className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Chưa có đơn</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

