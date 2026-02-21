-- 펫 사망 시점 기록 (2일 패널티 계산용)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS died_at timestamptz;
