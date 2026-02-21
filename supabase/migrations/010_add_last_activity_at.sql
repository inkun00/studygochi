-- 공부/대화 1시간 쿨다운용: 마지막 공부 또는 대화 완료 시점
-- NULL이면 즉시 공부/대화 가능, 값이 있으면 1시간 경과 후 가능
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
