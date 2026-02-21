-- 펫 테이블에 last_studied_at 컬럼 추가 (지능 감소 기준)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_studied_at timestamptz default now();
UPDATE pets SET last_studied_at = created_at WHERE last_studied_at IS NULL;
