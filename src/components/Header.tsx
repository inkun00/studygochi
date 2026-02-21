'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { LogOut, Settings, Gem } from 'lucide-react';

interface HeaderProps {
  displayName?: string;
  gems?: number;
}

export default function Header({ displayName, gems = 0 }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b-2 border-gray-100 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐣</span>
          <h1 className="text-lg font-bold text-gray-800">StudyGotchi</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Gem size={14} className="text-amber-500" />
            <span className="text-sm font-bold text-amber-600">{gems}</span>
          </div>
          <span className="text-sm text-gray-500 hidden sm:block">{displayName}</span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} className="text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
