import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { POINT_PACKAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { packageId } = await request.json();
    const pkg = POINT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: '잘못된 상품입니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const { error } = await supabase.from('payments').insert({
      order_id: orderId,
      amount: pkg.price,
      user_id: user.id,
      status: 'READY',
    });
    if (error) {
      return NextResponse.json({ error: '주문 생성 실패' }, { status: 500 });
    }

    return NextResponse.json({
      orderId,
      amount: pkg.price,
      orderName: pkg.label,
      points: pkg.points,
    });
  } catch (e) {
    console.error('Payment create error:', e);
    return NextResponse.json(
      { error: '주문 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
