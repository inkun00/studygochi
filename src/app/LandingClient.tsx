'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import EggDevice from '@/components/ui/EggDevice';
import PixelPet from '@/components/pet/PixelPet';

export default function LandingClient() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/main/study');
    };
    checkAuth();
  }, [supabase, router]);

  return (
    <EggDevice
      title="STUDYGOTCHI"
      onButton1={() => router.push('/auth/signup')}
      onButton2={() => router.push('/auth/signup')}
      onButton3={() => router.push('/auth/login')}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3"
        style={{ background: 'linear-gradient(180deg, #fff8f0 0%, #ffe8d0 100%)' }}>
        {/* Pet */}
        <PixelPet isDead={false} size={64} characterSprite="rabbit" />

        {/* Title */}
        <div className="text-center">
          <h1 className="text-[20px] leading-tight" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>
            STUDY
          </h1>
          <h1 className="text-[20px] leading-tight" style={{ fontFamily: "'Press Start 2P'", color: '#40a040' }}>
            GOTCHI
          </h1>
        </div>

        <p className="text-[10px] text-center leading-relaxed" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
          공부한 내용으로 펫이<br />성장하고 AI가 시험을<br />치르는 학습 게임!
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full max-w-[160px] mt-2">
          <button
            data-testid="landing-start"
            onClick={() => router.push('/auth/signup')}
            className="pixel-btn w-full py-2 text-[14px]"
            style={{ fontFamily: "'Press Start 2P'", background: '#c0ffc0', color: '#308030', borderColor: '#60a060' }}
          >
            START!
          </button>
          <button
            data-testid="landing-login"
            onClick={() => router.push('/auth/login')}
            className="pixel-btn w-full py-2 text-[12px]"
            style={{ fontFamily: "'Press Start 2P'", background: '#ffe8c0', color: '#d06000', borderColor: '#d0a060' }}
          >
            LOGIN
          </button>
        </div>
      </div>
    </EggDevice>
  );
}
