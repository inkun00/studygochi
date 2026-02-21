'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useStore } from '@/store/useStore';
import { SHOP_ITEMS, POINT_PACKAGES } from '@/lib/constants';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';

export default function ShopPageClient() {
  const supabase = createClient();
  const { user, setUser, pet, setPet } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyItem = useCallback(async (itemId: 'revive_potion' | 'cheat_sheet') => {
    if (!user || !pet) return;
    const item = SHOP_ITEMS[itemId];
    const currentPoints = pet.points || 0;
    if (currentPoints < item.price) return;
    setIsLoading(true);
    try {
      const newPoints = currentPoints - item.price;
      const newItems = { ...user.items, [itemId]: (user.items[itemId] || 0) + 1 };
      await supabase.from('pets').update({ points: newPoints }).eq('id', pet.id);
      await supabase.from('profiles').update({ items: newItems }).eq('id', user.id);
      setPet({ ...pet, points: newPoints });
      setUser({ ...user, items: newItems });
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [user, pet, supabase, setUser, setPet]);

  const handleBuyPoints = useCallback(async (packageId: string) => {
    const pkg = POINT_PACKAGES.find(p => p.id === packageId);
    if (!pkg || !user) return;
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      alert('결제 설정이 되어 있지 않습니다. (NEXT_PUBLIC_TOSS_CLIENT_KEY)');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(FETCH_ALLOWLIST.api.paymentsCreate(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || '주문 생성 실패');

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: user.id });
      const successUrl = `${window.location.origin}/payments/success`;
      const failUrl = `${window.location.origin}/payments/fail`;

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: pkg.price },
        orderId: data.orderId,
        orderName: data.orderName,
        successUrl,
        failUrl,
        customerEmail: user.email,
        customerName: user.display_name,
      });
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : '결제 요청 실패');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  if (!user || !pet) return null;

  const points = pet.points || 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Point Balance */}
      <div className="text-center p-2 rounded-lg" style={{ background: '#fff8d0', border: '2px solid #e0c880' }}>
        <span className="text-[16px]" style={{ fontFamily: "'Press Start 2P'", color: '#d06000' }}>⭐ {points}P</span>
      </div>

      {/* Items */}
      <p className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>ITEMS</p>
      {(Object.entries(SHOP_ITEMS) as [keyof typeof SHOP_ITEMS, typeof SHOP_ITEMS[keyof typeof SHOP_ITEMS]][]).map(([key, item]) => (
        <div key={key} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#fff0e0', border: '2px solid #e0c8a0' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">{item.emoji}</span>
            <div>
              <p className="text-[10px]" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>{item.name}</p>
              <p className="text-[8px]" style={{ fontFamily: "'Press Start 2P'", color: '#a08060' }}>보유: {user.items[key] || 0}</p>
            </div>
          </div>
          <button onClick={() => handleBuyItem(key)} disabled={points < item.price || isLoading}
            className="pixel-btn px-2 py-1 text-[10px] disabled:opacity-40"
            style={{ fontFamily: "'Press Start 2P'", background: '#ffe8c0', color: '#d06000', borderColor: '#d0a060' }}>
            {item.price}P
          </button>
        </div>
      ))}

      {/* Point Packs (현금 결제) */}
      <p className="text-[10px] mt-1" style={{ fontFamily: "'Press Start 2P'", color: '#805030' }}>포인트 충전</p>
      {POINT_PACKAGES.map(pkg => (
        <button key={pkg.id} onClick={() => handleBuyPoints(pkg.id)} disabled={isLoading}
          className="pixel-btn w-full p-2 text-[10px] flex justify-between disabled:opacity-40"
          style={{ fontFamily: "'Press Start 2P'", background: '#e8d0ff', color: '#6040a0', borderColor: '#a080c0' }}>
          <span>⭐ {pkg.points}P</span>
          <span>₩{pkg.price.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}
