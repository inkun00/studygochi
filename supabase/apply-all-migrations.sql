-- 모든 마이그레이션 통합
-- Supabase Dashboard > SQL Editor 에서 이 파일 내용을 붙여넣고 실행하세요.
-- https://supabase.com/dashboard/project/eawrpmlbpyxwbjjlvbqo/sql/new

-- 001: 펫 캐릭터/방 컬럼
ALTER TABLE pets ADD COLUMN IF NOT EXISTS character_sprite text NOT NULL DEFAULT 'rabbit';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS room_type text NOT NULL DEFAULT 'bedroom';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS nutrition jsonb NOT NULL DEFAULT '{"carbs":50,"protein":50,"fat":50,"vitamin":50,"mineral":50}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS food_inventory jsonb NOT NULL DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS points int NOT NULL DEFAULT 0;

-- 002: exams room_id
ALTER TABLE exams ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES classrooms(id);

-- 003: last_studied_at
ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_studied_at timestamptz default now();
UPDATE pets SET last_studied_at = created_at WHERE last_studied_at IS NULL;

-- 004: MBTI
ALTER TABLE pets ADD COLUMN IF NOT EXISTS mbti text DEFAULT 'ENFP';

-- 004b: study_logs 삭제 정책
DROP POLICY IF EXISTS "Users can delete own study_logs" ON study_logs;
CREATE POLICY "Users can delete own study_logs" ON study_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 005: rabbit 전용 (BIRD/CAT/FOX/RACCOON 폐기)
UPDATE pets SET character_sprite = 'rabbit' WHERE character_sprite != 'rabbit' OR character_sprite IS NULL;
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_character_sprite_check;
ALTER TABLE pets ADD CONSTRAINT pets_character_sprite_check CHECK (character_sprite = 'rabbit');
ALTER TABLE pets ALTER COLUMN character_sprite SET DEFAULT 'rabbit';

-- 006: 7종 캐릭터 스프라이트 허용
UPDATE pets SET character_sprite = 'rabbit' WHERE character_sprite IS NULL OR character_sprite NOT IN ('rabbit','tiger','dog','monkey','elephant','giraffe','panda');
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_character_sprite_check;
ALTER TABLE pets ADD CONSTRAINT pets_character_sprite_check CHECK (character_sprite IN ('rabbit','tiger','dog','monkey','elephant','giraffe','panda'));
ALTER TABLE pets ALTER COLUMN character_sprite SET DEFAULT 'rabbit';
