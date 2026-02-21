-- rabbit 전용 (BIRD/CAT/FOX/RACCOON 폐기)
UPDATE pets SET character_sprite = 'rabbit' WHERE character_sprite IS NULL OR character_sprite != 'rabbit';
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_character_sprite_check;
ALTER TABLE pets ADD CONSTRAINT pets_character_sprite_check CHECK (character_sprite = 'rabbit');
ALTER TABLE pets ALTER COLUMN character_sprite SET DEFAULT 'rabbit';
