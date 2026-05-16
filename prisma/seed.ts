import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Menu Seeding...');

  // 1. Seed Categories (Using upsert to preserve IDs if they exist)
  const categories = [
    { name: 'Cà phê truyền thống' },
    { name: 'Cà phê hiện đại' },
    { name: 'Trà trái cây' },
    { name: 'Trà sữa & Macchiato' },
    { name: 'Đá xay (Frappuccino)' },
    { name: 'Nước ép & Sinh tố' },
    { name: 'Bánh ngọt' },
    { name: 'Đồ ăn nhẹ' },
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

  // 2. Curated Products List
  const products = [
    // --- Cà phê truyền thống ---
    {
      name: 'Cà phê Đen Đá',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 25000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
      description: 'Hạt cà phê Rang Xay nguyên chất, đậm đà hương vị truyền thống Việt Nam.',
    },
    {
      name: 'Cà phê Sữa Đá',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 29000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop',
      description: 'Sự kết hợp hoàn hảo giữa cà phê đậm đà và sữa đặc béo ngậy.',
    },
    {
      name: 'Bạc Xỉu Sữa Tươi',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 35000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
      description: 'Nhiều sữa ít cà phê, phù hợp cho những ai thích vị ngọt ngào.',
    },
    {
      name: 'Cà phê Muối',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 39000,
      status: 'Sẵn sàng',
      imageUrl: 'https://media.istockphoto.com/id/1721750810/photo/vietnamese-salted-coffee-with-salty-cheese-cream-against-green-leaves.webp?a=1&b=1&s=612x612&w=0&k=20&c=snfKmkJ5_06mSUbsfZBPF8vFoLgxYWysZpwYkd4awmw=',
      description: 'Vị đắng của cà phê kết hợp với lớp kem muối mặn mặn, béo ngậy.',
    },
    {
      name: 'Cà phê Trứng',
      categoryId: getCatId('Cà phê truyền thống'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=600&auto=format&fit=crop',
      description: 'Đặc sản Hà Nội với lớp kem trứng đánh bông mịn màng.',
    },

    // --- Cà phê hiện đại ---
    {
      name: 'Caramel Macchiato',
      categoryId: getCatId('Cà phê hiện đại'),
      price: 55000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop',
      description: 'Sự kết hợp giữa Espresso, sữa tươi và sốt Caramel ngọt ngào.',
    },
    {
      name: 'Latte Art Hot',
      categoryId: getCatId('Cà phê hiện đại'),
      price: 49000,
      status: 'Sẵn sàng',
      imageUrl: 'https://media.istockphoto.com/id/1484464555/vi/anh/nh%C3%A2m-nhi-th%C6%B0%E1%BB%9Fng-th%E1%BB%A9c-v%C3%A0-th%C6%B0%E1%BB%9Fng-th%E1%BB%A9c-cappuccino-%C4%91%C6%B0%E1%BB%A3c-pha-ch%E1%BA%BF-ho%C3%A0n-h%E1%BA%A3o-v%E1%BB%9Bi-s%E1%BB%B1-bi%E1%BA%BFn-t%E1%BA%A5u-tuy%E1%BB%87t-%C4%91%E1%BA%B9p.jpg?s=612x612&w=0&k=20&c=s9MmytvoO_x9tLUn_ApuSvGb28tGRMky7BvQlUVuNuI=',
      description: 'Cà phê Espresso cùng sữa tươi nóng được tạo hình nghệ thuật.',
    },
    {
      name: 'Americano Ice',
      categoryId: getCatId('Cà phê hiện đại'),
      price: 39000,
      status: 'Sẵn sàng',
      imageUrl: 'https://media.istockphoto.com/id/1413678575/vi/anh/ice-americano-kho-%E1%BA%A3nh.jpg?s=612x612&w=0&k=20&c=LIAe8VgQN_KqhINxeP-cpR547r7TVlqO74cKC_qz6K8=',
      description: 'Espresso pha loãng với nước đá, thanh tao và ít calo.',
    },

    // --- Trà trái cây ---
    {
      name: 'Trà Đào Cam Sả',
      categoryId: getCatId('Trà trái cây'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop',
      description: 'Thanh mát với trà đen, đào miếng và hương thơm sả đặc trưng.',
    },
    {
      name: 'Trà Vải Khiếm Đào',
      categoryId: getCatId('Trà trái cây'),
      price: 49000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=600&auto=format&fit=crop',
      description: 'Trà nhài thơm ngát kết hợp cùng vải thiều tươi mọng nước.',
    },
    {
      name: 'Trà Dâu Tằm Macchiato',
      categoryId: getCatId('Trà trái cây'),
      price: 52000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
      description: 'Trà dâu tằm tươi kết hợp với lớp kem sữa Macchiato mịn màng.',
    },
    {
      name: 'Trà Sen Vàng',
      categoryId: getCatId('Trà trái cây'),
      price: 49000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
      description: 'Trà oolong sen thơm nhẹ, kèm hạt sen bùi và củ năng giòn.',
    },

    // --- Đá xay ---
    {
      name: 'Matcha Đá Xay',
      categoryId: getCatId('Đá xay (Frappuccino)'),
      price: 59000,
      status: 'Sẵn sàng',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1663853491469-786911ac70b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8TWF0Y2hhJTIwaWNlJTIwYmxlbmRlZHxlbnwwfHwwfHx8MA%3D%3D',
      description: 'Bột Matcha Nhật Bản nguyên chất xay cùng đá và kem tươi.',
    },
    {
      name: 'Chocolate Frappe',
      categoryId: getCatId('Đá xay (Frappuccino)'),
      price: 59000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop',
      description: 'Sô cô la đậm đà xay mịn, trang trí với sốt chocolate và kem.',
    },
    {
      name: 'Cookies & Cream',
      categoryId: getCatId('Đá xay (Frappuccino)'),
      price: 65000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop',
      description: 'Bánh Oreo xay cùng sữa tươi và đá, ngọt béo đậm vị.',
    },

    // --- Nước ép & Sinh tố ---
    {
      name: 'Sinh tố Bơ Sáp',
      categoryId: getCatId('Nước ép & Sinh tố'),
      price: 55000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1622704430673-59c152a9991c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QXZvY2FkbyUyMHNtb290aGllfGVufDB8fDB8fHww',
      description: 'Bơ sáp Đắk Lắk dẻo thơm, xay cùng sữa đặc.',
    },
    {
      name: 'Nước Ép Cam Tươi',
      categoryId: getCatId('Nước ép & Sinh tố'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1675667390417-d9d23160f4a6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fE9yYW5nZSUyMGp1aWNlfGVufDB8fDB8fHww',
      description: 'Cam sành mọng nước ép nguyên chất, giàu Vitamin C.',
    },
    {
      name: 'Sinh tố Dâu Tây',
      categoryId: getCatId('Nước ép & Sinh tố'),
      price: 59000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1693857228079-d2e455c231f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8U3RyYWJlcnJ5JTIwU21vb3RoaWV8ZW58MHx8MHx8fDA%3D',
      description: 'Dâu tây Đà Lạt tươi ngon, vị chua ngọt hài hòa.',
    },

    // --- Bánh ngọt ---
    {
      name: 'Tiramisu truyền thống',
      categoryId: getCatId('Bánh ngọt'),
      price: 65000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop',
      description: 'Bánh Ý trứ danh với vị cà phê và phô mai Mascarpone béo ngậy.',
    },
    {
      name: 'Croissant Bơ Pháp',
      categoryId: getCatId('Bánh ngọt'),
      price: 35000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
      description: 'Bánh sừng bò ngàn lớp giòn rụm, thơm nồng mùi bơ Pháp.',
    },
    {
      name: 'Red Velvet Cake',
      categoryId: getCatId('Bánh ngọt'),
      price: 59000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UmVkJTIwdmVsdmV0JTIwY2FrZXxlbnwwfHwwfHx8MA%3D%3D',
      description: 'Cốt bánh mềm mịn màu đỏ nhung, phủ lớp kem cheese đặc trưng.',
    },
    {
      name: 'Cheesecake Chanh Dây',
      categoryId: getCatId('Bánh ngọt'),
      price: 55000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop',
      description: 'Vị béo của phô mai hòa quyện cùng vị chua thanh của chanh dây tươi.',
    },
    {
      name: 'Muffin Socola Chip',
      categoryId: getCatId('Bánh ngọt'),
      price: 29000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1611614010348-7df489604fe3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TXVmZmluJTIwQ2hvY2FsYXRlJTIwQ2hpcHxlbnwwfHwwfHx8MA%3D%3D',
      description: 'Bánh muffin xốp mềm với những hạt socola chip ngọt ngào bên trong.',
    },

    // --- Trà sữa & Macchiato ---
    {
      name: 'Trà Sữa Trân Châu Đen',
      categoryId: getCatId('Trà sữa & Macchiato'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?q=80&w=600&auto=format&fit=crop',
      description: 'Trà sữa đậm vị trà, sữa béo cùng trân châu đen dai giòn.',
    },
    {
      name: 'Sữa Tươi Trân Châu Đường Đen',
      categoryId: getCatId('Trà sữa & Macchiato'),
      price: 52000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
      description: 'Sữa tươi nguyên chất kết hợp cùng trân châu nấu đường đen thơm lừng.',
    },
    {
      name: 'Oolong Macchiato',
      categoryId: getCatId('Trà sữa & Macchiato'),
      price: 49000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1563731649913-fab41907b535?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TWFjY2hpYXRvfGVufDB8fDB8fHww',
      description: 'Trà Oolong nướng thanh khiết với lớp kem sữa béo ngậy phía trên.',
    },

    // --- Đá xay bổ sung ---
    {
      name: 'Việt Quất Đá Xay',
      categoryId: getCatId('Đá xay (Frappuccino)'),
      price: 59000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=600&auto=format&fit=crop',
      description: 'Mứt việt quất chua ngọt xay cùng đá, phủ kem tươi mịn màng.',
    },
    {
      name: 'Chanh Dây Tuyết',
      categoryId: getCatId('Đá xay (Frappuccino)'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
      description: 'Nước cốt chanh dây tươi mát xay mịn, giải nhiệt cực tốt.',
    },

    // --- Nước ép & Sinh tố bổ sung ---
    {
      name: 'Nước Ép Dứa Nguyên Chất',
      categoryId: getCatId('Nước ép & Sinh tố'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UGluZWFwcGxlJTIwanVpY2V8ZW58MHx8MHx8fDA%3D',
      description: 'Dứa tươi chín mọng ép lấy nước, vị ngọt thanh tự nhiên.',
    },
    {
      name: 'Sinh tố Xoài Cát',
      categoryId: getCatId('Nước ép & Sinh tố'),
      price: 55000,
      status: 'Sẵn sàng',
      imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWFuZ28lMjBTbW9vdGhpZXxlbnwwfHwwfHx8MA%3D%3D',
      description: 'Xoài cát chín vàng, xay cùng sữa đặc và đá cho độ sệt hoàn hảo.',
    },

    // --- Đồ ăn nhẹ ---
    {
      name: 'Hạt Điều Rang Muối',
      categoryId: getCatId('Đồ ăn nhẹ'),
      price: 45000,
      status: 'Sẵn sàng',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1726768985970-dde12087d972?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cm9hc3RlZCUyMGNhc2hldyUyMG51dHMlMjB3aXRoJTIwc2FsdHxlbnwwfHwwfHx8MA%3D%3D',
      description: 'Hạt điều Bình Phước loại 1, giòn tan đậm đà.',
    },
    {
      name: 'Khô Gà Lá Chanh',
      categoryId: getCatId('Đồ ăn nhẹ'),
      price: 39000,
      status: 'Sẵn sàng',
      imageUrl: 'https://posi.com.vn/wp-content/uploads/2024/12/Kho-ga-la-chanh-Large-2.jpg',
      description: 'Gà xé cay thơm nồng mùi lá chanh, đồ nhắm tuyệt vời.',
    },
  ];

  // Clear existing products to ensure clean menu
  await prisma.product.deleteMany({});

  for (const p of products) {
    await prisma.product.create({
      data: p
    });
  }

  console.log('Seeding finished successfully. Only Menu has been updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
