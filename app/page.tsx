import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center text-primary">Hệ Thống Quản Lý Quán Nước / Cà Phê</h1>
        <p className="text-lg text-center text-muted-foreground">
          Đề tài 2: Ứng dụng quản lý đặt bàn Nhà hàng/Cà phê
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
          <Link href="/login" className="w-full">
            <Button className="w-full text-lg h-16" variant="default">Đăng nhập (Dành cho nhân viên)</Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full text-lg h-16" variant="outline">Xem trang quản lý (Demo)</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
