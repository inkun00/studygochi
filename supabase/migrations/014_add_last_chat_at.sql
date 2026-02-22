-- 대화 전용 쿨다운: 마지막 대화 완료 시점 (공부 쿨다운과 별도 관리)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_chat_at timestamptz;
