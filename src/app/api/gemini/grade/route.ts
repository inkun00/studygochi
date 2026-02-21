import { NextRequest, NextResponse } from 'next/server';
import { gradeAnswer } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { question, modelAnswer, petAnswer } = await request.json();

    if (!question || !modelAnswer || !petAnswer) {
      return NextResponse.json(
        { error: '문제, 정답, 펫 답변이 모두 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await gradeAnswer(question, modelAnswer, petAnswer);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Gemini grade error:', error);
    return NextResponse.json(
      { error: 'AI 채점에 실패했습니다.' },
      { status: 500 }
    );
  }
}
