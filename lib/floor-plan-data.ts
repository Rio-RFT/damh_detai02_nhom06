export type FloorTableStatus = "Trống" | "Đang có khách" | "Đã đặt";
export type FloorOrientation = "horizontal" | "vertical";
export type FloorObjectType = "table" | "bar";

/** Thông tin khách đặt bàn (lưu cùng bàn trên sơ đồ) */
export interface FloorReservation {
  customerName: string;
  phone: string;
  datetime: string;
}

export interface FloorObject {
  id: number;
  name: string;
  type: FloorObjectType;
  status: FloorTableStatus;
  capacity: number;
  area: string;
  posX: number;
  posY: number;
  orientation: FloorOrientation;
  reservation?: FloorReservation;
}

export const FLOOR_PLAN_STORAGE_KEY = "cafe-floor-plan-tables";
export const FLOOR_UPDATED_EVENT = "cafe-floor-updated";
export const TABLE_AREAS = ["Bên trong", "Sân vườn", "Lầu 1"] as const;

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
    orientation: "vertical",
    reservation: {
      customerName: "Lê Minh",
      phone: "0901234567",
      datetime: "2026-06-01T18:00",
    },
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
    orientation: "horizontal",
  },
];

function isReservation(r: unknown): r is FloorReservation {
  return (
    r !== null &&
    typeof r === "object" &&
    typeof (r as FloorReservation).customerName === "string" &&
    typeof (r as FloorReservation).phone === "string" &&
    typeof (r as FloorReservation).datetime === "string"
  );
}

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
    const fo = t as FloorObject;
    if (fo.reservation !== undefined && fo.reservation !== null) {
      return isReservation(fo.reservation);
    }
    return true;
  });
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

/** Chỉ các đối tượng loại bàn (không gồm quầy) — dùng trang Quản lý Bàn */
export function getFloorTables(objects: FloorObject[]): FloorObject[] {
  return objects.filter((o) => o.type === "table");
}

/** Hiển thị trạng thái thống nhất với UI quản lý bàn */
export function displayTableStatus(status: FloorTableStatus): string {
  if (status === "Đang có khách") return "Đang phục vụ";
  return status;
}
