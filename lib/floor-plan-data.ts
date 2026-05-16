export type FloorTableStatus = "Trống" | "Đang có khách" | "Đã đặt";
export type FloorOrientation = "horizontal" | "vertical";
export type FloorObjectType = "table" | "bar";

export interface FloorObject {
  id: number;
  name: string;
  type: FloorObjectType;
  status: FloorTableStatus;
  capacity: number;
  area: string;
  posX: number;
  posY: number;
  width?: number; // % or px
  height?: number; // % or px
  orientation: FloorOrientation;
  customerName?: string | null;
  customerPhone?: string | null;
  bookingTime?: string | null;
}

export const FLOOR_PLAN_STORAGE_KEY = "cafe-floor-plan-tables";
export const FLOOR_CONFIG_STORAGE_KEY = "cafe-floor-plan-config";
export const FLOOR_AREAS_STORAGE_KEY = "cafe-floor-plan-areas";
export const FLOOR_UPDATED_EVENT = "cafe-floor-updated";
export const DEFAULT_TABLE_AREAS = ["Bên trong", "Sân vườn", "Lầu 1"];

export interface FloorConfig {
  containerWidth: number; // px
  containerHeight: number; // px
  snapToGrid: boolean;
  gridSize: number;
}

export const DEFAULT_FLOOR_CONFIG: FloorConfig = {
  containerWidth: 800,
  containerHeight: 600,
  snapToGrid: false,
  gridSize: 20,
};

export const INITIAL_FLOOR_OBJECTS: FloorObject[] = [
  {
    id: 999,
    name: "Quầy Pha Chế",
    type: "bar",
    status: "Trống",
    capacity: 0,
    area: "Bên trong",
    posX: 50,
    posY: 20,
    width: 250,
    height: 80,
    orientation: "horizontal",
  },
  {
    id: 1,
    name: "Bàn 01",
    type: "table",
    status: "Trống",
    capacity: 2,
    area: "Bên trong",
    posX: 20,
    posY: 30,
    width: 60,
    height: 60,
    orientation: "horizontal",
  },
  {
    id: 2,
    name: "Bàn 02",
    type: "table",
    status: "Đang có khách",
    capacity: 4,
    area: "Bên trong",
    posX: 50,
    posY: 45,
    width: 100,
    height: 60,
    orientation: "horizontal",
  },
  {
    id: 3,
    name: "Bàn 03",
    type: "table",
    status: "Đã đặt",
    capacity: 4,
    area: "Bên trong",
    posX: 80,
    posY: 30,
    width: 60,
    height: 100,
    orientation: "vertical",
    customerName: "Lê Minh",
    customerPhone: "0901234567",
    bookingTime: "18:00",
  },
  {
    id: 4,
    name: "Bàn 04",
    type: "table",
    status: "Trống",
    capacity: 6,
    area: "Bên trong",
    posX: 35,
    posY: 70,
    width: 100,
    height: 60,
    orientation: "horizontal",
  },
  {
    id: 5,
    name: "Sân 01",
    type: "table",
    status: "Trống",
    capacity: 2,
    area: "Sân vườn",
    posX: 30,
    posY: 40,
    width: 60,
    height: 60,
    orientation: "horizontal",
  },
];

function isValidFloorList(data: unknown): data is FloorObject[] {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;
  return data.every((t) => {
    if (
      !t ||
      typeof t !== "object" ||
      typeof (t as FloorObject).id !== "number" ||
      typeof (t as FloorObject).name !== "string" ||
      ((t as FloorObject).type !== "table" && (t as FloorObject).type !== "bar") ||
      typeof (t as FloorObject).capacity !== "number" ||
      typeof (t as FloorObject).area !== "string" ||
      typeof (t as FloorObject).posX !== "number" ||
      typeof (t as FloorObject).posY !== "number" ||
      ((t as FloorObject).orientation !== "horizontal" &&
        (t as FloorObject).orientation !== "vertical") ||
      ((t as FloorObject).status !== "Trống" &&
        (t as FloorObject).status !== "Đang có khách" &&
        (t as FloorObject).status !== "Đã đặt")
    ) {
      return false;
    }
    return true;
  });
}

export function loadFloorAreas(): string[] {
  if (typeof window === "undefined") return DEFAULT_TABLE_AREAS;
  try {
    const raw = localStorage.getItem(FLOOR_AREAS_STORAGE_KEY);
    if (!raw) return DEFAULT_TABLE_AREAS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_TABLE_AREAS;
  } catch {
    return DEFAULT_TABLE_AREAS;
  }
}

export function persistFloorAreas(areas: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLOOR_AREAS_STORAGE_KEY, JSON.stringify(areas));
  window.dispatchEvent(new Event(FLOOR_UPDATED_EVENT));
}

export function loadFloorObjects(): FloorObject[] {
  if (typeof window === "undefined") return INITIAL_FLOOR_OBJECTS;
  try {
    const raw = localStorage.getItem(FLOOR_PLAN_STORAGE_KEY);
    if (!raw) return INITIAL_FLOOR_OBJECTS;
    const parsed = JSON.parse(raw) as unknown;
    if (isValidFloorList(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return INITIAL_FLOOR_OBJECTS;
}

export function persistFloorObjects(items: FloorObject[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLOOR_PLAN_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(FLOOR_UPDATED_EVENT));
}

export function loadFloorConfig(): FloorConfig {
  if (typeof window === "undefined") return DEFAULT_FLOOR_CONFIG;
  try {
    const raw = localStorage.getItem(FLOOR_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_FLOOR_CONFIG;
    return JSON.parse(raw) as FloorConfig;
  } catch {
    return DEFAULT_FLOOR_CONFIG;
  }
}

export function persistFloorConfig(config: FloorConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLOOR_CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event(FLOOR_UPDATED_EVENT));
}

/** Chỉ các đối tượng loại bàn (không gồm quầy) — dùng trang Quản lý Bàn */
export function getFloorTables(objects: FloorObject[]): FloorObject[] {
  return objects.filter((o) => o.type === "table");
}

/** Hiển thị trạng thái thống nhất với UI quản lý bàn */
export function displayTableStatus(status: FloorTableStatus): string {
  if (status === "Đang có khách") return "Đang phục vụ";
  return status;
}
