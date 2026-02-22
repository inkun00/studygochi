import { create } from 'zustand';
import { Pet, UserProfile, StudyLog, Exam, ExamResult } from '@/lib/types';
import { MAX_STUDY_LOGS } from '@/lib/constants';

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Pet
  pet: Pet | null;
  setPet: (pet: Pet | null) => void;

  // Study
  studyLogs: StudyLog[];
  setStudyLogs: (logs: StudyLog[]) => void;
  addStudyLog: (log: StudyLog) => void;

  // Exam
  activeExam: Exam | null;
  setActiveExam: (exam: Exam | null) => void;
  examResults: ExamResult[];
  setExamResults: (results: ExamResult[]) => void;

  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  petMessage: string;
  setPetMessage: (msg: string) => void;

  // Session (Last_Login 기반 배고픔 - 세션 동안에만 차감)
  sessionStartAt: number | null;
  setSessionStartAt: (t: number | null) => void;

  // 대화 메시지 (5번 전에 나갔다 오면 이어가기)
  chatMessages: { id: string; role: 'user' | 'pet'; text: string; timestamp: number }[];
  setChatMessages: (messages: { id: string; role: 'user' | 'pet'; text: string; timestamp: number }[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  pet: null,
  setPet: (pet) => set({ pet }),

  studyLogs: [],
  setStudyLogs: (studyLogs) => set({ studyLogs }),
  addStudyLog: (log) =>
    set((state) => ({
      studyLogs: [log, ...state.studyLogs].slice(0, MAX_STUDY_LOGS),
    })),

  activeExam: null,
  setActiveExam: (activeExam) => set({ activeExam }),
  examResults: [],
  setExamResults: (examResults) => set({ examResults }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  petMessage: '',
  setPetMessage: (petMessage) => set({ petMessage }),

  sessionStartAt: null,
  setSessionStartAt: (sessionStartAt) => set({ sessionStartAt }),

  chatMessages: [],
  setChatMessages: (chatMessages) => set({ chatMessages }),
}));
