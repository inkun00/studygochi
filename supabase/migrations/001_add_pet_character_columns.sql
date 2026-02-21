-- 펫 테이블에 캐릭터/방 정보 컬럼 추가
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- 새로고침 후 캐릭터가 유지되지 않는다면 이 마이그레이션을 실행해주세요.

ALTER TABLE pets ADD COLUMN IF NOT EXISTS character_sprite text NOT NULL DEFAULT 'rabbit';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS room_type text NOT NULL DEFAULT 'bedroom';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS nutrition jsonb NOT NULL DEFAULT '{"carbs":50,"protein":50,"fat":50,"vitamin":50,"mineral":50}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS food_inventory jsonb NOT NULL DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS points int NOT NULL DEFAULT 0;
