import { NextRequest, NextResponse } from 'next/server';
import { solveExam } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { studyLogs, question, useCheatSheet, userName } = await request.json();

    if (!question || !Array.isArray(studyLogs)) {
      return NextResponse.json(
        { error: '문제와 학습 기록이 필요합니다.' },
        { status: 400 }
      );
    }

    const answer = await solveExam(
      studyLogs,
      question,
      useCheatSheet ?? false,
      typeof userName === 'string' && userName.trim() ? userName.trim() : '사용자'
    );
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Gemini exam error:', error);
    return NextResponse.json(
      { error: 'AI 시험 풀이에 실패했습니다.' },
      { status: 500 }
    );
  }
}
