import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { GEM_PACKAGES } from '@/lib/constants';
import { FETCH_ALLOWLIST } from '@/lib/fetch-allowlist';

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: '결제 설정 오류' }, { status: 500 });
    }

    const response = await fetch(FETCH_ALLOWLIST.external.tossPaymentsConfirm, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || '결제 확인 실패' },
        { status: response.status }
      );
    }

    const totalAmount = Number(data.totalAmount) || amount;
    const pkg = GEM_PACKAGES.find((p) => p.price === totalAmount);
    if (!pkg) {
      return NextResponse.json({ error: '등록되지 않은 상품입니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: payment } = await supabase.from('payments').select('user_id, status').eq('order_id', orderId).single();
    if (!payment?.user_id) {
      return NextResponse.json({ error: '주문 정보를 찾을 수 없습니다.' }, { status: 404 });
    }
    if (payment.status === 'DONE') {
      return NextResponse.json({ error: '이미 처리된 결제입니다.', success: true }, { status: 200 });
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser || authUser.id !== payment.user_id) {
      return NextResponse.json({ error: '본인의 결제만 확인할 수 있습니다.' }, { status: 403 });
    }

    const { data: profile } = await supabase.from('profiles').select('gems').eq('id', payment.user_id).single();
    const newGems = (profile?.gems || 0) + pkg.gems;

    await supabase.from('profiles').update({ gems: newGems }).eq('id', payment.user_id);
    await supabase.from('payments').update({ status: 'DONE' }).eq('order_id', orderId);

    return NextResponse.json({
      success: true,
      orderId: data.orderId,
      amount: totalAmount,
      gems: pkg.gems,
      newGems,
      userId: payment.user_id,
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
