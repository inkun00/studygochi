import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { petId, hunger, nutrition, last_fed_at, last_played_at, last_studied_at, last_activity_at, last_chat_at } = body;

    if (!petId || typeof hunger !== 'number') {
      return NextResponse.json({ error: '유효하지 않은 데이터' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      hunger: Math.max(0, Math.min(100, hunger)),
      last_fed_at: last_fed_at || new Date().toISOString(),
    };
    if (nutrition && typeof nutrition === 'object') {
      updates.nutrition = nutrition;
    }
    if (last_played_at) {
      updates.last_played_at = last_played_at;
    }
    if (last_studied_at) {
      updates.last_studied_at = last_studied_at;
    }
    if (last_activity_at) {
      updates.last_activity_at = last_activity_at;
    }
    if (last_chat_at) {
      updates.last_chat_at = last_chat_at;
    }

    const { error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', petId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Pet save-state error:', error);
      return NextResponse.json({ error: '저장 실패' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Pet save-state error:', e);
    return NextResponse.json(
      { error: '저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
