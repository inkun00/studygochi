-- 펫 테이블에 last_played_at 컬럼 추가 (심심 지수 계산 기준)
-- 놀기 안 하면 시간당 심심 지수가 증가
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_played_at timestamptz default now();
UPDATE pets SET last_played_at = created_at WHERE last_played_at IS NULL;
