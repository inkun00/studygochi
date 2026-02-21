/**
 * Fetch 엔드포인트 Allowlist
 * 모든 fetch 호출은 이 목록의 URL을 사용해야 합니다.
 * 새 API 호출 추가 시 반드시 여기에 등록하세요.
 */

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

export const FETCH_ALLOWLIST = {
  /** 내부 API */
  api: {
    geminiReact: () => `${BASE}/api/gemini/react`,
    geminiExam: () => `${BASE}/api/gemini/exam`,
    geminiGrade: () => `${BASE}/api/gemini/grade`,
    geminiChat: () => `${BASE}/api/gemini/chat`,
    geminiSummarizeLearning: () => `${BASE}/api/gemini/summarize-learning`,
    paymentsCreate: () => `${BASE}/api/payments/create`,
    paymentsConfirm: () => `${BASE}/api/payments/confirm`,
  },
  /** 외부 API */
  external: {
    tossPaymentsConfirm: 'https://api.tosspayments.com/v1/payments/confirm',
  },
} as const;

export type FetchEndpoint = keyof typeof FETCH_ALLOWLIST.api | keyof typeof FETCH_ALLOWLIST.external;
