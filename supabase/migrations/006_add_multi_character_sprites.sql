-- 006: 7종 캐릭터 스프라이트 허용 (rabbit, tiger, dog, monkey, elephant, giraffe, panda)
UPDATE pets SET character_sprite = 'rabbit' WHERE character_sprite IS NULL OR character_sprite NOT IN ('rabbit','tiger','dog','monkey','elephant','giraffe','panda');
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_character_sprite_check;
ALTER TABLE pets ADD CONSTRAINT pets_character_sprite_check CHECK (character_sprite IN ('rabbit','tiger','dog','monkey','elephant','giraffe','panda'));
ALTER TABLE pets ALTER COLUMN character_sprite SET DEFAULT 'rabbit';
