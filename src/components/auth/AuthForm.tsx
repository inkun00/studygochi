'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import EggDevice from '@/components/ui/EggDevice';
import PixelPet from '@/components/pet/PixelPet';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName, role } },
        });
        if (signUpError) throw signUpError;
        router.push('/main/study');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/main/study');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류 발생');
    } finally { setIsLoading(false); }
  }, [email, password, displayName, role, mode, supabase, router]);

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Press Start 2P'",
    color: 'var(--text-dark)',
    outline: 'none',
    background: 'transparent url(/sprites/ui/Buttons/Button%206/1.PNG) center/100% 100% no-repeat',
    imageRendering: 'pixelated',
    border: 'none',
    width: '100%',
    padding: '8px 12px',
    minHeight: '44px',
    boxSizing: 'border-box',
  };

  return (
    <EggDevice
      title="STUDYGOTCHI"
      onButton2={handleSubmit}
      onButton3={() => router.push(mode === 'login' ? '/auth/signup' : '/auth/login')}
    >
      <div className="w-full h-full flex flex-col items-center p-3 gap-2 overflow-y-auto" style={{ background: '#fff8f0' }}>
        <PixelPet isDead={false} size={40} characterSprite="rabbit" />
        <p className="text-[16px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>
          {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
        </p>

        {mode === 'signup' && (
          <>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="닉네임" className="w-full text-[12px]" style={inputStyle} />
            <div className="flex gap-1 w-full">
              <button onClick={() => setRole('student')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] transition-all ${role === 'student' ? 'pixel-border-light' : ''}`}
                style={{ fontFamily: "'Press Start 2P'", background: role === 'student' ? '#c0ffc0' : '#f0e8d8', color: role === 'student' ? '#308030' : '#a08060' }}>
                🎒 학생
              </button>
              <button onClick={() => setRole('teacher')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] transition-all ${role === 'teacher' ? 'pixel-border-light' : ''}`}
                style={{ fontFamily: "'Press Start 2P'", background: role === 'teacher' ? '#c0e0ff' : '#f0e8d8', color: role === 'teacher' ? '#3060a0' : '#a08060' }}>
                📚 교사
              </button>
            </div>
          </>
        )}

        <input data-testid="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일" className="w-full text-[12px]" style={inputStyle} />
        <input data-testid="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호" className="w-full text-[12px]" style={inputStyle} />

        {error && (
          <p className="text-[8px] p-1.5 rounded w-full text-center" style={{ fontFamily: "'Press Start 2P'", color: '#d04040' }}>
            {error}
          </p>
        )}

        <button
          data-testid="auth-submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-2 text-[14px] mt-1 disabled:opacity-40 border-none cursor-pointer"
          style={{
            fontFamily: "'Press Start 2P'",
            backgroundImage: 'url(/sprites/ui/Buttons/Button%206/1.PNG)',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            imageRendering: 'pixelated',
            color: 'var(--text-dark)',
          }}
          onMouseDown={(e) => { if (!isLoading) e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%206/2.PNG)'; }}
          onMouseUp={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%206/1.PNG)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%206/1.PNG)'; }}
          onTouchStart={(e) => { if (!isLoading) e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%206/2.PNG)'; }}
          onTouchEnd={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%206/1.PNG)'; }}
          onTouchCancel={(e) => { e.currentTarget.style.backgroundImage = 'url(/sprites/ui/Buttons/Button%206/1.PNG)'; }}
        >
          {isLoading ? '...' : mode === 'login' ? 'LOGIN' : 'JOIN!'}
        </button>

        <button onClick={() => router.push(mode === 'login' ? '/auth/signup' : '/auth/login')}
          className="text-[10px] mt-1" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>
          {mode === 'login' ? '회원가입 →' : '← 로그인'}
        </button>
      </div>
    </EggDevice>
  );
}
