'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap, ShoppingBag, Home } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/main/study', label: '공부', icon: BookOpen, color: 'text-emerald-500' },
  { href: '/main/exam', label: '시험', icon: GraduationCap, color: 'text-amber-500' },
  { href: '/main/classroom', label: '교실', icon: Home, color: 'text-blue-500' },
  { href: '/main/shop', label: '상점', icon: ShoppingBag, color: 'text-purple-500' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 z-40">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${
                isActive
                  ? `${item.color} scale-110`
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${isActive ? '' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
