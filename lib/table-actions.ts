"use server";

import { db } from "./db";
import { revalidatePath } from "next/cache";

export async function confirmCustomerArrival(tableId: number) {
  try {
    await db.coffeeTable.update({
      where: { id: tableId },
      data: {
        status: 'Đang dùng',
      }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function checkoutTable(tableId: number) {
  try {
    await db.coffeeTable.update({
      where: { id: tableId },
      data: {
        status: 'Trống',
        customerName: null,
        customerPhone: null,
        bookingTime: null,
      }
    });
    
    // In a real app, you would also close associated orders here
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function cancelBooking(tableId: number) {
  try {
    await db.coffeeTable.update({
      where: { id: tableId },
      data: {
        status: 'Trống',
        customerName: null,
        customerPhone: null,
        bookingTime: null,
      }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getTableDetails(tableId: number) {
  return await db.coffeeTable.findUnique({
    where: { id: tableId },
    include: {
      orders: {
        where: { status: { not: 'Completed' } }, // Only open orders
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });
}
