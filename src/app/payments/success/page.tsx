'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { user, setUser, pet, setPet } = useStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setMessage('결제 정보가 없습니다.');
        return;
      }

      try {
        const res = await fetch(FETCH_ALLOWLIST.api.paymentsConfirm(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || '결제 확인 실패');
          return;
        }

        const supabase = createClient();
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.userId).single();
        if (profile) setUser(profile);
        const { data: petRow } = await supabase.from('pets').select('*').eq('user_id', data.userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (petRow) setPet(petRow);

        setStatus('success');
        setMessage(`${data.points || 0}P가 지급되었습니다! ⭐`);
      } catch (e) {
        setStatus('error');
        setMessage('결제 처리 중 오류가 발생했습니다.');
      }
    };
    run();
  }, [searchParams, setUser, user?.id]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #ffe8c8 0%, #f0c890 100%)' }}>
      <div className="text-center p-6 rounded-lg ui-panel max-w-sm" style={{ fontFamily: "'Press Start 2P'" }}>
        {status === 'loading' && <p className="text-[14px]" style={{ color: '#805030' }}>처리 중...</p>}
        {status === 'success' && (
          <>
            <p className="text-[16px] mb-4" style={{ color: '#308030' }}>결제 완료!</p>
            <p className="text-[12px] mb-6" style={{ color: '#805030' }}>{message}</p>
            <Link href="/main/shop" className="pixel-btn px-4 py-2 text-[12px]">상점으로</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-[14px] mb-4" style={{ color: '#c03030' }}>오류</p>
            <p className="text-[10px] mb-6" style={{ color: '#805030' }}>{message}</p>
            <Link href="/main/shop" className="pixel-btn px-4 py-2 text-[12px]">상점으로</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #ffe8c8 0%, #f0c890 100%)' }}><p className="text-[14px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>처리 중...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
