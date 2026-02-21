import { NextRequest, NextResponse } from 'next/server';
import { generateReaction } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '학습 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const reaction = await generateReaction(content);
    return NextResponse.json({ reaction });
  } catch (error) {
    console.error('Gemini reaction error:', error);
    return NextResponse.json(
      { error: 'AI 반응 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
