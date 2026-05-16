"use server";

import { db } from "./db";

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true
      }
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const categories = await db.category.findMany();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
