"use server";

import { db } from "./db";
import { FloorObject } from "./floor-plan-data";

export async function getTables() {
  try {
    const tables = await db.coffeeTable.findMany();
    // Map DB model to FloorObject interface
    return tables.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type as any,
      capacity: t.capacity,
      status: t.status as any,
      area: t.area,
      posX: t.posX,
      posY: t.posY,
      width: t.width || undefined,
      height: t.height || undefined,
      orientation: t.orientation as any,
      customerName: t.customerName,
      customerPhone: t.customerPhone,
      bookingTime: t.bookingTime,
    }));
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
}

export async function saveTables(tables: FloorObject[]) {
  try {
    for (const table of tables) {
      await db.coffeeTable.upsert({
        where: { name: table.name },
        update: {
          type: table.type,
          capacity: table.capacity,
          status: table.status,
          area: table.area,
          posX: table.posX,
          posY: table.posY,
          orientation: table.orientation,
          width: table.width,
          height: table.height,
          // We don't overwrite customer info here as it's managed by booking-actions
        },
        create: {
          name: table.name,
          type: table.type,
          capacity: table.capacity,
          status: table.status,
          area: table.area,
          posX: table.posX,
          posY: table.posY,
          orientation: table.orientation,
          width: table.width,
          height: table.height,
        }
      });
    }
    const updatedTables = await getTables();
    return { success: true, tables: updatedTables };
  } catch (error) {
    console.error("Error saving tables:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteTable(name: string) {
  try {
    await db.coffeeTable.delete({ where: { name } });
    return { success: true };
  } catch (error) {
    // If already deleted or not found, still return success to keep client in sync
    return { success: true };
  }
}
