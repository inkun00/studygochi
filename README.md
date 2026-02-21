# StudyGotchi - AI 학습 펫 키우기

내가 공부한 내용을 학습 데이터로 삼아 성장하고, AI로 시험을 치르는 다마고치.

## 핵심 기능

- **공부하기**: 펫에게 지식을 가르치면 학습 데이터로 저장
- **AI 시험**: 교사가 출제한 문제를 펫이 Gemini AI로 풀이 (가르쳐준 내용만 활용)
- **자동 채점**: Gemini AI가 펫의 답변을 자동으로 채점
- **펫 육성**: 시험 결과에 따른 경험치 획득 → 레벨업 → 진화
- **상점**: 부활 포션, 컨닝 페이퍼(AI 버프 아이템) 등
- **교실**: 교사가 교실 생성, 학생이 코드로 참가

## 기술 스택

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, TypeScript
- **Backend**: Supabase (Auth, DB, RLS), Next.js API Routes
- **AI**: Google Gemini 2.0 Flash (텍스트 분석 및 문제 풀이)
- **State**: Zustand
- **Payment**: Toss Payments (Widget & API)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 수정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key
```

### 3. Supabase 데이터베이스 설정

Supabase 대시보드의 SQL Editor에서 `supabase-schema.sql` 파일의 내용을 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── api/gemini/       # Gemini AI API Routes (react, exam, grade)
│   ├── api/payments/     # Toss Payments API Route
│   ├── auth/             # 로그인, 회원가입, OAuth Callback
│   └── main/             # 메인 앱 (study, exam, classroom, shop)
├── components/
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── exam/             # 시험 패널, 출제 폼
│   ├── pet/              # 펫 디스플레이
│   ├── shop/             # 상점 패널
│   ├── study/            # 학습 에디터, 기록 목록
│   └── ui/               # 공통 UI (Button, Card, Modal 등)
├── lib/
│   ├── constants.ts      # 게임 상수 (배고픔, 경험치 등)
│   ├── gemini.ts         # Gemini AI 유틸리티
│   ├── pet-utils.ts      # 펫 상태 계산 유틸리티
│   ├── supabase-*.ts     # Supabase 클라이언트
│   └── types.ts          # TypeScript 타입 정의
└── store/
    └── useStore.ts       # Zustand 전역 상태
```

## AI 프롬프트 설계

- **학습 반응**: 펫이 새로운 지식에 대해 귀여운 한마디 반응
- **시험 풀이**: 사용자가 가르쳐준 Context만으로 답변 (RAG)
- **자동 채점**: 의미 기반 비교로 정답/오답 판별

## 라이센스

MIT
