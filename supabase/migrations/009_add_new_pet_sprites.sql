-- 009: 15종 신규 캐릭터 스프라이트 허용
-- squirrel, sloth, wolf, mouse, hedgehog, koala, bear, horse, pig,
-- meerkat, dessertFox, racoon, deer, cat, lion
UPDATE pets SET character_sprite = 'rabbit'
  WHERE character_sprite IS NULL
    OR character_sprite NOT IN (
      'rabbit','tiger','dog','monkey','elephant','giraffe','panda',
      'squirrel','sloth','wolf','mouse','hedgehog','koala','bear','horse','pig',
      'meerkat','dessertFox','racoon','deer','cat','lion'
    );
ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_character_sprite_check;
ALTER TABLE pets ADD CONSTRAINT pets_character_sprite_check CHECK (
  character_sprite IN (
    'rabbit','tiger','dog','monkey','elephant','giraffe','panda',
    'squirrel','sloth','wolf','mouse','hedgehog','koala','bear','horse','pig',
    'meerkat','dessertFox','racoon','deer','cat','lion'
  )
);
ALTER TABLE pets ALTER COLUMN character_sprite SET DEFAULT 'rabbit';
