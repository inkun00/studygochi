'use client';

import Link from 'next/link';

export default function PaymentFailPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #ffe8c8 0%, #f0c890 100%)' }}>
      <div className="text-center p-6 rounded-lg ui-panel max-w-sm" style={{ fontFamily: "'Press Start 2P'" }}>
        <p className="text-[14px] mb-4" style={{ color: '#c03030' }}>결제 실패</p>
        <p className="text-[10px] mb-6" style={{ color: '#805030' }}>결제가 취소되었거나 실패했습니다.</p>
        <Link href="/main/shop" className="pixel-btn px-4 py-2 text-[12px]">상점으로</Link>
      </div>
    </div>
  );
}
