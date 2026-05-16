"use server";

import { db } from "./db";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  tableId: number;
  totalPrice: number;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}) {
  try {
    // 1. Create the order
    const order = await db.order.create({
      data: {
        tableId: data.tableId,
        totalPrice: data.totalPrice,
        status: "Chưa thanh toán",
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // 2. Update table status to 'Đang dùng'
    await db.coffeeTable.update({
      where: { id: data.tableId },
      data: { status: "Đang dùng" },
    });

    revalidatePath("/dashboard");
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: String(error) };
  }
}

export async function getActiveOrder(tableId: number) {
  try {
    const order = await db.order.findFirst({
      where: {
        tableId: tableId,
        status: "Chưa thanh toán",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return order;
  } catch (error) {
    console.error("Failed to fetch active order:", error);
    return null;
  }
}
