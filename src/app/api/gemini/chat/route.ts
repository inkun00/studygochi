import { NextRequest, NextResponse } from 'next/server';
import { chatWithPet } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory = [], mbti, studyLogs = [], userName, petName } = await request.json();

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    const answer = await chatWithPet(
      userMessage.trim(),
      Array.isArray(conversationHistory) ? conversationHistory : [],
      mbti ?? 'ENFP',
      Array.isArray(studyLogs) ? studyLogs : [],
      typeof userName === 'string' && userName.trim() ? userName.trim() : '사용자',
      typeof petName === 'string' && petName.trim() ? petName.trim() : '펫'
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Gemini chat error:', error);
    return NextResponse.json(
      { error: '대화에 실패했어요. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
