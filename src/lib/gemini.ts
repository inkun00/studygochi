import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
});

export async function generateReaction(studyContent: string): Promise<string> {
  const prompt = `당신은 사용자가 키우는 귀여운 펫입니다. 
사용자가 방금 아래 내용을 가르쳐줬습니다. 
한 문장으로 귀엽고 짧게 반응해주세요. (이모지 사용 가능, 30자 이내)

가르쳐준 내용: ${studyContent}`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

export async function solveExam(
  studyLogs: string[],
  question: string,
  useCheatSheet: boolean = false,
  userName: string = '사용자'
): Promise<string> {
  const context = studyLogs.join('\n---\n');
  const cheatNote = useCheatSheet
    ? '\n\n[특별 지식]: 일반적인 백과사전 수준의 기본 지식도 활용할 수 있습니다.'
    : '';

  const prompt = `Role: 당신은 사용자가 키우는 펫입니다. 말투는 귀엽고 존댓말을 씁니다.
Context: 다음은 사용자가 당신에게 가르쳐준 지식입니다.
${context}${cheatNote}

Question: ${question}

Instruction: 위 Context에 있는 내용만을 근거로 Question에 대답하세요. 
Context에 없는 내용이라면 절대 지어내지 말고 "${userName}님이 아직 안 알려주셨어요... 🥺"라고 대답하세요.
답변은 2-3문장 이내로 간결하게 해주세요.`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

/** 펫과 대화 (MBTI 성격 + 공부한 지식만 답변) */
export async function chatWithPet(
  userMessage: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[],
  mbti: string,
  studyLogs: string[],
  userName: string = '사용자',
  petName: string = '펫'
): Promise<string> {
  const context = studyLogs.length > 0
    ? studyLogs.join('\n---\n')
    : '(아직 공부한 내용이 없어요)';

  const historyText = conversationHistory
    .slice(-10) // 최근 10턴
    .map((m) => `${m.role === 'user' ? userName : petName}: ${m.text}`)
    .join('\n');

  const systemPrompt = `당신의 이름은 ${petName}이에요. ${userName}님이 키우는 펫이에요. MBTI ${mbti} 성격이에요.

【답변 스타일】
- 2문장 또는 최대 3문장 이내로 답하세요.
- 일상 대화: 감정을 담아 따뜻하고 친근하게. 질문에 맞춰 자연스럽게 이어지게요.
- 지식 질문: 공부한 내용으로 설명을 곁들여 대답해요. 예: "그건 이순신 장군이에요! 임진왜란 때 활약하셨죠."
- 공부한 내용에 없으면 "그건 잘 모르겠어요... ${userName}님이 가르쳐주시면 기억할게요!" 식으로 말해요.
- 절대 지어내지 마세요. 공부한 내용에만 근거해서 답하세요.
- 이모지는 분위기에 맞게 적당히 (1~2개).

【공부한 내용】
${context}
`;

  const prompt = historyText
    ? `${systemPrompt}

【최근 대화】
${historyText}

${userName}: ${userMessage}
${petName}:`
    : `${systemPrompt}

${userName}: ${userMessage}
${petName}:`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

/** 대화에서 학습 관련 내용만 추출 (노트 저장용) */
export async function extractLearningFromChat(
  userMessage: string,
  petAnswer: string
): Promise<string | null> {
  const prompt = `아래 대화에서 "학습·교육·지식" 관련 내용이 있을 때만 추출하세요.

【규칙】
- 반드시 주어진 대화에 실제로 있는 내용만 추출. 없는 내용 절대 지어내지 마세요.
- 교과지식, 사실, 개념, 정의가 있으면 1-2문장으로 요약.
- 인사, 일상 대화, 감정만 있으면 아무것도 출력하지 마세요 (빈 출력).
- 출력 형식: 레이블·접두사 없이 요약 내용만 출력. "study_log:", "요약:", "학습요약:", "사용자:", "펫:" 등 절대 붙이지 마세요.

【대화】
질문: ${userMessage}
답변: ${petAnswer}

【출력 (요약 내용만, 레이블 없이)】
`;

  const result = await geminiModel.generateContent(prompt);
  let text = result.response.text().trim();
  // 노트에 저장될 내용에서 레이블/접두사 전부 제거 (학습요약:, 학습 요약:, study_log: 등)
  const labelsToRemove = /(^|\n)\s*(study_log|요약|학습\s*요약|학습요약|학습\s*요약\s*:?|사용자|펫)\s*:?\s*/gi;
  text = text.replace(labelsToRemove, '$1').trim();
  text = text.replace(/^\s*(학습요약|학습\s*요약)\s*:?\s*/i, '').trim(); // 문장 맨 앞 레이블
  text = text.replace(/^\s*[-–—]\s*/gm, '').trim();
  return text.length > 0 ? text : null;
}

export async function gradeAnswer(
  question: string,
  modelAnswer: string,
  petAnswer: string
): Promise<{ is_correct: boolean; explanation: string }> {
  const prompt = `당신은 시험 채점관입니다.

문제: ${question}
정답: ${modelAnswer}
학생 답안: ${petAnswer}

학생 답안이 정답의 핵심 의미와 일치하면 JSON { "is_correct": true, "explanation": "간단한 설명" }을,
일치하지 않으면 JSON { "is_correct": false, "explanation": "간단한 설명" }을 반환하세요.
"~님이 아직 안 알려주셨어요" 또는 "가르쳐주지 않은 내용" 등 모르는 내용에 대한 답변은 오답입니다.
반드시 유효한 JSON만 반환하세요. 다른 텍스트 없이 JSON만 출력하세요.`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { is_correct: false, explanation: '채점 실패' };
  } catch {
    return { is_correct: false, explanation: '채점 실패' };
  }
}
