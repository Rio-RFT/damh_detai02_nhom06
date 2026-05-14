export type MenuProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'Sẵn sàng' | 'Hết hàng';
  imageUrl: string;
  description: string;
};

export type OrderMenuRow = {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
};

export const MENU_STORAGE_KEY = 'cafe-menu-products';
export const MENU_UPDATED_EVENT = 'cafe-menu-updated';

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';

export const INITIAL_MENU_PRODUCTS: MenuProduct[] = [
  {
    id: 1,
    name: 'Cà phê Đen Đá',
    category: 'Cà phê truyền thống',
    price: 25000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://vinbarista.com/uploads/news/10-loi-ich-bat-ngo-khi-uong-ca-phe-den-nguyen-chat-202504021427.jpg',
    description: 'Cà phê rang xay đậm vị truyền thống, đánh thức năng lượng ngày mới.',
  },
  {
    id: 2,
    name: 'Bạc Xỉu Sữa Tươi',
    category: 'Cà phê truyền thống',
    price: 30000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=600&auto=format&fit=crop',
    description: 'Sự hòa quyện giữa vị đắng nhẹ của cà phê và vị béo ngọt của sữa đặc.',
  },
  {
    id: 3,
    name: 'Trà Đào Cam Sả',
    category: 'Trà trái cây',
    price: 45000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop',
    description: 'Trà đen hảo hạng kết hợp cùng đào tươi và sả thơm mát lạnh.',
  },
  {
    id: 4,
    name: 'Trà Matcha Latte',
    category: 'Đồ uống đá xay',
    price: 55000,
    status: 'Hết hàng',
    imageUrl:
      'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=600&auto=format&fit=crop',
    description: 'Bột trà xanh nguyên chất từ Nhật Bản hòa quyện cùng sữa tươi mịn màng.',
  },
  {
    id: 5,
    name: 'Bánh Sừng Bò (Croissant)',
    category: 'Đồ ăn',
    price: 35000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
    description: 'Bánh nướng bơ Pháp giòn rụm, lớp vỏ nhiều lớp béo ngậy.',
  },
  {
    id: 6,
    name: 'Cà phê Sữa Đá',
    category: 'Cà phê truyền thống',
    price: 28000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop',
    description: 'Cà phê phin đậm đà pha cùng sữa đặc, vị ngọt béo cân bằng.',
  },
  {
    id: 7,
    name: 'Americano Nóng',
    category: 'Cà phê hiện đại',
    price: 32000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
    description: 'Espresso pha loãng nước nóng, hương rang rõ nét, ít calo.',
  },
  {
    id: 8,
    name: 'Caramel Macchiato',
    category: 'Cà phê hiện đại',
    price: 52000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://dinnerthendessert.com/wp-content/uploads/2023/10/Caramel-Macchiato-10.jpg',
    description: 'Espresso, sữa tươi và sốt caramel ngọt nhẹ, lớp bọt mịn.',
  },
  {
    id: 9,
    name: 'Trà Sữa Trân Châu Đường Đen',
    category: 'Trà sữa',
    price: 48000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=600&auto=format&fit=crop',
    description: 'Trà đen ủ lạnh, sữa béo, trân châu dai giòn và syrup đường đen.',
  },
  {
    id: 10,
    name: 'Nước Ép Cam Tươi',
    category: 'Nước ép',
    price: 42000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600&auto=format&fit=crop',
    description: 'Cam ép tại chỗ, giàu vitamin C, vị chua ngọt tự nhiên.',
  },
  {
    id: 11,
    name: 'Sinh Tố Bơ',
    category: 'Sinh tố',
    price: 50000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=600&auto=format&fit=crop',
    description: 'Bơ chín mềm xay cùng sữa tươi, kem mịn, bổ dưỡng.',
  },
  {
    id: 12,
    name: 'Bánh Mì Thịt Nguội',
    category: 'Đồ ăn',
    price: 38000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop',
    description: 'Ổ bánh giòn, nhân thịt nguội, pate, rau củ và sốt đặc trưng.',
  },
  {
    id: 13,
    name: 'Mì Ý Sốt Bò Bằm',
    category: 'Đồ ăn',
    price: 75000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ7GKbrZXX0SLqZcdRFJSAi2QJ0GJNWkRJpQ&s',
    description: 'Mì spaghetti al dente, sốt thịt bò hầm thơm phô mai parmesan.',
  },
  {
    id: 14,
    name: 'Khoai Tây Chiên',
    category: 'Đồ ăn',
    price: 32000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop',
    description: 'Cọng khoai vàng giòn, rắc muối nhẹ, ăn kèm tương cà.',
  },
  {
    id: 15,
    name: 'Nước Suối (500ml)',
    category: 'Đồ uống đóng chai',
    price: 12000,
    status: 'Sẵn sàng',
    imageUrl:
      'https://ionlifevn.com/wp-content/uploads/N%C6%B0%E1%BB%9Bc-Aquafina.jpg',
    description: 'Nước khoáng thiên nhiên, giải khát nhanh, tiện mang theo.',
  },
];

function isValidProductList(data: unknown): data is MenuProduct[] {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;
  return data.every(
    (p) =>
      p &&
      typeof p === 'object' &&
      typeof (p as MenuProduct).id === 'number' &&
      typeof (p as MenuProduct).name === 'string' &&
      typeof (p as MenuProduct).category === 'string' &&
      typeof (p as MenuProduct).price === 'number' &&
      ((p as MenuProduct).status === 'Sẵn sàng' || (p as MenuProduct).status === 'Hết hàng') &&
      typeof (p as MenuProduct).imageUrl === 'string' &&
      typeof (p as MenuProduct).description === 'string'
  );
}

export function loadMenuProducts(): MenuProduct[] {
  if (typeof window === 'undefined') return INITIAL_MENU_PRODUCTS;
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return INITIAL_MENU_PRODUCTS;
    const parsed = JSON.parse(raw) as unknown;
    if (isValidProductList(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return INITIAL_MENU_PRODUCTS;
}

export function persistMenuProducts(items: MenuProduct[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(MENU_UPDATED_EVENT));
}

export function toOrderMenuRows(products: MenuProduct[]): OrderMenuRow[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    imageUrl: p.imageUrl,
  }));
}
