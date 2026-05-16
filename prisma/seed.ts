import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString('hex')}`;
}

async function main() {
  // 1. Seed Admin Account
  const adminPassword = await hashPassword('123');
  await prisma.account.upsert({
    where: { username: 'admin' },
    update: { password: adminPassword },
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Administrator',
      role: 'Quản lý'
    }
  });

  // 2. Seed Categories
  const categories = [
    { name: 'Cà phê truyền thống' },
    { name: 'Cà phê hiện đại' },
    { name: 'Trà trái cây' },
    { name: 'Đồ ăn' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const allCats = await prisma.category.findMany();
  const getCatId = (name: string) => allCats.find(c => c.name === name)?.id || 1;

  // 3. Seed Products
  const products = [
    {
      name: 'Cà phê Đen Đá',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 25000,
      status: 'Sẵn sàng',
      imageUrl: 'https://vinbarista.com/uploads/news/10-loi-ich-bat-ngo-khi-uong-ca-phe-den-nguyen-chat-202504021427.jpg',
      description: 'Cà phê rang xay đậm vị truyền thống, đánh thức năng lượng ngày mới.',
    },
    {
      name: 'Bạc Xỉu Sữa Tươi',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 30000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=600&auto=format&fit=crop',
      description: 'Sự hòa quyện giữa vị đắng nhẹ của cà phê và vị béo ngọt của sữa đặc.',
    },
    {
      name: 'Trà Đào Cam Sả',
      categoryId: getCatId('Trà trái cây'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop',
      description: 'Trà đen hảo hạng kết hợp cùng đào tươi và sả thơm mát lạnh.',
    },
    {
      name: 'Bánh Sừng Bò',
      categoryId: getCatId('Đồ ăn'),
      price: 35000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
      description: 'Bánh nướng bơ Pháp giòn rụm, lớp vỏ nhiều lớp béo ngậy.',
    },
    {
      name: 'Caramel Macchiato',
      categoryId: getCatId('Cà phê hiện đại'),
      price: 52000,
      status: 'Sẵn sàng',
      imageUrl: 'https://dinnerthendessert.com/wp-content/uploads/2023/10/Caramel-Macchiato-10.jpg',
      description: 'Espresso, sữa tươi và sốt caramel ngọt nhẹ, lớp bọt mịn.',
    },
  ];

  // Clear existing products to avoid duplicates during re-seed
  await prisma.product.deleteMany({});
  
  for (const p of products) {
    await prisma.product.create({
      data: p
    });
  }

  // 4. Seed Coffee Tables
  const tables = [
    { name: 'Bàn 01', type: 'table', capacity: 2, area: 'Bên trong', posX: 20, posY: 30, orientation: 'horizontal' },
    { name: 'Bàn 02', type: 'table', capacity: 4, area: 'Bên trong', posX: 50, posY: 45, orientation: 'horizontal' },
    { name: 'Bàn 03', type: 'table', capacity: 4, area: 'Bên trong', posX: 80, posY: 30, orientation: 'vertical' },
    { name: 'Quầy Pha Chế', type: 'bar', capacity: 0, area: 'Bên trong', posX: 50, posY: 15, orientation: 'horizontal' },
  ];

  for (const t of tables) {
    await prisma.coffeeTable.upsert({
      where: { name: t.name },
      update: t,
      create: t,
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
