# 📝 PRD: StudyGotchi (AI Powered)

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **제품명** | StudyGotchi |
| **한줄 소개** | 내가 공부한 내용을 학습 데이터로 삼아 성장하고, AI로 시험을 치르는 다마고치. |
| **핵심 로직** | User Input (노트) → Gemini API (Context Analysis) → Exam Result (Reward). |

### 기술 스택
- **Frontend:** Next.js (App Router), Tailwind CSS, PWA 지원
- **Backend:** Supabase (Auth, DB, Realtime), Next.js API Routes (Serverless)
- **AI:** Google Gemini API (텍스트 분석 및 문제 풀이)
- **Payment:** Toss Payments (Widget & API)

---

## 2. 유저 시나리오 (AI Flow)

1. **학습 (Input):** 사용자가 "임진왜란은 1592년에 일어났어."라고 펫에게 입력
2. **데이터화:** 텍스트가 Supabase `study_logs` 테이블에 저장
3. **시험 출제:** 교사가 "임진왜란의 발발 연도는?" 문제 출제
4. **AI 처리 (Gemini):**
   - `study_logs` + 시험 문제를 Gemini에 전송
   - 프롬프트: "Context에 있는 내용만 사용하여 질문에 답해. 모르면 '배운 적 없어요'라고 해."
5. **결과 판정:** 정답 비교 → 점수 → 경험치 → 레벨업

---

## 3. 기능 상세 명세 (Specs)

### 3.1. 공부 시스템 (Knowledge Injection)

| 요구사항 | 구현 | 비고 |
|----------|------|------|
| 노트 작성 | ○ | 마크다운 에디터 제공 |
| 글자 수 제한 500자 | ○ | 토큰 비용 관리 |
| 펫 반응 (Gemini) | ○ | 입력 완료 시 짧은 리액션 생성 |

### 3.2. 시험 시스템 (AI-driven Exam)

| 요구사항 | 구현 | 비고 |
|----------|------|------|
| 교실 Exam Session 활성화 | ○ | 교사가 활성화 시 학생 화면에 시험지 팝업 |
| 문제 풀이 (Gemini RAG) | ○ | Context + Question → Answer |
| 채점 (Gemini Judge) | ○ | 정답/오답 AI 판별 |

### 3.3. 육성 및 상태 (State Management)

| 요구사항 | 구현 | 비고 |
|----------|------|------|
| 지능(Intelligence) | ○ | 시험 점수 누적 |
| 배고픔(Hunger) | ○ | last_fed_at 기반 시간당 차감 |
| 죽음/유령 | ○ | 배고픔 0 → 공부/시험 불가 |

### 3.4. 결제 (Toss Payments) - 수익화

| 요구사항 | 구현 | 비고 |
|----------|------|------|
| 젬(Gem) | ○ | 유료 재화 |
| 부활 포션 | ○ | 유령 상태 해제 |
| 컨닝 페이퍼 | ○ | 시험 시 Context 확장 아이템 |
| Toss Payments 연동 | ○ | 결제 성공 시 gems 업데이트 |

---

## 4. 데이터베이스 스키마 (Supabase)

```sql
-- study_logs, exams, exam_results, payments, profiles, pets, classrooms, classroom_members
-- (기존 supabase-schema.sql 참조)
```

---

## 5. 테크니컬 마일스톤 (Milestones)

### Phase 1: 기본 골격 및 AI 연동 ✅
- [x] Next.js + Supabase Auth
- [x] 펫 생성 및 공부하기 UI
- [x] Gemini API 연동 (RAG)

### Phase 2: 교실 및 시험 루프 ✅
- [x] 교사: 문제 출제
- [x] 학생: 교실 입장, 시험 UI
- [x] Gemini 채점 자동화

### Phase 3: 상점 및 결제
- [x] Toss Payments 위젯 연동
- [x] 결제 후 보석 지급
- [x] 아이템(부활, 컨닝페이퍼) 사용

### Phase 4: 폴리싱
- [x] 도트(Pixel) 그래픽
- [ ] PWA, 모바일 반응형

---

## 6. 개발 시 고려사항

1. **비용 최적화:** 최근 5~10개 학습 기록만 Gemini에 전송
2. **프롬프트 보안:** API 호출은 Server-side (API Route)에서만
3. **UX:** AI 응답 대기 시 펫 "고민하는" 애니메이션
