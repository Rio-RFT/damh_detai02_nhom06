"use server";

import { db } from "./db";

export async function getNotifications() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markAsRead(id: number) {
  try {
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllAsRead() {
  try {
    await db.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
