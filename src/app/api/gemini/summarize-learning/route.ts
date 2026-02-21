import { NextRequest, NextResponse } from 'next/server';
import { extractLearningFromChat } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, petAnswer } = await request.json();

    if (!userMessage || !petAnswer) {
      return NextResponse.json(
        { error: '질문과 답변이 필요합니다.' },
        { status: 400 }
      );
    }

    const summary = await extractLearningFromChat(
      String(userMessage).trim(),
      String(petAnswer).trim()
    );

    return NextResponse.json({ summary: summary || null });
  } catch (error) {
    console.error('Gemini summarize error:', error);
    return NextResponse.json(
      { error: '요약에 실패했습니다.' },
      { status: 500 }
    );
  }
}
