import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coffee, Clock, MapPin, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 h-20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">Minimal<span className="font-light">Cafe</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <a href="#about" className="hover:text-zinc-500 transition-colors">VỀ CHÚNG TÔI</a>
          <a href="#menu" className="hover:text-zinc-500 transition-colors">THỰC ĐƠN</a>
          <a href="#location" className="hover:text-zinc-500 transition-colors">VỊ TRÍ</a>
        </div>
        {/* <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest px-0 hover:bg-transparent hover:text-zinc-500">Đăng nhập</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-none px-6 h-12 text-xs font-bold uppercase tracking-[0.2em]">Hệ thống Quản lý</Button>
          </Link>
        </div> */}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center overflow-hidden">
        <div className="max-w-4xl text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <Star className="w-3 h-3 fill-current" /> Trải nghiệm cà phê nguyên bản
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-zinc-900">
            Nghệ thuật của sự <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-400 to-zinc-900">Tối Giản</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg text-zinc-500 font-light leading-relaxed">
            Nơi hương vị tinh túy hòa quyện cùng không gian tĩnh lặng, mang đến cho bạn những giây phút thư giãn thực thụ.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/booking" className="w-full sm:w-auto">
              <Button className="w-full h-16 px-10 bg-zinc-900 text-white rounded-none text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all hover:translate-y-[-2px]">
                Đặt bàn ngay <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/menu" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-16 px-10 border-zinc-200 rounded-none text-sm font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all">
                Khám phá thực đơn
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-20 w-full max-w-6xl aspect-[21/9] relative rounded-lg overflow-hidden shadow-2xl group">
          <img 
            src="/landing.png" 
            alt="Minimal Cafe Interior" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zinc-50 px-6 md:px-12 border-y border-zinc-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-zinc-900" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Hương vị Đặc sản</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-light">
              Tuyển chọn từ những hạt cà phê Arabica thượng hạng, được rang xay tỉ mỉ bởi các chuyên gia Barista.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-zinc-900" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Không gian Tĩnh lặng</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-light">
              Thiết kế tối giản giúp khơi nguồn cảm hứng và tạo sự thư thái cho mọi cuộc trò chuyện của bạn.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-zinc-900" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Phục vụ Tận tâm</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-light">
              Đội ngũ nhân viên luôn sẵn sàng mang đến cho bạn trải nghiệm dịch vụ ấm cúng và chuyên nghiệp nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto flex flex-col md:row items-center justify-between gap-8 opacity-50 grayscale hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <Coffee className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tight">MinimalCafe © 2024</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Instagram</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
