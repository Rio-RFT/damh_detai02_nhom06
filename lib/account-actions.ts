"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashPassword } from "./hash";

export async function getAccounts() {
  return await db.account.findMany();
}

export async function createAccount(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  if (!username || !password || !name) {
    throw new Error("Vui lòng điền đầy đủ thông tin");
  }

  const hashedPassword = await hashPassword(password);

  await db.account.create({
    data: {
      username,
      password: hashedPassword,
      name,
      role: role || "Nhân viên",
    },
  });

  revalidatePath("/dashboard/accounts");
}

export async function updateAccount(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  const data: any = { name, role };
  if (password) {
    data.password = await hashPassword(password);
  }

  await db.account.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/accounts");
}

export async function deleteAccount(id: number) {
  await db.account.delete({
    where: { id },
  });

  revalidatePath("/dashboard/accounts");
}
