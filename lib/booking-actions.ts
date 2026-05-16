"use server";

import { db } from "./db";
import { notificationEmitter, NOTIFICATION_EVENTS } from "./notifications";

export async function createBooking(tableId: number, customerName: string, customerPhone: string, bookingTime: string) {
  try {
    // 1. Update table status in DB
    const table = await db.coffeeTable.update({
      where: { id: tableId },
      data: {
        status: 'Đã đặt',
        customerName,
        customerPhone,
        bookingTime,
      }
    });

    // 2. Create persistent notification in DB
    await db.notification.create({
      data: {
        message: `Khách hàng ${customerName} vừa đặt ${table.name} lúc ${bookingTime}`,
        tableName: table.name,
        customerName,
        bookingTime,
        type: 'success',
      }
    });

    // 3. Trigger Real-time Notification
    notificationEmitter.emit(NOTIFICATION_EVENTS.NEW_BOOKING, {
      message: `Khách hàng ${customerName} vừa đặt ${table.name} lúc ${bookingTime}`,
      tableId: table.id,
      tableName: table.name,
      customerName,
      customerPhone,
      bookingTime,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: String(error) };
  }
}

export async function holdTable(tableId: number, tableName: string, customerName: string) {
  notificationEmitter.emit(NOTIFICATION_EVENTS.TABLE_HOLD, {
    tableId,
    tableName,
    customerName,
    timestamp: new Date().toISOString(),
  });
}

export async function releaseTable(tableId: number) {
  notificationEmitter.emit(NOTIFICATION_EVENTS.TABLE_RELEASE, {
    tableId,
    timestamp: new Date().toISOString(),
  });
}
